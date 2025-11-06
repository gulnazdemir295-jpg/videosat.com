/**
 * Yayın Başlatma Error Handler
 * 
 * Yayın başlatma sürecindeki hataları handle eder ve user-friendly mesajlar döner.
 */

/**
 * Yayın Başlatma Error Handler Class
 */
class StreamStartErrorHandler {
    constructor() {
        this.errorSteps = new Map(); // Hangi adımda hata oluştu
    }

    /**
     * Handle Stream Start Error
     */
    handleError(error, step, context = {}) {
        try {
            // Error bilgilerini çıkar
            const errorInfo = this.extractErrorInfo(error);
            
            // Step'e göre kategori belirle
            const category = this.categorizeByStep(step, errorInfo);
            
            // User-friendly message oluştur
            const userMessage = this.getUserFriendlyMessage(step, errorInfo, category);
            
            // Çözüm önerisi
            const solution = this.getSolution(step, errorInfo, category);
            
            // Retry gerekiyor mu?
            const shouldRetry = this.shouldRetry(step, errorInfo, category);
            
            // Log error
            this.logError(step, errorInfo, category, context);
            
            return {
                step,
                errorInfo,
                category,
                userMessage,
                solution,
                shouldRetry,
                retryAction: shouldRetry ? this.getRetryAction(step) : null
            };
        } catch (handlerError) {
            console.error('Stream start error handler error:', handlerError);
            return {
                step: 'unknown',
                errorInfo: { code: 'UNKNOWN', message: error?.message || 'Unknown error' },
                category: 'UNKNOWN',
                userMessage: 'Yayın başlatılırken bir hata oluştu. Lütfen sayfayı yenileyin.',
                solution: 'Sayfayı yenileyin ve tekrar deneyin.',
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
                name: error.name || 'AgoraRTCError'
            };
        }

        // Standard Error formatı
        if (error.message) {
            return {
                code: error.name || 'ERROR',
                message: error.message,
                name: error.name || 'Error'
            };
        }

        // String error
        if (typeof error === 'string') {
            return {
                code: 'STRING_ERROR',
                message: error,
                name: 'StringError'
            };
        }

        return {
            code: 'UNKNOWN',
            message: String(error),
            name: 'UnknownError'
        };
    }

    /**
     * Categorize by Step
     */
    categorizeByStep(step, errorInfo) {
        const stepCategories = {
            'pre-check': this.categorizePreCheckError(errorInfo),
            'camera-access': this.categorizeCameraError(errorInfo),
            'backend-request': this.categorizeBackendError(errorInfo),
            'agora-init': this.categorizeAgoraError(errorInfo),
            'agora-join': this.categorizeAgoraJoinError(errorInfo),
            'track-creation': this.categorizeTrackError(errorInfo),
            'publish': this.categorizePublishError(errorInfo),
            'unknown': 'UNKNOWN'
        };

        return stepCategories[step] || 'UNKNOWN';
    }

    /**
     * Categorize Pre-Check Error
     */
    categorizePreCheckError(errorInfo) {
        if (errorInfo.message.includes('kamera erişimi') || errorInfo.message.includes('localStream')) {
            return 'CAMERA_NOT_ACCESSED';
        }
        if (errorInfo.message.includes('video track')) {
            return 'VIDEO_TRACK_NOT_FOUND';
        }
        if (errorInfo.message.includes('zaten aktif')) {
            return 'STREAM_ALREADY_ACTIVE';
        }
        return 'PRE_CHECK_ERROR';
    }

    /**
     * Categorize Camera Error
     */
    categorizeCameraError(errorInfo) {
        if (errorInfo.code === 'NotAllowedError' || errorInfo.message.includes('permission')) {
            return 'CAMERA_PERMISSION_DENIED';
        }
        if (errorInfo.code === 'NotFoundError' || errorInfo.message.includes('not found')) {
            return 'CAMERA_NOT_FOUND';
        }
        if (errorInfo.code === 'NotReadableError' || errorInfo.message.includes('in use')) {
            return 'CAMERA_IN_USE';
        }
        if (errorInfo.message.includes('HTTPS')) {
            return 'HTTPS_REQUIRED';
        }
        if (errorInfo.message.includes('WebRTC')) {
            return 'WEBRTC_NOT_SUPPORTED';
        }
        return 'CAMERA_ERROR';
    }

    /**
     * Categorize Backend Error
     */
    categorizeBackendError(errorInfo) {
        if (errorInfo.message.includes('500') || errorInfo.message.includes('Internal Server Error')) {
            return 'BACKEND_SERVER_ERROR';
        }
        if (errorInfo.message.includes('404') || errorInfo.message.includes('Not Found')) {
            return 'BACKEND_NOT_FOUND';
        }
        if (errorInfo.message.includes('503') || errorInfo.message.includes('Service Unavailable')) {
            return 'BACKEND_UNAVAILABLE';
        }
        if (errorInfo.message.includes('timeout') || errorInfo.message.includes('Failed to fetch')) {
            return 'BACKEND_TIMEOUT';
        }
        if (errorInfo.message.includes('CORS') || errorInfo.message.includes('Access-Control')) {
            return 'BACKEND_CORS_ERROR';
        }
        if (errorInfo.message.includes('Channel oluşturulamadı')) {
            return 'BACKEND_CHANNEL_FAILED';
        }
        if (errorInfo.message.includes('provider')) {
            return 'BACKEND_PROVIDER_ERROR';
        }
        return 'BACKEND_ERROR';
    }

    /**
     * Categorize Agora Error
     */
    categorizeAgoraError(errorInfo) {
        if (errorInfo.message.includes('SDK yüklenmedi')) {
            return 'AGORA_SDK_NOT_LOADED';
        }
        if (errorInfo.message.includes('createClient')) {
            return 'AGORA_CLIENT_CREATION_FAILED';
        }
        return 'AGORA_ERROR';
    }

    /**
     * Categorize Agora Join Error
     */
    categorizeAgoraJoinError(errorInfo) {
        if (errorInfo.code === 4097 || errorInfo.message.includes('INVALID_TOKEN')) {
            return 'AGORA_INVALID_TOKEN';
        }
        if (errorInfo.code === 4098 || errorInfo.message.includes('TOKEN_EXPIRED')) {
            return 'AGORA_TOKEN_EXPIRED';
        }
        if (errorInfo.code === 4099 || errorInfo.message.includes('INVALID_APP_ID')) {
            return 'AGORA_INVALID_APP_ID';
        }
        if (errorInfo.code === 4100 || errorInfo.message.includes('INVALID_CHANNEL_NAME')) {
            return 'AGORA_INVALID_CHANNEL_NAME';
        }
        if (errorInfo.code === 4096 || errorInfo.message.includes('GATEWAY')) {
            return 'AGORA_NETWORK_ERROR';
        }
        return 'AGORA_JOIN_ERROR';
    }

    /**
     * Categorize Track Error
     */
    categorizeTrackError(errorInfo) {
        if (errorInfo.message.includes('video track')) {
            return 'VIDEO_TRACK_ERROR';
        }
        if (errorInfo.message.includes('audio track')) {
            return 'AUDIO_TRACK_ERROR';
        }
        return 'TRACK_ERROR';
    }

    /**
     * Categorize Publish Error
     */
    categorizePublishError(errorInfo) {
        if (errorInfo.code === 4102 || errorInfo.message.includes('PUBLISH_FAILED')) {
            return 'AGORA_PUBLISH_FAILED';
        }
        return 'PUBLISH_ERROR';
    }

    /**
     * Get User-Friendly Message
     */
    getUserFriendlyMessage(step, errorInfo, category) {
        const messages = {
            // Pre-check errors
            'CAMERA_NOT_ACCESSED': 'Kamera erişimi yok. Lütfen önce kamera erişimi isteyin.',
            'VIDEO_TRACK_NOT_FOUND': 'Video track bulunamadı. Kamera erişimini tekrar deneyin.',
            'STREAM_ALREADY_ACTIVE': 'Yayın zaten aktif. Önce mevcut yayını durdurun.',
            
            // Camera errors
            'CAMERA_PERMISSION_DENIED': 'Kamera erişimi reddedildi. Tarayıcı ayarlarından kamera ve mikrofon izinlerini verin.',
            'CAMERA_NOT_FOUND': 'Kamera bulunamadı. Lütfen bir kamera bağlı olduğundan emin olun.',
            'CAMERA_IN_USE': 'Kamera kullanımda. Lütfen başka bir uygulama kamerayı kullanıyorsa kapatın.',
            'HTTPS_REQUIRED': 'Kamera erişimi için HTTPS gereklidir. Lütfen HTTPS kullanın.',
            'WEBRTC_NOT_SUPPORTED': 'WebRTC desteklenmiyor. Modern bir tarayıcı kullanın.',
            
            // Backend errors
            'BACKEND_SERVER_ERROR': 'Backend sunucusunda bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
            'BACKEND_NOT_FOUND': 'Backend endpoint bulunamadı. Lütfen destek ile iletişime geçin.',
            'BACKEND_UNAVAILABLE': 'Backend sunucusu şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
            'BACKEND_TIMEOUT': 'Backend sunucusuna bağlanılamıyor. İnternet bağlantınızı kontrol edin.',
            'BACKEND_CORS_ERROR': 'CORS hatası. Lütfen destek ile iletişime geçin.',
            'BACKEND_CHANNEL_FAILED': 'Kanal oluşturulamadı. Lütfen tekrar deneyin.',
            'BACKEND_PROVIDER_ERROR': 'Backend yapılandırma hatası. Lütfen destek ile iletişime geçin.',
            
            // Agora errors
            'AGORA_SDK_NOT_LOADED': 'Agora SDK yüklenemedi. Sayfayı yenileyin.',
            'AGORA_CLIENT_CREATION_FAILED': 'Agora client oluşturulamadı. Tarayıcınızı kontrol edin.',
            'AGORA_INVALID_TOKEN': 'Geçersiz güvenlik anahtarı. Sayfayı yenileyin.',
            'AGORA_TOKEN_EXPIRED': 'Güvenlik anahtarı süresi doldu. Sayfayı yenileyin.',
            'AGORA_INVALID_APP_ID': 'Geçersiz uygulama kimliği. Lütfen destek ile iletişime geçin.',
            'AGORA_INVALID_CHANNEL_NAME': 'Geçersiz kanal adı. Lütfen tekrar deneyin.',
            'AGORA_NETWORK_ERROR': 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.',
            'AGORA_JOIN_ERROR': 'Kanal'a katılamadı. Lütfen tekrar deneyin.',
            
            // Track errors
            'VIDEO_TRACK_ERROR': 'Video track oluşturulamadı. Kamera erişimini kontrol edin.',
            'AUDIO_TRACK_ERROR': 'Audio track oluşturulamadı. Mikrofon erişimini kontrol edin.',
            'TRACK_ERROR': 'Track oluşturulamadı. Cihaz erişimlerini kontrol edin.',
            
            // Publish errors
            'AGORA_PUBLISH_FAILED': 'Yayın başlatılamadı. Ağ bağlantınızı kontrol edin.',
            'PUBLISH_ERROR': 'Yayın başlatılamadı. Lütfen tekrar deneyin.',
            
            // Unknown
            'UNKNOWN': 'Yayın başlatılırken bir hata oluştu. Lütfen sayfayı yenileyin.'
        };

        return messages[category] || messages['UNKNOWN'];
    }

    /**
     * Get Solution
     */
    getSolution(step, errorInfo, category) {
        const solutions = {
            'CAMERA_NOT_ACCESSED': 'Kamera erişimi iste butonuna tıklayın.',
            'VIDEO_TRACK_NOT_FOUND': 'Kamera erişimini tekrar isteyin.',
            'STREAM_ALREADY_ACTIVE': 'Önce mevcut yayını durdurun.',
            'CAMERA_PERMISSION_DENIED': 'Tarayıcı ayarlarından site için kamera ve mikrofon izni verin.',
            'CAMERA_NOT_FOUND': 'Bir kamera bağlayın ve sayfayı yenileyin.',
            'CAMERA_IN_USE': 'Diğer uygulamaları kapatın ve tekrar deneyin.',
            'HTTPS_REQUIRED': 'HTTPS kullanın veya localhost üzerinden erişin.',
            'WEBRTC_NOT_SUPPORTED': 'Chrome, Firefox, Safari veya Edge kullanın.',
            'BACKEND_SERVER_ERROR': 'Birkaç dakika sonra tekrar deneyin.',
            'BACKEND_TIMEOUT': 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
            'BACKEND_CORS_ERROR': 'Destek ekibi ile iletişime geçin.',
            'AGORA_SDK_NOT_LOADED': 'Sayfayı yenileyin (F5).',
            'AGORA_INVALID_TOKEN': 'Sayfayı yenileyin (F5).',
            'AGORA_TOKEN_EXPIRED': 'Sayfayı yenileyin (F5).',
            'AGORA_NETWORK_ERROR': 'İnternet bağlantınızı kontrol edin.',
            'AGORA_PUBLISH_FAILED': 'Ağ bağlantınızı kontrol edin ve tekrar deneyin.',
            'UNKNOWN': 'Sayfayı yenileyin (F5) veya destek ile iletişime geçin.'
        };

        return solutions[category] || solutions['UNKNOWN'];
    }

    /**
     * Should Retry
     */
    shouldRetry(step, errorInfo, category) {
        const retryableCategories = [
            'BACKEND_SERVER_ERROR',
            'BACKEND_TIMEOUT',
            'BACKEND_UNAVAILABLE',
            'AGORA_NETWORK_ERROR',
            'AGORA_JOIN_ERROR',
            'AGORA_PUBLISH_FAILED',
            'PUBLISH_ERROR'
        ];

        const nonRetryableCategories = [
            'CAMERA_PERMISSION_DENIED',
            'CAMERA_NOT_FOUND',
            'CAMERA_IN_USE',
            'HTTPS_REQUIRED',
            'WEBRTC_NOT_SUPPORTED',
            'AGORA_SDK_NOT_LOADED',
            'AGORA_INVALID_APP_ID',
            'BACKEND_CORS_ERROR',
            'STREAM_ALREADY_ACTIVE'
        ];

        if (nonRetryableCategories.includes(category)) {
            return false;
        }

        return retryableCategories.includes(category);
    }

    /**
     * Get Retry Action
     */
    getRetryAction(step) {
        const actions = {
            'backend-request': 'retryBackendRequest',
            'agora-join': 'retryAgoraJoin',
            'publish': 'retryPublish'
        };

        return actions[step] || 'retryStreamStart';
    }

    /**
     * Log Error
     */
    logError(step, errorInfo, category, context) {
        const logData = {
            timestamp: new Date().toISOString(),
            step,
            category,
            code: errorInfo.code,
            message: errorInfo.message,
            context
        };

        console.error('🚨 Stream Start Error:', logData);

        // Error step tracking
        this.errorSteps.set(step, (this.errorSteps.get(step) || 0) + 1);

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
                    type: 'StreamStartError',
                    ...logData,
                    userAgent: navigator.userAgent
                })
            });
        } catch (error) {
            console.warn('Error logging failed:', error);
        }
    }

    /**
     * Get Error Statistics
     */
    getErrorStatistics() {
        return {
            errorSteps: Object.fromEntries(this.errorSteps),
            totalErrors: Array.from(this.errorSteps.values()).reduce((a, b) => a + b, 0)
        };
    }
}

// Global error handler instance
const streamStartErrorHandler = new StreamStartErrorHandler();

/**
 * Handle Stream Start Error by Step
 */
function handleStreamStartError(error, step, context = {}) {
    return streamStartErrorHandler.handleError(error, step, context);
}

// Export
if (typeof window !== 'undefined') {
    window.streamStartErrorHandler = streamStartErrorHandler;
    window.handleStreamStartError = handleStreamStartError;
}

console.log('✅ Stream Start Error Handler yüklendi');

