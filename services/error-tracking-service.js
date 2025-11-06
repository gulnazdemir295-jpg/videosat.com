/**
 * Error Tracking Service
 * Hata takibi ve raporlama
 */

class ErrorTrackingService {
    constructor() {
        this.apiUrl = window.getAPIBaseURL();
        this.errors = [];
        this.maxErrors = 100;
        this.isEnabled = true;
        this.environment = this.getEnvironment();
        
        this.init();
    }

    /**
     * Initialize Error Tracking
     */
    init() {
        if (!this.isEnabled) return;
        
        // Global error handler
        window.addEventListener('error', (event) => {
            this.trackError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                type: 'javascript',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });
        
        // Unhandled promise rejection
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                message: event.reason?.message || 'Unhandled Promise Rejection',
                stack: event.reason?.stack,
                type: 'promise',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });
        
        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target && event.target !== window) {
                this.trackError({
                    message: `Resource loading error: ${event.target.tagName}`,
                    filename: event.target.src || event.target.href,
                    type: 'resource',
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: window.location.href
                });
            }
        }, true);
        
        console.log('✅ Error Tracking Service initialized');
    }

    /**
     * Get environment
     */
    getEnvironment() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        } else if (hostname.includes('staging') || hostname.includes('test')) {
            return 'staging';
        } else {
            return 'production';
        }
    }

    /**
     * Track error
     */
    trackError(errorData) {
        if (!this.isEnabled) return;
        
        const error = {
            id: this.generateErrorId(),
            ...errorData,
            environment: this.environment,
            userId: this.getUserId(),
            sessionId: this.getSessionId()
        };
        
        // Add to local storage
        this.errors.push(error);
        
        // Keep only last N errors
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // Save to localStorage
        this.saveErrors();
        
        // Send to backend (async, don't block)
        this.sendErrorToBackend(error).catch(err => {
            console.error('Error sending to backend:', err);
        });
        
        // Log to console in development
        if (this.environment === 'development') {
            console.error('🚨 Error tracked:', error);
        }
    }

    /**
     * Generate error ID
     */
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get user ID
     */
    getUserId() {
        try {
            const user = localStorage.getItem('currentUser');
            if (user) {
                const userData = JSON.parse(user);
                return userData.id || userData.email || 'anonymous';
            }
        } catch (error) {
            // Ignore
        }
        return 'anonymous';
    }

    /**
     * Get session ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    /**
     * Save errors to localStorage
     */
    saveErrors() {
        try {
            localStorage.setItem('errorTracking', JSON.stringify(this.errors.slice(-50))); // Last 50
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    /**
     * Load errors from localStorage
     */
    loadErrors() {
        try {
            const saved = localStorage.getItem('errorTracking');
            if (saved) {
                this.errors = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }

    /**
     * Send error to backend
     */
    async sendErrorToBackend(error) {
        try {
            const response = await fetch(`${this.apiUrl}/errors/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(error),
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            // Silently fail - don't break the app
            console.warn('Error tracking backend unavailable:', error);
        }
    }

    /**
     * Get all errors
     */
    getErrors(limit = 50) {
        return this.errors.slice(-limit).reverse();
    }

    /**
     * Get errors by type
     */
    getErrorsByType(type) {
        return this.errors.filter(error => error.type === type);
    }

    /**
     * Clear errors
     */
    clearErrors() {
        this.errors = [];
        localStorage.removeItem('errorTracking');
    }

    /**
     * Enable/Disable tracking
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        localStorage.setItem('errorTrackingEnabled', enabled.toString());
    }

    /**
     * Get error statistics
     */
    getStatistics() {
        const stats = {
            total: this.errors.length,
            byType: {},
            byEnvironment: {},
            recent: this.errors.slice(-10).reverse()
        };
        
        this.errors.forEach(error => {
            // By type
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            
            // By environment
            stats.byEnvironment[error.environment] = (stats.byEnvironment[error.environment] || 0) + 1;
        });
        
        return stats;
    }

    /**
     * Manual error report
     */
    reportError(message, details = {}) {
        this.trackError({
            message,
            type: 'manual',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...details
        });
    }
}

// Export
const errorTrackingService = new ErrorTrackingService();
window.errorTrackingService = errorTrackingService;

// Global error handler (fallback)
window.onerror = function(message, source, lineno, colno, error) {
    if (window.errorTrackingService) {
        window.errorTrackingService.trackError({
            message,
            filename: source,
            lineno,
            colno,
            stack: error?.stack,
            type: 'javascript',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
    }
    return false; // Don't prevent default handling
};

console.log('✅ Error Tracking Service initialized');

