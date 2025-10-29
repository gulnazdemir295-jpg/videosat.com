// VideoSat Platform - Login Logger System
// Giriş hatalarını kaydeden ve analiz eden sistem

class LoginLogger {
    constructor() {
        this.logs = JSON.parse(localStorage.getItem('loginLogs') || '[]');
        this.maxLogs = 1000; // Maksimum log sayısı
        this.failedAttempts = JSON.parse(localStorage.getItem('failedAttempts') || '{}');
        this.lockoutThreshold = 5; // 5 başarısız deneme sonrası kilitleme
        this.lockoutDuration = 15 * 60 * 1000; // 15 dakika kilitleme süresi
    }

    // Giriş denemesini logla
    logLoginAttempt(email, password, success, error = null, userAgent = null) {
        const log = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            email: email,
            passwordLength: password ? password.length : 0,
            success: success,
            error: error,
            userAgent: userAgent || navigator.userAgent,
            ip: this.getClientIP(),
            sessionId: this.getSessionId()
        };

        this.logs.unshift(log);
        
        // Maksimum log sayısını kontrol et
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }

        // Başarısız denemeleri say
        if (!success) {
            this.failedAttempts[email] = this.failedAttempts[email] || {
                count: 0,
                lastAttempt: null,
                lockedUntil: null
            };
            
            this.failedAttempts[email].count++;
            this.failedAttempts[email].lastAttempt = new Date().toISOString();
            
            // Kilitleme kontrolü
            if (this.failedAttempts[email].count >= this.lockoutThreshold) {
                this.failedAttempts[email].lockedUntil = new Date(Date.now() + this.lockoutDuration).toISOString();
                console.warn(`⚠️ ${email} hesabı ${this.lockoutDuration/60000} dakika kilitlendi`);
            }
        } else {
            // Başarılı girişte sayacı sıfırla
            if (this.failedAttempts[email]) {
                this.failedAttempts[email].count = 0;
                this.failedAttempts[email].lockedUntil = null;
            }
        }

        this.saveLogs();
        this.saveFailedAttempts();
        
        console.log(`📝 Login attempt logged: ${email} - ${success ? 'SUCCESS' : 'FAILED'}`);
    }

    // Kullanıcı kilitli mi kontrol et
    isUserLocked(email) {
        const attempts = this.failedAttempts[email];
        if (!attempts || !attempts.lockedUntil) return false;
        
        const lockUntil = new Date(attempts.lockedUntil);
        const now = new Date();
        
        if (now < lockUntil) {
            const remainingMinutes = Math.ceil((lockUntil - now) / 60000);
            return {
                locked: true,
                remainingMinutes: remainingMinutes,
                message: `Hesabınız ${remainingMinutes} dakika daha kilitli. Çok fazla başarısız deneme yaptınız.`
            };
        } else {
            // Kilitleme süresi dolmuş, sıfırla
            attempts.lockedUntil = null;
            this.saveFailedAttempts();
            return false;
        }
    }

    // Başarısız deneme sayısını al
    getFailedAttempts(email) {
        return this.failedAttempts[email]?.count || 0;
    }

    // Son giriş denemesini al
    getLastLoginAttempt(email) {
        return this.logs.find(log => log.email === email);
    }

    // Kullanıcının giriş geçmişini al
    getUserLoginHistory(email, limit = 10) {
        return this.logs
            .filter(log => log.email === email)
            .slice(0, limit);
    }

    // Tüm logları al
    getAllLogs(limit = 50) {
        return this.logs.slice(0, limit);
    }

    // Başarısız girişleri al
    getFailedLogins(limit = 20) {
        return this.logs
            .filter(log => !log.success)
            .slice(0, limit);
    }

    // Başarılı girişleri al
    getSuccessfulLogins(limit = 20) {
        return this.logs
            .filter(log => log.success)
            .slice(0, limit);
    }

    // Bugünkü girişleri al
    getTodayLogins() {
        const today = new Date().toDateString();
        return this.logs.filter(log => 
            new Date(log.timestamp).toDateString() === today
        );
    }

    // İstatistikleri al
    getStatistics() {
        const total = this.logs.length;
        const successful = this.logs.filter(log => log.success).length;
        const failed = total - successful;
        const successRate = total > 0 ? (successful / total * 100).toFixed(2) : 0;
        
        const todayLogins = this.getTodayLogins();
        const todaySuccessful = todayLogins.filter(log => log.success).length;
        const todayFailed = todayLogins.length - todaySuccessful;
        
        return {
            total,
            successful,
            failed,
            successRate: `${successRate}%`,
            today: {
                total: todayLogins.length,
                successful: todaySuccessful,
                failed: todayFailed
            },
            lockedAccounts: Object.keys(this.failedAttempts).filter(email => 
                this.failedAttempts[email].lockedUntil && 
                new Date(this.failedAttempts[email].lockedUntil) > new Date()
            ).length
        };
    }

    // Logları temizle
    clearLogs() {
        this.logs = [];
        this.failedAttempts = {};
        this.saveLogs();
        this.saveFailedAttempts();
        console.log('🧹 Login logs cleared');
    }

    // Eski logları temizle (30 günden eski)
    cleanOldLogs() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        this.logs = this.logs.filter(log => 
            new Date(log.timestamp) > thirtyDaysAgo
        );
        this.saveLogs();
        console.log('🧹 Old logs cleaned');
    }

    // Logları kaydet
    saveLogs() {
        localStorage.setItem('loginLogs', JSON.stringify(this.logs));
    }

    // Başarısız denemeleri kaydet
    saveFailedAttempts() {
        localStorage.setItem('failedAttempts', JSON.stringify(this.failedAttempts));
    }

    // Client IP al (basit yöntem)
    getClientIP() {
        // Gerçek IP almak için backend gerekli, şimdilik placeholder
        return '127.0.0.1';
    }

    // Session ID al
    getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    // Logları export et
    exportLogs(format = 'json') {
        if (format === 'json') {
            const dataStr = JSON.stringify(this.logs, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `login-logs-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } else if (format === 'csv') {
            const csv = this.convertToCSV(this.logs);
            const dataBlob = new Blob([csv], {type: 'text/csv'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `login-logs-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        }
    }

    // JSON'u CSV'ye çevir
    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => 
                    JSON.stringify(row[header] || '')
                ).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }
}

// Global login logger instance
window.loginLogger = new LoginLogger();

// Utility fonksiyonları
window.logLoginAttempt = (email, password, success, error) => 
    window.loginLogger.logLoginAttempt(email, password, success, error);

window.isUserLocked = (email) => 
    window.loginLogger.isUserLocked(email);

window.getLoginStatistics = () => 
    window.loginLogger.getStatistics();

console.log('✅ Login Logger System yüklendi');

