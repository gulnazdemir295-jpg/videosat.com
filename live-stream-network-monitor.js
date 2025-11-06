/**
 * Agora Network Quality Monitor
 * 
 * Network quality monitoring ve stream quality adaptation için utility
 */

class AgoraNetworkMonitor {
    constructor(agoraClient) {
        this.client = agoraClient;
        this.networkQuality = {
            uplinkNetworkQuality: 0, // 0-6 (0=unknown, 6=excellent)
            downlinkNetworkQuality: 0,
            rtt: 0,
            packetLoss: 0
        };
        this.qualityHistory = [];
        this.listeners = [];
        this.monitoringInterval = null;
        
        this.init();
    }
    
    init() {
        if (!this.client) {
            console.warn('⚠️ Agora client yok, network monitoring başlatılamadı');
            return;
        }
        
        // Network quality event listener
        this.client.on('network-quality', (stats) => {
            this.updateNetworkQuality(stats);
        });
        
        // Connection state change listener
        this.client.on('connection-state-change', (curState, revState) => {
            this.handleConnectionStateChange(curState, revState);
        });
        
        // Exception listener
        this.client.on('exception', (evt) => {
            this.handleException(evt);
        });
        
        console.log('✅ Network quality monitor başlatıldı');
    }
    
    updateNetworkQuality(stats) {
        const previousQuality = { ...this.networkQuality };
        
        this.networkQuality = {
            uplinkNetworkQuality: stats.uplinkNetworkQuality || 0,
            downlinkNetworkQuality: stats.downlinkNetworkQuality || 0,
            rtt: stats.rtt || 0,
            packetLoss: stats.packetLoss || 0
        };
        
        // Quality history (son 10 ölçüm)
        this.qualityHistory.push({
            ...this.networkQuality,
            timestamp: Date.now()
        });
        
        if (this.qualityHistory.length > 10) {
            this.qualityHistory.shift();
        }
        
        // Quality değişikliği varsa listener'lara bildir
        if (previousQuality.uplinkNetworkQuality !== this.networkQuality.uplinkNetworkQuality ||
            previousQuality.downlinkNetworkQuality !== this.networkQuality.downlinkNetworkQuality) {
            this.notifyListeners('quality-change', this.networkQuality);
        }
        
        // Poor quality uyarısı
        if (this.networkQuality.uplinkNetworkQuality <= 2) {
            this.notifyListeners('poor-quality', this.networkQuality);
        }
    }
    
    handleConnectionStateChange(curState, revState) {
        console.log(`📡 Connection state: ${revState} -> ${curState}`);
        
        if (curState === 'DISCONNECTED' || curState === 'FAILED') {
            this.notifyListeners('connection-lost', { curState, revState });
        } else if (curState === 'CONNECTED' || curState === 'RECONNECTING') {
            this.notifyListeners('connection-restored', { curState, revState });
        }
    }
    
    handleException(evt) {
        console.error('❌ Agora exception:', evt);
        this.notifyListeners('exception', evt);
    }
    
    /**
     * Network quality'ye göre önerilen video quality
     */
    getRecommendedVideoQuality() {
        const uplink = this.networkQuality.uplinkNetworkQuality;
        
        // Agora network quality: 0=unknown, 1=excellent, 2=good, 3=poor, 4=bad, 5=very bad, 6=down
        if (uplink >= 4) {
            return 'low'; // 240p veya 360p
        } else if (uplink >= 2) {
            return 'medium'; // 480p
        } else {
            return 'high'; // 720p veya 1080p
        }
    }
    
    /**
     * Network quality string
     */
    getQualityString(quality) {
        const qualityMap = {
            0: 'Unknown',
            1: 'Excellent',
            2: 'Good',
            3: 'Poor',
            4: 'Bad',
            5: 'Very Bad',
            6: 'Down'
        };
        return qualityMap[quality] || 'Unknown';
    }
    
    /**
     * Current network quality bilgisi
     */
    getNetworkQualityInfo() {
        return {
            ...this.networkQuality,
            uplinkQualityString: this.getQualityString(this.networkQuality.uplinkNetworkQuality),
            downlinkQualityString: this.getQualityString(this.networkQuality.downlinkNetworkQuality),
            recommendedQuality: this.getRecommendedVideoQuality(),
            averageQuality: this.getAverageQuality()
        };
    }
    
    /**
     * Ortalama network quality (son 10 ölçüm)
     */
    getAverageQuality() {
        if (this.qualityHistory.length === 0) {
            return 0;
        }
        
        const sum = this.qualityHistory.reduce((acc, q) => acc + q.uplinkNetworkQuality, 0);
        return Math.round(sum / this.qualityHistory.length);
    }
    
    /**
     * Listener ekle
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    /**
     * Listener kaldır
     */
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
    
    /**
     * Listener'lara bildir
     */
    notifyListeners(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Listener error:', error);
                }
            });
        }
    }
    
    /**
     * Monitoring'i durdur
     */
    stop() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        if (this.client) {
            this.client.off('network-quality');
            this.client.off('connection-state-change');
            this.client.off('exception');
        }
        
        this.listeners = [];
        console.log('⏹️ Network quality monitor durduruldu');
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgoraNetworkMonitor;
} else {
    window.AgoraNetworkMonitor = AgoraNetworkMonitor;
}

