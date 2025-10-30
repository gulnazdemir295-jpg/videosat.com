// AWS IVS Service - Tarayıcıdan Canlı Yayın
class AWSIVSService {
    constructor() {
        // AWS IVS Credentials
        // ⚠️ GÜVENLİK: Production'da environment variables kullan!
        // Şimdilik simulated/dummy values
        this.streamingEndpoint = 'rtmps://ENDPOINT_BURAYA';
        this.streamKey = 'stream_key_buraya'; // GÜVENLİ YERE SAKLA!
        this.playbackUrl = 'playback_url_buraya';
        this.channelId = 'channel_id_buraya';
        
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

    // 1. AWS IVS Web Broadcast SDK'yı yükle (Yayıncı için)
    // Not: public cdn veya npm kurulumu şarttır!
    // https://web-broadcast.live-video.net/1.8.0/amazon-ivs-web-broadcast.js
    // veya npm: @amazon-ivs/web-broadcast

    // Tarayıcıda global yüklemek için:
    // <script src="https://web-broadcast.live-video.net/1.8.0/amazon-ivs-web-broadcast.js"></script>

    // 2. Playback için Player SDK (izleyici):
    // <script src="https://player.live-video.net/1.19.0/amazon-ivs-player.min.js"></script>

    // IVS Broadcast (Gerçek yayın) - Tarayıcıdan direkt AWS'ye video aktar
    async startIVSBrowserPublish(localVideoElement, opts = {}) {
        // NOT: Environment/config'dan endpoint ve streamKey alınmalı
        const endpoint = opts.endpoint || this.streamingEndpoint;
        const streamKey = opts.streamKey || this.streamKey;
        try {
            // Broadcast SDK'nın yüklenmiş olması gerekir
            if (typeof window.IVSBroadcastClient === 'undefined') {
                throw new Error('AWS IVS Web Broadcast SDK yüklenmedi!');
            }
            // Publish için broadcast client oluştur
            const client = window.IVSBroadcastClient.create({ ingestEndpoint: endpoint });

            // Kamera ve mikrofonu ekle
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            client.addVideoInputDevice(stream);
            client.addAudioInputDevice(stream);
            // Yayını başlat
            client.startBroadcast(streamKey);
            // Video önizleme göster
            if(localVideoElement) {
                localVideoElement.srcObject = stream;
                localVideoElement.muted = true;
                localVideoElement.play();
            }
            this.currentStream = stream;
            this.isStreaming = true;
            this._ivsClient = client;
            return stream;
        } catch (err) {
            console.error('IVS yayın/publish hatası:', err);
            throw err;
        }
    }

    // Yayını durdur
    stopIVSPublish() {
        try {
            if(this._ivsClient) {
                this._ivsClient.stopBroadcast();
                this._ivsClient = null;
            }
            if(this.currentStream) {
                this.currentStream.getTracks().forEach(track => track.stop());
                this.currentStream = null;
            }
            this.isStreaming = false;
            console.log('IVS publish durduruldu');
        } catch (e) {
            console.error('[IVS] Yayın durdurma hatası:', e);
        }
    }

    // Playback için kolaylaştırıcı fonksiyon örneği
    static setupIVSPlayer(videoElement, playbackUrl) {
        // IVS player js yüklü olmalı
        if(window.IVSPlayer && window.IVSPlayer.isPlayerSupported) {
            const player = window.IVSPlayer.create();
            player.attachHTMLVideoElement(videoElement);
            player.load(playbackUrl);
            player.play();
            return player;
        } else {
            videoElement.src = playbackUrl;
        }
    }
}

// Export
window.awsIVSService = new AWSIVSService();
console.log('✅ AWS IVS Service loaded');

