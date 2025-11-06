/**
 * Agora Error Handler
 * 
 * AgoraRTC hatalarını yakalar, kategorize eder ve user-friendly mesajlara dönüştürür.
 */

/**
 * Agora Error Handler Class
 */
class AgoraErrorHandler {
    constructor() {
        this.errorCounts = new Map();
        this.errorHistory = [];
        this.maxHistorySize = 100;
    }

    /**
     * Handle Agora Error
     */
    handleError(error, context = {}) {
        try {
            // Error bilgilerini çıkar
            const errorInfo = this.extractErrorInfo(error);
            
            // Error'ı kategorize et
            const category = this.categorizeError(errorInfo);
            
            // User-friendly message oluştur
            const userMessage = this.getUserFriendlyMessage(errorInfo, category);
            
            // Error'ı logla
            this.logError(errorInfo, category, context);
            
            // Error'ı history'ye ekle
            this.addToHistory(errorInfo, category);
            
            // User'a göster
            this.showErrorToUser(userMessage, category, errorInfo);
            
            return {
                errorInfo,
                category,
                userMessage,
                shouldRetry: this.shouldRetry(errorInfo, category),
                retryAction: this.getRetryAction(errorInfo, category)
            };
        } catch (handlerError) {
            console.error('Error handler error:', handlerError);
            return {
                errorInfo: { code: 'UNKNOWN', message: error?.message || 'Unknown error' },
                category: 'UNKNOWN',
                userMessage: 'Bir hata oluştu. Lütfen sayfayı yenileyin.',
                shouldRetry: false
            };
        }
    }

    /**
     * Extract Error Info
     */
    extractErrorInfo(error) {
        if (!error) {
            return { code: 'UNKNOWN', message: 'Unknown error' };
        }

        // AgoraRTCError formatı
        if (error.code !== undefined) {
            return {
                code: error.code,
                message: error.message || error.msg || '',
                name: error.name || 'AgoraRTCError',
                fullError: error
            };
        }

        // Standard Error formatı
        if (error.message) {
            return {
                code: error.name || 'ERROR',
                message: error.message,
                name: error.name || 'Error',
                fullError: error
            };
        }

        // String error
        if (typeof error === 'string') {
            return {
                code: 'STRING_ERROR',
                message: error,
                name: 'StringError',
                fullError: error
            };
        }

        return {
            code: 'UNKNOWN',
            message: String(error),
            name: 'UnknownError',
            fullError: error
        };
    }

    /**
     * Categorize Error
     */
    categorizeError(errorInfo) {
        const code = errorInfo.code;
        const message = errorInfo.message.toLowerCase();

        // Token errors
        if (code === 4097 || code === 'INVALID_TOKEN' || message.includes('invalid token')) {
            return 'TOKEN_ERROR';
        }
        if (code === 4098 || code === 'TOKEN_EXPIRED' || message.includes('token expired') || message.includes('dynamic key expired')) {
            return 'TOKEN_EXPIRED';
        }

        // Network errors
        if (code === 4096 || code === 'CAN_NOT_GET_GATEWAY_SERVER' || message.includes('gateway') || message.includes('network')) {
            return 'NETWORK_ERROR';
        }
        if (code === 'NETWORK_ERROR' || message.includes('connection') || message.includes('timeout')) {
            return 'NETWORK_ERROR';
        }
        if (code === 'CONNECTION_LOST' || message.includes('connection lost')) {
            return 'CONNECTION_ERROR';
        }

        // App ID errors
        if (code === 4099 || code === 'INVALID_APP_ID' || message.includes('app id')) {
            return 'APP_ID_ERROR';
        }

        // Channel errors
        if (code === 4100 || code === 'INVALID_CHANNEL_NAME' || message.includes('channel name')) {
            return 'CHANNEL_ERROR';
        }
        if (code === 4101 || code === 'CHANNEL_NOT_FOUND' || message.includes('channel not found')) {
            return 'CHANNEL_ERROR';
        }

        // Publish/Subscribe errors
        if (code === 4102 || code === 'PUBLISH_FAILED' || message.includes('publish')) {
            return 'PUBLISH_ERROR';
        }
        if (code === 4103 || code === 'SUBSCRIBE_FAILED' || message.includes('subscribe')) {
            return 'SUBSCRIBE_ERROR';
        }

        // Codec errors
        if (code === 4104 || code === 'UNSUPPORTED_CODEC' || message.includes('codec')) {
            return 'CODEC_ERROR';
        }

        // Media device errors
        if (code === 'NotAllowedError' || message.includes('permission denied')) {
            return 'PERMISSION_ERROR';
        }
        if (code === 'NotFoundError' || message.includes('not found')) {
            return 'DEVICE_ERROR';
        }
        if (code === 'NotReadableError' || message.includes('not readable')) {
            return 'DEVICE_ERROR';
        }

        return 'UNKNOWN';
    }

    /**
     * Get User-Friendly Message
     */
    getUserFriendlyMessage(errorInfo, category) {
        const messages = {
            'TOKEN_ERROR': 'Güvenlik anahtarı geçersiz. Sayfayı yenileyin.',
            'TOKEN_EXPIRED': 'Güvenlik anahtarı süresi doldu. Yenileniyor...',
            'NETWORK_ERROR': 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.',
            'CONNECTION_ERROR': 'Bağlantı kesildi. Yeniden bağlanılıyor...',
            'APP_ID_ERROR': 'Uygulama kimliği geçersiz. Lütfen destek ile iletişime geçin.',
            'CHANNEL_ERROR': 'Kanal hatası. Lütfen tekrar deneyin.',
            'PUBLISH_ERROR': 'Yayın başlatılamadı. Lütfen tekrar deneyin.',
            'SUBSCRIBE_ERROR': 'Yayına bağlanılamadı. Lütfen tekrar deneyin.',
            'CODEC_ERROR': 'Video codec desteklenmiyor. Farklı bir tarayıcı deneyin.',
            'PERMISSION_ERROR': 'Kamera/mikrofon izni gerekli. Tarayıcı ayarlarından izin verin.',
            'DEVICE_ERROR': 'Kamera/mikrofon bulunamadı veya kullanımda. Lütfen kontrol edin.',
            'UNKNOWN': 'Bir hata oluştu. Lütfen sayfayı yenileyin.'
        };

        return messages[category] || messages['UNKNOWN'];
    }

    /**
     * Should Retry
     */
    shouldRetry(errorInfo, category) {
        const retryableCategories = [
            'TOKEN_EXPIRED',
            'NETWORK_ERROR',
            'CONNECTION_ERROR',
            'PUBLISH_ERROR',
            'SUBSCRIBE_ERROR'
        ];

        return retryableCategories.includes(category);
    }

    /**
     * Get Retry Action
     */
    getRetryAction(errorInfo, category) {
        const actions = {
            'TOKEN_EXPIRED': 'renewToken',
            'NETWORK_ERROR': 'reconnect',
            'CONNECTION_ERROR': 'reconnect',
            'PUBLISH_ERROR': 'republish',
            'SUBSCRIBE_ERROR': 'resubscribe'
        };

        return actions[category] || null;
    }

    /**
     * Log Error
     */
    logError(errorInfo, category, context) {
        const logData = {
            timestamp: new Date().toISOString(),
            category,
            code: errorInfo.code,
            message: errorInfo.message,
            context
        };

        console.error('🚨 Agora Error:', logData);

        // Error count
        const key = `${category}:${errorInfo.code}`;
        this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);

        // Backend'e logla (opsiyonel)
        if (typeof getAPIBaseURL === 'function') {
            this.sendErrorToBackend(logData).catch(err => {
                console.warn('Error logging to backend failed:', err);
            });
        }
    }

    /**
     * Send Error to Backend
     */
    async sendErrorToBackend(logData) {
        try {
            await fetch(`${getAPIBaseURL()}/errors/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'AgoraError',
                    ...logData,
                    userAgent: navigator.userAgent
                })
            });
        } catch (error) {
            console.warn('Error logging failed:', error);
        }
    }

    /**
     * Add to History
     */
    addToHistory(errorInfo, category) {
        this.errorHistory.push({
            timestamp: new Date().toISOString(),
            category,
            code: errorInfo.code,
            message: errorInfo.message
        });

        // Max history size
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory.shift();
        }
    }

    /**
     * Show Error to User
     */
    showErrorToUser(message, category, errorInfo) {
        // Update status
        if (typeof updateStatus === 'function') {
            updateStatus(`❌ ${message}`);
        }

        // Show notification
        if (window.agoraEnhancements && window.agoraEnhancements.showNotification) {
            const type = category === 'TOKEN_EXPIRED' || category === 'CONNECTION_ERROR' ? 'warning' : 'error';
            window.agoraEnhancements.showNotification(message, type, 10000);
        } else {
            // Fallback: console log
            console.error('Error:', message);
        }
    }

    /**
     * Get Error Statistics
     */
    getErrorStatistics() {
        return {
            totalErrors: this.errorHistory.length,
            errorCounts: Object.fromEntries(this.errorCounts),
            recentErrors: this.errorHistory.slice(-10),
            errorRate: this.calculateErrorRate()
        };
    }

    /**
     * Calculate Error Rate
     */
    calculateErrorRate() {
        const now = Date.now();
        const last5Minutes = this.errorHistory.filter(err => {
            const errTime = new Date(err.timestamp).getTime();
            return (now - errTime) < 5 * 60 * 1000;
        });

        return {
            last5Minutes: last5Minutes.length,
            perMinute: last5Minutes.length / 5
        };
    }

    /**
     * Clear History
     */
    clearHistory() {
        this.errorHistory = [];
        this.errorCounts.clear();
    }
}

// Global error handler instance
const agoraErrorHandler = new AgoraErrorHandler();

/**
 * Handle Agora Exception Event
 */
function handleAgoraException(evt) {
    return agoraErrorHandler.handleError(evt, {
        type: 'exception',
        source: 'agora-client'
    });
}

/**
 * Handle Agora Error
 */
function handleAgoraError(error, context = {}) {
    return agoraErrorHandler.handleError(error, {
        ...context,
        source: 'agora-sdk'
    });
}

// Export
if (typeof window !== 'undefined') {
    window.agoraErrorHandler = agoraErrorHandler;
    window.handleAgoraException = handleAgoraException;
    window.handleAgoraError = handleAgoraError;
}

console.log('✅ Agora Error Handler yüklendi');

