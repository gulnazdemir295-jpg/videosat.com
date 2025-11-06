/**
 * Monitoring Middleware
 * Request metrics, performance tracking ve monitoring
 */

const logger = require('../utils/logger');

// In-memory metrics (production'da Redis veya database kullanılmalı)
const metrics = {
  requests: {
    total: 0,
    byMethod: {},
    byEndpoint: {},
    byStatus: {},
    errors: 0
  },
  performance: {
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    responseTimes: []
  },
  uptime: {
    startTime: Date.now(),
    lastRequest: null
  }
};

/**
 * Request metrics middleware
 */
const requestMetrics = (req, res, next) => {
  const startTime = Date.now();

  // Response finish event
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const method = req.method;
    const endpoint = req.originalUrl.split('?')[0]; // Query string'i kaldır
    const status = res.statusCode;

    // Metrics güncelle
    metrics.requests.total++;
    metrics.requests.byMethod[method] = (metrics.requests.byMethod[method] || 0) + 1;
    metrics.requests.byEndpoint[endpoint] = (metrics.requests.byEndpoint[endpoint] || 0) + 1;
    metrics.requests.byStatus[status] = (metrics.requests.byStatus[status] || 0) + 1;

    if (status >= 400) {
      metrics.requests.errors++;
    }

    // Performance metrics
    metrics.performance.responseTimes.push(responseTime);
    if (metrics.performance.responseTimes.length > 1000) {
      metrics.performance.responseTimes.shift(); // Son 1000 request'i tut
    }

    metrics.performance.minResponseTime = Math.min(metrics.performance.minResponseTime, responseTime);
    metrics.performance.maxResponseTime = Math.max(metrics.performance.maxResponseTime, responseTime);

    // Average response time
    const sum = metrics.performance.responseTimes.reduce((a, b) => a + b, 0);
    metrics.performance.averageResponseTime = sum / metrics.performance.responseTimes.length;

    metrics.uptime.lastRequest = Date.now();

    // Slow request warning
    if (responseTime > 1000) {
      logger.warn('Slow request detected', {
        method,
        endpoint,
        responseTime: `${responseTime}ms`,
        status
      });
    }
  });

  next();
};

/**
 * Get metrics
 */
function getMetrics() {
  const uptime = Date.now() - metrics.uptime.startTime;
  
  return {
    requests: {
      ...metrics.requests,
      errorRate: metrics.requests.total > 0 
        ? (metrics.requests.errors / metrics.requests.total * 100).toFixed(2) + '%'
        : '0%'
    },
    performance: {
      ...metrics.performance,
      averageResponseTime: Math.round(metrics.performance.averageResponseTime) + 'ms',
      minResponseTime: metrics.performance.minResponseTime === Infinity 
        ? 'N/A' 
        : metrics.performance.minResponseTime + 'ms',
      maxResponseTime: metrics.performance.maxResponseTime + 'ms'
    },
    uptime: {
      startTime: new Date(metrics.uptime.startTime).toISOString(),
      lastRequest: metrics.uptime.lastRequest 
        ? new Date(metrics.uptime.lastRequest).toISOString()
        : null,
      uptimeSeconds: Math.floor(uptime / 1000),
      uptimeFormatted: formatUptime(uptime)
    }
  };
}

/**
 * Reset metrics
 */
function resetMetrics() {
  metrics.requests = {
    total: 0,
    byMethod: {},
    byEndpoint: {},
    byStatus: {},
    errors: 0
  };
  metrics.performance = {
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    responseTimes: []
  };
  metrics.uptime.startTime = Date.now();
  metrics.uptime.lastRequest = null;
}

/**
 * Format uptime
 */
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

module.exports = {
  requestMetrics,
  getMetrics,
  resetMetrics
};

