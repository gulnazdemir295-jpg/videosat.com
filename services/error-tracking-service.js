/**
 * Error Tracking Service
 * Frontend error tracking, performance monitoring, user analytics
 */

class ErrorTrackingService {
    constructor() {
        this.apiUrl = window.getAPIBaseURL ? window.getAPIBaseURL() : '/api';
        this.errors = [];
        this.performanceMetrics = [];
        this.maxErrors = 100;
        this.isEnabled = true;
        this.userInfo = null;
        
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
                error: event.error,
                type: 'javascript'
            });
        });
        
        // Unhandled promise rejection
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                message: event.reason?.message || 'Unhandled Promise Rejection',
                error: event.reason,
                type: 'promise'
            });
        });
        
        // Performance monitoring
        this.initPerformanceMonitoring();
        
        // User info
        this.updateUserInfo();
        
        // Periodic error reporting
        this.startPeriodicReporting();
        
        console.log('✅ Error Tracking Service initialized');
    }

    /**
     * Track error
     */
    trackError(errorData) {
        if (!this.isEnabled) return;
        
        const error = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            message: errorData.message || 'Unknown error',
            filename: errorData.filename || 'unknown',
            lineno: errorData.lineno || 0,
            colno: errorData.colno || 0,
            stack: errorData.error?.stack || '',
            type: errorData.type || 'unknown',
            url: window.location.href,
            userAgent: navigator.userAgent,
            userId: this.userInfo?.id || null,
            userEmail: this.userInfo?.email || null,
            sessionId: this.getSessionId(),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            referrer: document.referrer
        };
        
        // Add to errors array
        this.errors.push(error);
        
        // Keep only last N errors
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // Log to console in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('🔴 Error tracked:', error);
        }
        
        // Send to backend (async, don't block)
        this.sendErrorToBackend(error).catch(err => {
            console.warn('⚠️ Failed to send error to backend:', err);
        });
        
        // Store in localStorage as backup
        this.storeErrorLocally(error);
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
            // Silent fail - don't break the app
            console.warn('⚠️ Error tracking failed:', error);
        }
    }

    /**
     * Store error locally
     */
    storeErrorLocally(error) {
        try {
            const stored = localStorage.getItem('error-tracking-errors');
            const errors = stored ? JSON.parse(stored) : [];
            
            errors.push(error);
            
            // Keep only last 50 errors
            if (errors.length > 50) {
                errors.shift();
            }
            
            localStorage.setItem('error-tracking-errors', JSON.stringify(errors));
        } catch (err) {
            // Silent fail
        }
    }

    /**
     * Initialize performance monitoring
     */
    initPerformanceMonitoring() {
        // Page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.trackPerformance();
            }, 0);
        });
        
        // Long tasks monitoring
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) { // Long task > 50ms
                            this.trackPerformanceMetric({
                                type: 'long-task',
                                duration: entry.duration,
                                startTime: entry.startTime
                            });
                        }
                    }
                });
                
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long task observer not supported
            }
        }
        
        // Resource timing
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 1000) { // Slow resource > 1s
                            this.trackPerformanceMetric({
                                type: 'slow-resource',
                                name: entry.name,
                                duration: entry.duration,
                                size: entry.transferSize || 0
                            });
                        }
                    }
                });
                
                observer.observe({ entryTypes: ['resource'] });
            } catch (e) {
                // Resource observer not supported
            }
        }
    }

    /**
     * Track performance
     */
    trackPerformance() {
        if (!window.performance || !window.performance.timing) return;
        
        const timing = window.performance.timing;
        const navigation = window.performance.navigation;
        
        const metrics = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            url: window.location.href,
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            tcp: timing.connectEnd - timing.connectStart,
            request: timing.responseStart - timing.requestStart,
            response: timing.responseEnd - timing.responseStart,
            dom: timing.domComplete - timing.domLoading,
            load: timing.loadEventEnd - timing.navigationStart,
            type: navigation.type,
            redirects: navigation.redirectCount
        };
        
        this.performanceMetrics.push(metrics);
        
        // Keep only last 50 metrics
        if (this.performanceMetrics.length > 50) {
            this.performanceMetrics.shift();
        }
        
        // Send to backend
        this.sendPerformanceToBackend(metrics).catch(err => {
            console.warn('⚠️ Performance tracking failed:', err);
        });
    }

    /**
     * Track performance metric
     */
    trackPerformanceMetric(metric) {
        const fullMetric = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            url: window.location.href,
            ...metric
        };
        
        this.performanceMetrics.push(fullMetric);
        
        // Keep only last 50 metrics
        if (this.performanceMetrics.length > 50) {
            this.performanceMetrics.shift();
        }
    }

    /**
     * Send performance to backend
     */
    async sendPerformanceToBackend(metrics) {
        try {
            const response = await fetch(`${this.apiUrl}/performance/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(metrics),
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            // Silent fail
        }
    }

    /**
     * Update user info
     */
    updateUserInfo() {
        try {
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                this.userInfo = JSON.parse(userStr);
            }
        } catch (err) {
            // Silent fail
        }
    }

    /**
     * Get session ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('error-tracking-session-id');
        
        if (!sessionId) {
            sessionId = this.generateId();
            sessionStorage.setItem('error-tracking-session-id', sessionId);
        }
        
        return sessionId;
    }

    /**
     * Generate ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Start periodic reporting
     */
    startPeriodicReporting() {
        // Report errors every 30 seconds
        setInterval(() => {
            this.reportPendingErrors();
        }, 30000);
        
        // Report performance every 5 minutes
        setInterval(() => {
            this.reportPerformanceMetrics();
        }, 300000);
    }

    /**
     * Report pending errors
     */
    async reportPendingErrors() {
        const stored = localStorage.getItem('error-tracking-errors');
        if (!stored) return;
        
        try {
            const errors = JSON.parse(stored);
            if (errors.length === 0) return;
            
            // Send to backend
            const response = await fetch(`${this.apiUrl}/errors/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ errors }),
                credentials: 'include'
            });
            
            if (response.ok) {
                // Clear stored errors
                localStorage.removeItem('error-tracking-errors');
            }
        } catch (err) {
            // Silent fail
        }
    }

    /**
     * Report performance metrics
     */
    async reportPerformanceMetrics() {
        if (this.performanceMetrics.length === 0) return;
        
        try {
            const response = await fetch(`${this.apiUrl}/performance/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ metrics: this.performanceMetrics }),
                credentials: 'include'
            });
            
            if (response.ok) {
                // Clear metrics
                this.performanceMetrics = [];
            }
        } catch (err) {
            // Silent fail
        }
    }

    /**
     * Get error statistics
     */
    getErrorStats() {
        const stats = {
            total: this.errors.length,
            byType: {},
            byFile: {},
            recent: this.errors.slice(-10)
        };
        
        this.errors.forEach(error => {
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            stats.byFile[error.filename] = (stats.byFile[error.filename] || 0) + 1;
        });
        
        return stats;
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        if (this.performanceMetrics.length === 0) return null;
        
        const loadTimes = this.performanceMetrics
            .filter(m => m.load)
            .map(m => m.load);
        
        if (loadTimes.length === 0) return null;
        
        return {
            averageLoadTime: loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length,
            minLoadTime: Math.min(...loadTimes),
            maxLoadTime: Math.max(...loadTimes),
            totalMetrics: this.performanceMetrics.length
        };
    }

    /**
     * Enable/Disable tracking
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        localStorage.setItem('error-tracking-enabled', enabled ? 'true' : 'false');
    }
}

// Export
const errorTrackingService = new ErrorTrackingService();
window.errorTrackingService = errorTrackingService;

console.log('✅ Error Tracking Service initialized');
