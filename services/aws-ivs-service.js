// AWS IVS Service - Tarayıcıdan Canlı Yayın
class AWSIVSService {
    constructor() {
        // AWS IVS Credentials (AWS Console'dan kopyalandı)
        this.streamingEndpoint = 'rtmps://global-live.mux.com:443/app/';
        this.streamKey = 'sk_us-east-1_eAWtBjlj56zE_yYXjvk2F9Ji7AgmLSqXI0R1ZOnOFSw';
        this.playbackUrl = 'https://390d27dc4a33.us-east-1.playback.live-video.net/api/video/v1/us-east-1.328185871955.channel.gnI3jUnKmV1K.m3u8';
        this.channelId = 'gnI3jUnKmV1K'; // Channel ID playback URL'den çıkarıldı
        
        // Internal state
        this.isStreaming = false;
        this.currentStream = null;
    }

    // Channel ID'sini göster
    getChannelId() {
        return this.channelId;
    }

    // Stream başlat (tarayıcıdan)
    async startBrowserStream() {
        try {
            console.log('🎬 Canlı yayın başlatılıyor...');
            
            // 1. Kamerayı aç
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            console.log('✅ Kamera açıldı');
            this.currentStream = stream;
            
            // 2. AWS IVS'e bağla (simulated - gerçek stream henüz değil)
            // TODO: Gerçek AWS IVS WebRTC entegrasyonu eklenecek
            this.isStreaming = true;
            
            console.log('🔴 Yayın başlatıldı (simulated)');
            console.log('📺 Playback URL:', this.playbackUrl);
            
            return stream;
            
        } catch (e) {
            console.error('❌ Stream başlatılamadı:', e);
            this.isStreaming = false;
            throw e;
        }
    }

    // Stream durdur
    stopStream() {
        try {
            console.log('⏹️ Yayın durduruluyor...');
            
            if (this.currentStream) {
                // Tüm track'leri durdur
                this.currentStream.getTracks().forEach(track => {
                    track.stop();
                });
                this.currentStream = null;
            }
            
            this.isStreaming = false;
            console.log('✅ Yayın durduruldu');
            
        } catch (e) {
            console.error('❌ Stream durdurma hatası:', e);
        }
    }

    // Playback URL'i al (izleyiciler için)
    getPlaybackUrl() {
        return this.playbackUrl;
    }

    // Stream durumunu kontrol et
    isActive() {
        return this.isStreaming;
    }

    // Stream key'i al (güvenlik nedeniyle sadece server-side kullanılmalı)
    getStreamKey() {
        return this.streamKey;
    }
}

// Export
window.awsIVSService = new AWSIVSService();
console.log('✅ AWS IVS Service loaded');

