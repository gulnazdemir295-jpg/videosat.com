// Email Service - Mock Implementation
class EmailService {
    constructor() {
        this.sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
    }

    // Send email (mock)
    async sendEmail(to, subject, message, type = 'notification') {
        console.log(`📧 Email gönderiliyor: ${to}`);
        
        const email = {
            id: Date.now(),
            to: to,
            subject: subject,
            message: message,
            type: type,
            status: 'sent',
            sentAt: new Date().toISOString()
        };

        // Simulate API call
        await this.delay(500);

        this.sentEmails.push(email);
        this.saveEmails();

        console.log('✅ Email başarıyla gönderildi (simüle)');
        
        return {
            success: true,
            emailId: email.id,
            message: 'Email başarıyla gönderildi'
        };
    }

    // Send live stream invitation
    async sendInvitation(to, fromName, liveStreamUrl) {
        const subject = `Canlı Yayın Daveti - ${fromName}`;
        const message = `Merhaba,

${fromName} sizi canlı yayına davet ediyor.

${liveStreamUrl}

Lütfen bağlantıya tıklayarak katılın.

İyi günler,
VideoSat Platform`;

        return await this.sendEmail(to, subject, message, 'invitation');
    }

    // Send order confirmation
    async sendOrderConfirmation(to, orderNumber, orderDetails) {
        const subject = `Sipariş Onayı #${orderNumber}`;
        const message = `Siparişiniz başarıyla alındı!

Sipariş No: ${orderNumber}
Toplam: ${orderDetails.totalAmount} ₺

Detaylar:
${orderDetails.items.map(item => `- ${item.name} x${item.quantity}`).join('\n')}

Siparişinizi panelden takip edebilirsiniz.

Teşekkürler,
VideoSat Platform`;

        return await this.sendEmail(to, subject, message, 'order_confirmation');
    }

    // Send password reset
    async sendPasswordReset(to, resetLink) {
        const subject = 'Şifre Sıfırlama - VideoSat';
        const message = `Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:

${resetLink}

Bu bağlantı 1 saat süreyle geçerlidir.

Güvenlik için bağlantıyı kimseyle paylaşmayın.

İyi günler,
VideoSat Platform`;

        return await this.sendEmail(to, subject, message, 'password_reset');
    }

    // Get sent emails
    getSentEmails(limit = 50) {
        return this.sentEmails
            .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
            .slice(0, limit);
    }

    // Save emails to localStorage
    saveEmails() {
        localStorage.setItem('sentEmails', JSON.stringify(this.sentEmails));
    }

    // Delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get email statistics
    getStatistics() {
        return {
            total: this.sentEmails.length,
            byType: this.sentEmails.reduce((acc, email) => {
                acc[email.type] = (acc[email.type] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

// Export email service instance
const emailService = new EmailService();
window.emailService = emailService;

console.log('✅ Email Service initialized (mock)');

