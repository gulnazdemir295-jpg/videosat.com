/**
 * Admin Dashboard Service
 * Admin panel için merkezi servis
 */

class AdminDashboardService {
    constructor() {
        this.apiUrl = window.getAPIBaseURL ? window.getAPIBaseURL() : '/api';
        this.stats = {
            users: null,
            payments: null,
            errors: null,
            performance: null,
            streams: null
        };
        this.updateInterval = null;
        this.isAdmin = false;
        
        this.init();
    }

    /**
     * Initialize Admin Dashboard Service
     */
    init() {
        // Check if user is admin
        this.checkAdminStatus();
        
        // Load initial stats
        if (this.isAdmin) {
            this.loadAllStats();
            this.startAutoUpdate();
        }
        
        console.log('✅ Admin Dashboard Service initialized');
    }

    /**
     * Check admin status
     */
    checkAdminStatus() {
        try {
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                this.isAdmin = user.role === 'admin';
            }
        } catch (err) {
            console.error('Admin status check error:', err);
        }
    }

    /**
     * Load all statistics
     */
    async loadAllStats() {
        if (!this.isAdmin) return;
        
        try {
            await Promise.all([
                this.loadUserStats(),
                this.loadPaymentStats(),
                this.loadErrorStats(),
                this.loadPerformanceStats(),
                this.loadStreamStats()
            ]);
        } catch (error) {
            console.error('Stats loading error:', error);
        }
    }

    /**
     * Load user statistics
     */
    async loadUserStats() {
        try {
            const response = await fetch(`${this.apiUrl}/admin/users/stats`, {
                method: 'GET',
                headers: {
                    'x-admin-token': this.getAdminToken()
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.stats.users = data;
                this.notifyListeners('userStatsUpdated', data);
            }
        } catch (error) {
            console.error('User stats loading error:', error);
        }
    }

    /**
     * Load payment statistics
     */
    async loadPaymentStats() {
        try {
            const response = await fetch(`${this.apiUrl}/admin/payments/stats`, {
                method: 'GET',
                headers: {
                    'x-admin-token': this.getAdminToken()
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.stats.payments = data;
                this.notifyListeners('paymentStatsUpdated', data);
            }
        } catch (error) {
            console.error('Payment stats loading error:', error);
        }
    }

    /**
     * Load error statistics
     */
    async loadErrorStats() {
        try {
            const response = await fetch(`${this.apiUrl}/errors/stats`, {
                method: 'GET',
                headers: {
                    'x-admin-token': this.getAdminToken()
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.stats.errors = data;
                this.notifyListeners('errorStatsUpdated', data);
            }
        } catch (error) {
            console.error('Error stats loading error:', error);
        }
    }

    /**
     * Load performance statistics
     */
    async loadPerformanceStats() {
        try {
            const response = await fetch(`${this.apiUrl}/performance/stats`, {
                method: 'GET',
                headers: {
                    'x-admin-token': this.getAdminToken()
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.stats.performance = data;
                this.notifyListeners('performanceStatsUpdated', data);
            }
        } catch (error) {
            console.error('Performance stats loading error:', error);
        }
    }

    /**
     * Load stream statistics
     */
    async loadStreamStats() {
        try {
            const response = await fetch(`${this.apiUrl}/admin/streams/stats`, {
                method: 'GET',
                headers: {
                    'x-admin-token': this.getAdminToken()
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.stats.streams = data;
                this.notifyListeners('streamStatsUpdated', data);
            }
        } catch (error) {
            console.error('Stream stats loading error:', error);
        }
    }

    /**
     * Get all stats
     */
    getAllStats() {
        return this.stats;
    }

    /**
     * Get specific stat
     */
    getStat(type) {
        return this.stats[type] || null;
    }

    /**
     * Start auto update
     */
    startAutoUpdate(interval = 30000) {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(() => {
            if (this.isAdmin) {
                this.loadAllStats();
            }
        }, interval);
    }

    /**
     * Stop auto update
     */
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Get admin token
     */
    getAdminToken() {
        // In production, this should be a secure token
        // For now, return a placeholder
        return localStorage.getItem('adminToken') || 'admin-token-placeholder';
    }

    /**
     * Event listeners
     */
    listeners = {};

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    notifyListeners(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Event listener error:', error);
                }
            });
        }
    }

    /**
     * Get users list
     */
    async getUsers(limit = 50, offset = 0) {
        try {
            const response = await fetch(`${this.apiUrl}/admin/users?limit=${limit}&offset=${offset}`, {
                method: 'GET',
                headers: {
                    'x-admin-token': this.getAdminToken()
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Get users error:', error);
            return null;
        }
    }

    /**
     * Get errors list
     */
    async getErrors(limit = 100, offset = 0, type = null) {
        try {
            let url = `${this.apiUrl}/errors?limit=${limit}&offset=${offset}`;
            if (type) {
                url += `&type=${type}`;
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-admin-token': this.getAdminToken()
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Get errors error:', error);
            return null;
        }
    }

    /**
     * Get performance metrics
     */
    async getPerformanceMetrics(limit = 100, offset = 0) {
        try {
            const response = await fetch(`${this.apiUrl}/performance?limit=${limit}&offset=${offset}`, {
                method: 'GET',
                headers: {
                    'x-admin-token': this.getAdminToken()
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Get performance error:', error);
            return null;
        }
    }

    /**
     * Export data
     */
    async exportData(type, format = 'json') {
        try {
            const response = await fetch(`${this.apiUrl}/admin/export?type=${type}&format=${format}`, {
                method: 'GET',
                headers: {
                    'x-admin-token': this.getAdminToken()
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${type}-export.${format}`;
                a.click();
                window.URL.revokeObjectURL(url);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Export error:', error);
            return false;
        }
    }
}

// Export
const adminDashboardService = new AdminDashboardService();
window.adminDashboardService = adminDashboardService;

console.log('✅ Admin Dashboard Service initialized');

