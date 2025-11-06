/**
 * Performance Monitoring Service
 * Performans takibi ve metrikler
 */

class PerformanceMonitoringService {
    constructor() {
        this.apiUrl = window.getAPIBaseURL();
        this.metrics = [];
        this.maxMetrics = 200;
        this.isEnabled = true;
        this.observers = [];
        
        this.init();
    }

    /**
     * Initialize Performance Monitoring
     */
    init() {
        if (!this.isEnabled) return;
        
        // Page load metrics
        this.trackPageLoad();
        
        // Resource timing
        this.trackResourceTiming();
        
        // Long tasks
        this.trackLongTasks();
        
        // Memory usage
        this.trackMemoryUsage();
        
        // Network monitoring
        this.trackNetworkPerformance();
        
        // User interactions
        this.trackUserInteractions();
        
        console.log('✅ Performance Monitoring Service initialized');
    }

    /**
     * Track page load performance
     */
    trackPageLoad() {
        if (document.readyState === 'complete') {
            this.measurePageLoad();
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this.measurePageLoad(), 0);
            });
        }
    }

    /**
     * Measure page load metrics
     */
    measurePageLoad() {
        if (!window.performance || !window.performance.timing) return;
        
        const timing = window.performance.timing;
        const navigation = window.performance.navigation;
        
        const metrics = {
            type: 'pageLoad',
            timestamp: new Date().toISOString(),
            url: window.location.href,
            
            // Navigation timing
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            tcp: timing.connectEnd - timing.connectStart,
            ssl: timing.secureConnectionStart ? timing.connectEnd - timing.secureConnectionStart : 0,
            ttfb: timing.responseStart - timing.requestStart, // Time to First Byte
            download: timing.responseEnd - timing.responseStart,
            domProcessing: timing.domComplete - timing.domInteractive,
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            loadComplete: timing.loadEventEnd - timing.navigationStart,
            
            // Navigation type
            navigationType: this.getNavigationType(navigation.type),
            
            // Redirects
            redirects: navigation.redirectCount,
            
            // Total time
            totalTime: timing.loadEventEnd - timing.navigationStart
        };
        
        this.recordMetric(metrics);
    }

    /**
     * Get navigation type
     */
    getNavigationType(type) {
        const types = {
            0: 'navigate',
            1: 'reload',
            2: 'back_forward',
            3: 'prerender'
        };
        return types[type] || 'unknown';
    }

    /**
     * Track resource timing
     */
    trackResourceTiming() {
        if (!window.performance || !window.performance.getEntriesByType) return;
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                const resources = window.performance.getEntriesByType('resource');
                
                resources.forEach(resource => {
                    const metrics = {
                        type: 'resource',
                        timestamp: new Date().toISOString(),
                        name: resource.name,
                        initiatorType: resource.initiatorType,
                        duration: resource.duration,
                        size: resource.transferSize || 0,
                        cached: resource.transferSize === 0
                    };
                    
                    // Only track slow resources (> 1s) or large resources (> 1MB)
                    if (metrics.duration > 1000 || metrics.size > 1048576) {
                        this.recordMetric(metrics);
                    }
                });
            }, 2000);
        });
    }

    /**
     * Track long tasks
     */
    trackLongTasks() {
        if (!window.PerformanceObserver) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.duration > 50) { // Tasks longer than 50ms
                        this.recordMetric({
                            type: 'longTask',
                            timestamp: new Date().toISOString(),
                            duration: entry.duration,
                            startTime: entry.startTime,
                            name: entry.name
                        });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['longtask', 'measure'] });
            this.observers.push(observer);
        } catch (error) {
            // Long task API not supported
            console.warn('Long task API not supported');
        }
    }

    /**
     * Track memory usage
     */
    trackMemoryUsage() {
        if (!performance.memory) return;
        
        const trackMemory = () => {
            const memory = performance.memory;
            
            this.recordMetric({
                type: 'memory',
                timestamp: new Date().toISOString(),
                usedJSHeapSize: memory.usedJSHeapSize,
                totalJSHeapSize: memory.totalJSHeapSize,
                jsHeapSizeLimit: memory.jsHeapSizeLimit
            });
        };
        
        // Track on load
        window.addEventListener('load', () => {
            setTimeout(trackMemory, 5000);
        });
        
        // Track periodically (every 30 seconds)
        setInterval(trackMemory, 30000);
    }

    /**
     * Track network performance
     */
    trackNetworkPerformance() {
        if (!navigator.connection) return;
        
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        const trackConnection = () => {
            this.recordMetric({
                type: 'network',
                timestamp: new Date().toISOString(),
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            });
        };
        
        trackConnection();
        
        // Track on change
        connection.addEventListener('change', trackConnection);
    }

    /**
     * Track user interactions
     */
    trackUserInteractions() {
        let interactionCount = 0;
        let lastInteractionTime = Date.now();
        
        const trackInteraction = (type) => {
            const now = Date.now();
            const timeSinceLastInteraction = now - lastInteractionTime;
            
            this.recordMetric({
                type: 'interaction',
                timestamp: new Date().toISOString(),
                interactionType: type,
                timeSinceLastInteraction,
                interactionCount: ++interactionCount
            });
            
            lastInteractionTime = now;
        };
        
        // Track clicks
        document.addEventListener('click', () => trackInteraction('click'), { passive: true });
        
        // Track keypresses
        document.addEventListener('keydown', () => trackInteraction('keydown'), { passive: true });
        
        // Track scrolls
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => trackInteraction('scroll'), 100);
        }, { passive: true });
    }

    /**
     * Record metric
     */
    recordMetric(metric) {
        if (!this.isEnabled) return;
        
        const fullMetric = {
            id: this.generateMetricId(),
            ...metric,
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: this.getUserId(),
            sessionId: this.getSessionId()
        };
        
        // Add to metrics
        this.metrics.push(fullMetric);
        
        // Keep only last N metrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift();
        }
        
        // Send critical metrics immediately
        if (this.isCriticalMetric(fullMetric)) {
            this.sendMetricToBackend(fullMetric).catch(err => {
                console.warn('Performance metric backend unavailable:', err);
            });
        }
    }

    /**
     * Generate metric ID
     */
    generateMetricId() {
        return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
     * Check if metric is critical
     */
    isCriticalMetric(metric) {
        // Long tasks > 100ms
        if (metric.type === 'longTask' && metric.duration > 100) {
            return true;
        }
        
        // Page load > 5s
        if (metric.type === 'pageLoad' && metric.totalTime > 5000) {
            return true;
        }
        
        // Memory usage > 80%
        if (metric.type === 'memory' && metric.usedJSHeapSize / metric.jsHeapSizeLimit > 0.8) {
            return true;
        }
        
        return false;
    }

    /**
     * Send metric to backend
     */
    async sendMetricToBackend(metric) {
        try {
            const response = await fetch(`${this.apiUrl}/performance/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(metric),
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            // Silently fail
            console.warn('Performance monitoring backend unavailable:', error);
        }
    }

    /**
     * Get performance summary
     */
    getSummary() {
        const pageLoads = this.metrics.filter(m => m.type === 'pageLoad');
        const longTasks = this.metrics.filter(m => m.type === 'longTask');
        const memory = this.metrics.filter(m => m.type === 'memory');
        
        return {
            totalMetrics: this.metrics.length,
            averagePageLoad: pageLoads.length > 0 
                ? pageLoads.reduce((sum, m) => sum + m.totalTime, 0) / pageLoads.length 
                : 0,
            longTasksCount: longTasks.length,
            averageLongTaskDuration: longTasks.length > 0
                ? longTasks.reduce((sum, m) => sum + m.duration, 0) / longTasks.length
                : 0,
            currentMemory: memory.length > 0 ? memory[memory.length - 1] : null
        };
    }

    /**
     * Enable/Disable monitoring
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        localStorage.setItem('performanceMonitoringEnabled', enabled.toString());
    }

    /**
     * Cleanup
     */
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }
}

// Export
const performanceMonitoringService = new PerformanceMonitoringService();
window.performanceMonitoringService = performanceMonitoringService;

console.log('✅ Performance Monitoring Service initialized');

