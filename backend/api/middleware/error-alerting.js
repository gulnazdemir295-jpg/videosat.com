/**
 * Error Alerting Middleware
 * 
 * Production'da hata durumlarında Slack/Email alert gönderir.
 */

const logger = require('../utils/logger');

// Configuration
const ALERT_ENABLED = process.env.ERROR_ALERT_ENABLED === 'true';
const ALERT_EMAIL = process.env.ALERT_EMAIL || 'admin@basvideo.com';
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const ALERT_THRESHOLD = parseInt(process.env.ALERT_ERROR_THRESHOLD || '5', 10); // 5 dakikada 5 hata

// Error tracking
const errorCounts = new Map(); // key: errorType, value: { count, firstOccurrence }

/**
 * Error'ı alert sistemine gönder
 */
async function sendErrorAlert(error, context = {}) {
  if (!ALERT_ENABLED) {
    return;
  }

  try {
    const errorType = error.name || 'UnknownError';
    const errorMessage = error.message || 'Unknown error';
    const timestamp = new Date().toISOString();

    // Error count tracking
    const now = Date.now();
    const errorKey = `${errorType}:${errorMessage.substring(0, 50)}`;
    
    if (!errorCounts.has(errorKey)) {
      errorCounts.set(errorKey, { count: 0, firstOccurrence: now });
    }
    
    const errorData = errorCounts.get(errorKey);
    errorData.count++;
    
    // Threshold kontrolü (spam önleme)
    const timeDiff = now - errorData.firstOccurrence;
    if (errorData.count < ALERT_THRESHOLD || timeDiff < 5 * 60 * 1000) {
      // Threshold'a ulaşmadıysa veya 5 dakika geçmediyse alert gönderme
      return;
    }
    
    // Reset counter
    errorCounts.delete(errorKey);

    // Alert payload
    const alertPayload = {
      timestamp,
      error: {
        name: errorType,
        message: errorMessage,
        stack: error.stack
      },
      context: {
        ...context,
        environment: process.env.NODE_ENV || 'development',
        hostname: require('os').hostname()
      },
      severity: determineSeverity(error),
      count: errorData.count
    };

    // Email alert (basit implementation)
    if (ALERT_EMAIL) {
      await sendEmailAlert(alertPayload);
    }

    // Slack alert
    if (SLACK_WEBHOOK_URL) {
      await sendSlackAlert(alertPayload);
    }

    // Log
    logger.error('Error alert sent', alertPayload);
  } catch (alertError) {
    // Alert gönderme hatası - sessizce logla
    logger.error('Error alerting failed', { error: alertError.message });
  }
}

/**
 * Error severity belirle
 */
function determineSeverity(error) {
  if (error.statusCode >= 500) {
    return 'critical';
  } else if (error.statusCode >= 400) {
    return 'warning';
  } else if (error.name === 'ValidationError') {
    return 'info';
  }
  return 'error';
}

/**
 * Email alert gönder
 */
async function sendEmailAlert(payload) {
  // Basit email gönderimi (production'da SendGrid veya SES kullanılmalı)
  const emailContent = `
🚨 Error Alert - ${payload.severity.toUpperCase()}

Time: ${payload.timestamp}
Error: ${payload.error.name}
Message: ${payload.error.message}
Environment: ${payload.context.environment}
Hostname: ${payload.context.hostname}
Count: ${payload.count}

Stack Trace:
${payload.error.stack}

Context:
${JSON.stringify(payload.context, null, 2)}
  `.trim();

  // Production'da SendGrid veya AWS SES kullanılmalı
  // Şimdilik sadece log
  logger.warn('Email alert (not sent - implement SendGrid/SES)', {
    to: ALERT_EMAIL,
    subject: `🚨 ${payload.severity.toUpperCase()}: ${payload.error.name}`,
    body: emailContent
  });

  // TODO: SendGrid integration
  // const emailService = require('../services/email-service');
  // await emailService.sendEmail({
  //   to: ALERT_EMAIL,
  //   subject: `🚨 ${payload.severity.toUpperCase()}: ${payload.error.name}`,
  //   html: emailContent
  // });
}

/**
 * Slack alert gönder
 */
async function sendSlackAlert(payload) {
  try {
    const https = require('https');
    const url = require('url');

    const slackMessage = {
      text: `🚨 *${payload.severity.toUpperCase()}*: ${payload.error.name}`,
      attachments: [
        {
          color: payload.severity === 'critical' ? 'danger' : 'warning',
          fields: [
            {
              title: 'Error',
              value: payload.error.message,
              short: false
            },
            {
              title: 'Environment',
              value: payload.context.environment,
              short: true
            },
            {
              title: 'Hostname',
              value: payload.context.hostname,
              short: true
            },
            {
              title: 'Count',
              value: payload.count.toString(),
              short: true
            },
            {
              title: 'Timestamp',
              value: payload.timestamp,
              short: true
            }
          ]
        }
      ]
    };

    const parsedUrl = url.parse(SLACK_WEBHOOK_URL);
    const postData = JSON.stringify(slackMessage);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`Slack API error: ${res.statusCode}`));
        }
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  } catch (error) {
    logger.error('Slack alert failed', { error: error.message });
  }
}

/**
 * Error alerting middleware
 */
function errorAlertingMiddleware(error, req, res, next) {
  // Error'ı alert sistemine gönder
  sendErrorAlert(error, {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: {
      'user-agent': req.get('user-agent'),
      'x-forwarded-for': req.get('x-forwarded-for')
    },
    userId: req.user?.email || 'anonymous',
    ip: req.ip || req.connection.remoteAddress
  });

  // Next middleware'e geç
  next(error);
}

/**
 * Critical error alert (immediate)
 */
async function sendCriticalAlert(error, context = {}) {
  if (!ALERT_ENABLED) {
    return;
  }

  const alertPayload = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name || 'CriticalError',
      message: error.message || 'Critical error occurred',
      stack: error.stack
    },
    context: {
      ...context,
      environment: process.env.NODE_ENV || 'development',
      hostname: require('os').hostname()
    },
    severity: 'critical'
  };

  // Immediate alerts (threshold yok)
  if (ALERT_EMAIL) {
    await sendEmailAlert(alertPayload);
  }

  if (SLACK_WEBHOOK_URL) {
    await sendSlackAlert(alertPayload);
  }

  logger.error('Critical alert sent', alertPayload);
}

module.exports = {
  errorAlertingMiddleware,
  sendErrorAlert,
  sendCriticalAlert
};

