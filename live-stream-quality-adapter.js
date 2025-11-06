/**
 * Agora Stream Quality Adapter
 * 
 * Network quality'ye göre otomatik stream quality adaptation
 */

class AgoraQualityAdapter {
    constructor(agoraClient, videoTrack, networkMonitor) {
        this.client = agoraClient;
        this.videoTrack = videoTrack;
        this.networkMonitor = networkMonitor;
        this.currentQuality = 'high'; // high, medium, low
        this.qualitySettings = {
            high: {
                width: 1280,
                height: 720,
                frameRate: 30,
                bitrate: 2000
            },
            medium: {
                width: 854,
                height: 480,
                frameRate: 24,
                bitrate: 1000
            },
            low: {
                width: 640,
                height: 360,
                frameRate: 15,
                bitrate: 500
            }
        };
        this.adaptationEnabled = true;
        this.adaptationInterval = null;
        
        this.init();
    }
    
    init() {
        if (!this.networkMonitor) {
            console.warn('⚠️ Network monitor yok, quality adaptation devre dışı');
            return;
        }
        
        // Network quality değişikliklerini dinle
        this.networkMonitor.on('quality-change', (quality) => {
            this.handleQualityChange(quality);
        });
        
        this.networkMonitor.on('poor-quality', (quality) => {
            this.handlePoorQuality(quality);
        });
        
        // Periyodik quality check (her 10 saniyede bir)
        this.adaptationInterval = setInterval(() => {
            this.checkAndAdapt();
        }, 10000);
        
        console.log('✅ Stream quality adapter başlatıldı');
    }
    
    handleQualityChange(quality) {
        if (!this.adaptationEnabled) {
            return;
        }
        
        const recommendedQuality = this.networkMonitor.getRecommendedVideoQuality();
        if (recommendedQuality !== this.currentQuality) {
            this.adaptQuality(recommendedQuality);
        }
    }
    
    handlePoorQuality(quality) {
        if (!this.adaptationEnabled) {
            return;
        }
        
        // Poor quality durumunda hemen düşük kaliteye geç
        if (this.currentQuality !== 'low') {
            console.warn('⚠️ Poor network quality detected, switching to low quality');
            this.adaptQuality('low');
        }
    }
    
    checkAndAdapt() {
        if (!this.adaptationEnabled || !this.videoTrack) {
            return;
        }
        
        const recommendedQuality = this.networkMonitor.getRecommendedVideoQuality();
        if (recommendedQuality !== this.currentQuality) {
            this.adaptQuality(recommendedQuality);
        }
    }
    
    /**
     * Quality'yi adapt et
     */
    async adaptQuality(targetQuality) {
        if (!this.videoTrack) {
            console.warn('⚠️ Video track yok, quality adaptation yapılamıyor');
            return;
        }
        
        const settings = this.qualitySettings[targetQuality];
        if (!settings) {
            console.error('❌ Geçersiz quality setting:', targetQuality);
            return;
        }
        
        try {
            console.log(`🔄 Quality adaptation: ${this.currentQuality} -> ${targetQuality}`);
            
            // Video track encoding parametrelerini güncelle
            if (this.videoTrack.setEncoderConfiguration) {
                await this.videoTrack.setEncoderConfiguration({
                    width: settings.width,
                    height: settings.height,
                    frameRate: settings.frameRate,
                    bitrateMax: settings.bitrate * 1000, // kbps to bps
                    bitrateMin: settings.bitrate * 500
                });
                
                this.currentQuality = targetQuality;
                console.log(`✅ Quality adapted to ${targetQuality} (${settings.width}x${settings.height}@${settings.frameRate}fps)`);
                
                // UI'ya bildir
                this.notifyQualityChange(targetQuality, settings);
            } else {
                console.warn('⚠️ setEncoderConfiguration metodu desteklenmiyor');
            }
        } catch (error) {
            console.error('❌ Quality adaptation hatası:', error);
        }
    }
    
    /**
     * Manuel quality ayarla
     */
    async setQuality(quality) {
        if (!['high', 'medium', 'low'].includes(quality)) {
            console.error('❌ Geçersiz quality:', quality);
            return;
        }
        
        // Manuel ayar yapıldığında otomatik adaptation'ı geçici olarak devre dışı bırak
        this.adaptationEnabled = false;
        
        await this.adaptQuality(quality);
        
        // 30 saniye sonra otomatik adaptation'ı tekrar aktif et
        setTimeout(() => {
            this.adaptationEnabled = true;
            console.log('✅ Automatic quality adaptation re-enabled');
        }, 30000);
    }
    
    /**
     * Quality change notification
     */
    notifyQualityChange(quality, settings) {
        // Custom event dispatch
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('stream-quality-changed', {
                detail: {
                    quality,
                    settings,
                    timestamp: Date.now()
                }
            }));
        }
        
        // Status update
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = `Yayın kalitesi: ${quality.toUpperCase()} (${settings.width}x${settings.height})`;
        }
    }
    
    /**
     * Adaptation'ı durdur
     */
    stop() {
        if (this.adaptationInterval) {
            clearInterval(this.adaptationInterval);
            this.adaptationInterval = null;
        }
        
        if (this.networkMonitor) {
            this.networkMonitor.off('quality-change', this.handleQualityChange);
            this.networkMonitor.off('poor-quality', this.handlePoorQuality);
        }
        
        console.log('⏹️ Stream quality adapter durduruldu');
    }
    
    /**
     * Mevcut quality bilgisi
     */
    getCurrentQuality() {
        return {
            quality: this.currentQuality,
            settings: this.qualitySettings[this.currentQuality],
            adaptationEnabled: this.adaptationEnabled
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgoraQualityAdapter;
} else {
    window.AgoraQualityAdapter = AgoraQualityAdapter;
}

