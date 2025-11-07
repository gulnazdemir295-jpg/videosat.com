/**
 * Global Error Handler
 * Provides user-friendly error notifications and hooks into global error events
 */

(function() {
    'use strict';

    const DEFAULT_ERROR_MESSAGE = 'Beklenmeyen bir hata oluştu. Lütfen işlemi tekrar deneyin.';
    const NETWORK_ERROR_MESSAGE = 'Sunucuya ulaşılamıyor. İnternet bağlantınızı veya VPN ayarlarınızı kontrol edin.';
    const AUTH_ERROR_MESSAGE = 'Oturumunuzun süresi dolmuş olabilir. Lütfen tekrar giriş yapın.';

    class GlobalErrorHandler {
        constructor() {
            this.lastNotificationTime = 0;
            this.lastNotificationMessage = '';
            this.notificationCooldown = 4000; // ms
            this.init();
        }

        init() {
            this.registerEventListeners();
            this.registerNetworkListeners();
            this.registerConsoleIntegration();

            // Expose helper for manual usage
            window.handleError = this.handleError.bind(this);
            window.globalErrorHandler = {
                handleError: this.handleError.bind(this),
                notify: this.notify.bind(this),
                getLastError: () => this.lastErrorContext || null
            };

            console.log('✅ Global Error Handler initialized');
        }

        registerEventListeners() {
            window.addEventListener('error', (event) => {
                if (event?.__handledByGlobalErrorHandler) return;
                event.__handledByGlobalErrorHandler = true;

                const context = {
                    type: 'javascript',
                    filename: event?.filename,
                    lineno: event?.lineno,
                    colno: event?.colno,
                    error: event?.error
                };

                this.handleError(event?.error || event?.message, {
                    context,
                    userMessage: this.buildUserMessage(event?.error || event?.message, context),
                    track: false
                });
            }, true);

            window.addEventListener('unhandledrejection', (event) => {
                if (event?.__handledByGlobalErrorHandler) return;
                event.__handledByGlobalErrorHandler = true;

                const context = {
                    type: 'promise',
                    error: event?.reason
                };

                this.handleError(event?.reason, {
                    context,
                    userMessage: this.buildUserMessage(event?.reason, context),
                    track: false
                });
            });
        }

        registerNetworkListeners() {
            window.addEventListener('offline', () => {
                this.notify('İnternet bağlantısı kesildi. Çevrim içi olduğunuzda tekrar deneyeceğiz.', 'warning', {
                    force: true
                });
            });

            window.addEventListener('online', () => {
                this.notify('Bağlantı tekrar sağlandı. İşlemlerinize devam edebilirsiniz.', 'success', {
                    force: true
                });
            });
        }

        registerConsoleIntegration() {
            // Patch error tracking service when ready so we can enrich user feedback
            const integrateWithErrorTracking = () => {
                const service = window.errorTrackingService;
                if (!service || service.__globalHandlerPatched) {
                    return;
                }

                const originalTrackError = service.trackError.bind(service);
                service.trackError = (errorData) => {
                    try {
                        if (errorData && this.shouldNotifyFromTrackedError(errorData)) {
                            const message = this.buildUserMessage(errorData.message || errorData.error, errorData);
                            this.notify(message, 'error');
                        }
                    } catch (integrationError) {
                        console.warn('GlobalErrorHandler integration warning:', integrationError);
                    }

                    return originalTrackError(errorData);
                };

                service.__globalHandlerPatched = true;
            };

            if (document.readyState === 'complete') {
                integrateWithErrorTracking();
            } else {
                window.addEventListener('load', integrateWithErrorTracking);
            }

            // Fallback polling in case service loads later
            let retryCount = 0;
            const retryInterval = setInterval(() => {
                integrateWithErrorTracking();
                retryCount += 1;
                if (retryCount > 10 || (window.errorTrackingService && window.errorTrackingService.__globalHandlerPatched)) {
                    clearInterval(retryInterval);
                }
            }, 500);
        }

        handleError(error, options = {}) {
            const context = options.context || {};
            const message = options.userMessage || this.buildUserMessage(error, context) || DEFAULT_ERROR_MESSAGE;
            const type = options.type || 'error';

            this.lastErrorContext = {
                error,
                context,
                timestamp: new Date().toISOString()
            };

            if (options.log !== false) {
                console.error('GlobalErrorHandler captured error:', error, context);
            }

            if (options.track !== false && window.errorTrackingService && typeof window.errorTrackingService.trackError === 'function') {
                try {
                    const errorData = this.normalizeErrorData(error, context);
                    window.errorTrackingService.trackError(errorData);
                } catch (trackError) {
                    console.warn('GlobalErrorHandler trackError failed:', trackError);
                }
            }

            this.notify(message, type, options);
        }

        notify(message, type = 'error', options = {}) {
            if (!message) return;

            const now = Date.now();
            if (!options.force && this.lastNotificationMessage === message && (now - this.lastNotificationTime) < this.notificationCooldown) {
                return;
            }

            if (typeof showAlert === 'function') {
                showAlert(message, type);
            } else {
                // Fallback console notification
                const logMethod = type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log';
                console[logMethod](`[${type.toUpperCase()}] ${message}`);
            }

            this.lastNotificationMessage = message;
            this.lastNotificationTime = now;
        }

        buildUserMessage(error, context = {}) {
            if (!error && !context?.message) {
                return DEFAULT_ERROR_MESSAGE;
            }

            const rawMessage = typeof error === 'string'
                ? error
                : error?.message || context?.message || '';

            if (this.isNetworkError(rawMessage, error)) {
                return NETWORK_ERROR_MESSAGE;
            }

            if (this.isAuthError(rawMessage, error)) {
                return AUTH_ERROR_MESSAGE;
            }

            if (context?.type === 'promise') {
                return rawMessage || DEFAULT_ERROR_MESSAGE;
            }

            if (rawMessage && !/script error/i.test(rawMessage)) {
                return rawMessage;
            }

            return DEFAULT_ERROR_MESSAGE;
        }

        normalizeErrorData(error, context = {}) {
            if (error && typeof error === 'object' && error.timestamp && error.message && error.type) {
                return error; // already normalized (likely from error tracking service)
            }

            return {
                message: typeof error === 'string' ? error : error?.message || DEFAULT_ERROR_MESSAGE,
                error,
                type: context.type || 'global',
                filename: context.filename || (error && error.fileName) || 'unknown',
                lineno: context.lineno || error?.lineNumber || 0,
                colno: context.colno || error?.columnNumber || 0,
                stack: error?.stack,
                url: window.location.href
            };
        }

        shouldNotifyFromTrackedError(errorData) {
            if (!errorData) return false;
            const type = errorData.type || '';
            return ['javascript', 'promise', 'global'].includes(type);
        }

        isNetworkError(message, error) {
            if (!message) return false;
            const networkPatterns = [
                'Failed to fetch',
                'NetworkError',
                'load failed',
                'net::ERR',
                'Network request failed',
                'fetch event respondWith received an error',
                'TypeError: Failed to fetch'
            ];

            if (networkPatterns.some(pattern => message.includes(pattern))) {
                return true;
            }

            if (error && typeof error === 'object' && error.name === 'TypeError' && message.includes('fetch')) {
                return true;
            }

            return false;
        }

        isAuthError(message, error) {
            if (!message) return false;
            const authPatterns = [
                'jwt expired',
                'unauthorized',
                '401',
                'forbidden',
                'token',
                'auth'
            ];

            const lowerMessage = message.toLowerCase();
            return authPatterns.some(pattern => lowerMessage.includes(pattern)) || error?.code === 401;
        }
    }

    new GlobalErrorHandler();
})();
