/**
 * Email Service
 * SMTP email gönderme servisi
 */

const nodemailer = require('nodemailer');

// Email configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'noreply@basvideo.com';

// Create transporter
let transporter = null;

if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  // Verify connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ SMTP connection error:', error);
    } else {
      console.log('✅ SMTP server is ready to send emails');
    }
  });
} else {
  console.warn('⚠️ SMTP credentials not configured. Email service disabled.');
}

/**
 * Send email
 */
async function sendEmail(options) {
  const {
    to,
    subject,
    text,
    html,
    from = SMTP_FROM,
    attachments = []
  } = options;

  if (!transporter) {
    console.warn('⚠️ Email service not configured');
    return { success: false, error: 'Email service not configured' };
  }

  if (!to || !subject) {
    return { success: false, error: 'To and subject are required' };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text: text || '',
      html: html || text || '',
      attachments
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(userEmail, userName) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>VideoSat'e Hoş Geldiniz!</h1>
        </div>
        <div class="content">
          <p>Merhaba ${userName || 'Değerli Kullanıcı'},</p>
          <p>VideoSat platformuna kaydolduğunuz için teşekkür ederiz!</p>
          <p>Hesabınızı kullanarak e-ticaret ve canlı yayın özelliklerinden faydalanabilirsiniz.</p>
          <p>Herhangi bir sorunuz varsa bizimle iletişime geçmekten çekinmeyin.</p>
          <p>İyi günler dileriz,<br>VideoSat Ekibi</p>
        </div>
        <div class="footer">
          <p>© 2025 VideoSat. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: userEmail,
    subject: 'VideoSat\'e Hoş Geldiniz!',
    html
  });
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(userEmail, resetToken, resetUrl) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Şifre Sıfırlama</h1>
        </div>
        <div class="content">
          <p>Merhaba,</p>
          <p>Şifre sıfırlama talebinde bulundunuz. Aşağıdaki bağlantıya tıklayarak yeni şifrenizi oluşturabilirsiniz:</p>
          <p style="text-align: center;">
            <a href="${resetUrl || `https://basvideo.com/reset-password?token=${resetToken}`}" class="button">Şifremi Sıfırla</a>
          </p>
          <p>Bu bağlantı 1 saat süreyle geçerlidir.</p>
          <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        </div>
        <div class="footer">
          <p>© 2025 VideoSat. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: userEmail,
    subject: 'VideoSat - Şifre Sıfırlama',
    html
  });
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmationEmail(userEmail, orderData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Sipariş Onayı</h1>
        </div>
        <div class="content">
          <p>Merhaba,</p>
          <p>Siparişiniz başarıyla alındı!</p>
          <div class="order-info">
            <p><strong>Sipariş No:</strong> ${orderData.orderId || 'N/A'}</p>
            <p><strong>Tutar:</strong> ${orderData.amount || 0} ${orderData.currency || 'TRY'}</p>
            <p><strong>Durum:</strong> ${orderData.status || 'Beklemede'}</p>
          </div>
          <p>Siparişinizin durumunu takip edebilirsiniz.</p>
        </div>
        <div class="footer">
          <p>© 2025 VideoSat. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: userEmail,
    subject: `VideoSat - Sipariş Onayı #${orderData.orderId || ''}`,
    html
  });
}

/**
 * Send notification email
 */
async function sendNotificationEmail(userEmail, notification) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${notification.title || 'Yeni Bildirim'}</h1>
        </div>
        <div class="content">
          <p>${notification.message || ''}</p>
        </div>
        <div class="footer">
          <p>© 2025 VideoSat. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: userEmail,
    subject: notification.title || 'VideoSat - Yeni Bildirim',
    html
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendNotificationEmail
};

