// VideoSat - Temiz Canlı Yayın Sistemi
// Tüm sorunlar çözüldü, minimal ve çalışır kod

let localStream = null;
let agoraClient = null;
let agoraTracks = {
    videoTrack: null,
    audioTrack: null
};
let isStreaming = false;
let currentChannelId = null;
let currentUser = null;
let likeCount = 0;
let isLiked = false;
let localAgoraUid = null; // Local Agora UID (sonsuz döngü önlemek için)

// API Base URL (Merkezi config kullanıyor)
function getAPIBaseURL() {
    // Fallback: Hostname'e göre belirle (sonsuz döngü önlemek için direkt kontrol)
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Production - Nginx ile backend api.basvideo.com'da
    if (hostname === 'basvideo.com' || hostname.includes('basvideo.com')) {
        return 'https://api.basvideo.com/api';  // Nginx backend URL
    }
    
    // Local development - Merkezi default port
    const DEFAULT_BACKEND_PORT = window.DEFAULT_BACKEND_PORT || 3000;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `http://localhost:${DEFAULT_BACKEND_PORT}/api`;
    }
    
    // Fallback: Mevcut origin + /api
    return `${protocol}//${hostname}:${DEFAULT_BACKEND_PORT}/api`;
}

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎬 Canlı Yayın Sistemi Başlatılıyor...');
    
    // Backend config kontrolü
    try {
        if (typeof window.getAPIBaseURL === 'undefined') {
            console.warn('⚠️ Backend config yüklenmedi, fallback kullanılıyor');
            // Fallback: getAPIBaseURL zaten tanımlı
        }
    } catch (error) {
        console.warn('⚠️ Backend config kontrol hatası:', error);
    }
    
    // Agora SDK kontrolü
    try {
        // SDK yüklenene kadar bekle (max 5 saniye)
        let attempts = 0;
        while (typeof AgoraRTC === 'undefined' && attempts < 25) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }
        
        if (typeof AgoraRTC === 'undefined') {
            console.error('❌ Agora SDK yüklenemedi!');
            updateStatus('Agora SDK yüklenemedi. Sayfayı yenileyin.');
            return;
        }
        
        console.log('✅ Agora SDK yüklendi');
    } catch (error) {
        console.error('❌ Agora SDK kontrol hatası:', error);
        updateStatus('Agora SDK yüklenirken hata oluştu. Sayfayı yenileyin.');
    }
    
    // Kullanıcı bilgisini yükle
    try {
        loadUserData();
    } catch (error) {
        console.error('❌ Kullanıcı yükleme hatası:', error);
    }
        
    // Backend bağlantısını test et
    try {
        await testBackendConnection();
    } catch (error) {
        console.warn('⚠️ Backend bağlantı testi hatası:', error);
    }
        
    // Pre-stream setup'ı gizle
    try {
        const preStreamSetup = document.getElementById('preStreamSetup');
        if (preStreamSetup) {
            preStreamSetup.style.display = 'none';
        }
    } catch (error) {
        // Sessizce görmezden gel
    }
    
    console.log('✅ Sistem hazır');
});

// Load User Data
function loadUserData() {
    try {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            currentUser = JSON.parse(userData);
            console.log('✅ Kullanıcı yüklendi:', currentUser.email);
    } else {
            // Test için varsayılan kullanıcı
            currentUser = {
                email: 'test@example.com',
                name: 'Test Kullanıcı',
                role: 'satici'
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    } catch (error) {
        console.error('Kullanıcı yükleme hatası:', error);
        currentUser = {
            email: 'test@example.com',
            name: 'Test Kullanıcı',
            role: 'satici'
        };
    }
}

// Test Backend Connection
async function testBackendConnection() {
    try {
        const response = await fetch(`${getAPIBaseURL()}/health`);
        if (response.ok) {
            console.log('✅ Backend bağlantısı başarılı');
            return true;
        }
    } catch (error) {
        console.warn('⚠️ Backend bağlantısı test edilemedi:', error);
    }
    return false;
}

// Request Camera Access
async function requestCameraAccess() {
    console.log('📹 Kamera erişimi isteniyor...');
    
    try {
        updateStatus('Kamera ve mikrofon erişimi isteniyor... Tarayıcıdan izin verin!');
        
        // Butonu devre dışı bırak
        const cameraBtn = document.getElementById('cameraAccessBtn');
        if (cameraBtn) {
            cameraBtn.disabled = true;
            cameraBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> İzin bekleniyor...';
        }
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('WebRTC desteklenmiyor. Modern bir tarayıcı kullanın.');
        }
        
        // HTTPS kontrolü
    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    if (!isSecure) {
            throw new Error('Kamera erişimi için HTTPS gereklidir. Lütfen HTTPS kullanın.');
        }
        
        // getUserMedia çağrısı - tarayıcı izin pop-up'ını açacak
        console.log('🔔 Tarayıcı izin pop-up açılacak...');
        localStream = await navigator.mediaDevices.getUserMedia({
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true
            }
        });
        
        console.log('✅ Kamera erişimi başarılı');
        console.log('📹 Video tracks:', localStream.getVideoTracks().length);
        console.log('🎤 Audio tracks:', localStream.getAudioTracks().length);
        
        // Local video'yu göster
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = localStream;
            localVideo.style.display = 'block';
            localVideo.play().catch(err => {
                console.warn('Video play hatası:', err);
            });
        }
        
        // Track'leri kontrol et
        const videoTracks = localStream.getVideoTracks();
        const audioTracks = localStream.getAudioTracks();
        
        if (videoTracks.length > 0) {
            console.log('✅ Video track aktif:', videoTracks[0].label);
            updateStatus('✅ Kamera erişimi başarılı! Video: ' + videoTracks[0].label + ' - Yayını başlatabilirsiniz.');
    } else {
            console.warn('⚠️ Video track bulunamadı');
            updateStatus('⚠️ Kamera erişimi başarılı ama video track yok');
        }
        
        if (audioTracks.length > 0) {
            console.log('✅ Audio track aktif:', audioTracks[0].label);
        } else {
            console.warn('⚠️ Audio track bulunamadı');
        }
        
        // Kamera butonunu gizle, yayın butonunu göster
        if (cameraBtn) {
            cameraBtn.style.display = 'none';
        }
        const startBtn = document.getElementById('startStreamBtn');
        if (startBtn) {
            startBtn.style.display = 'block';
            startBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('❌ Kamera erişimi hatası:', error);
        console.error('Hata detayı:', error.name, error.message);
        
        let errorMessage = 'Kamera erişimi hatası: ';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            errorMessage = 'Kamera erişimi reddedildi. Lütfen tarayıcı ayarlarından kamera ve mikrofon izinlerini verin.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            errorMessage = 'Kamera bulunamadı. Lütfen bir kamera bağlı olduğundan emin olun.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            errorMessage = 'Kamera kullanımda. Lütfen başka bir uygulama kamerayı kullanıyorsa kapatın.';
    } else {
            errorMessage += error.message;
        }
        
        updateStatus(errorMessage);
        
        // Butonu tekrar aktif et
        const cameraBtn = document.getElementById('cameraAccessBtn');
        if (cameraBtn) {
            cameraBtn.disabled = false;
            cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Kamera Erişimi İste';
        }
        
        alert(errorMessage);
    }
}

// Start Stream
async function startStream() {
    // Kamera kontrolü
    if (!localStream) {
        const confirmResult = confirm('Kamera erişimi yok. Önce kamera erişimi isteyiniz!\n\nKamera erişimi iste butonuna tıklayın.');
        if (confirmResult) {
            await requestCameraAccess();
        }
        return;
    }
    
    // Stream track'lerini kontrol et
    const videoTracks = localStream.getVideoTracks();
    const audioTracks = localStream.getAudioTracks();
    
    if (videoTracks.length === 0) {
        alert('Video track bulunamadı. Lütfen kamera erişimini tekrar deneyin.');
        await requestCameraAccess();
        return;
    }
    
    if (isStreaming) {
        console.warn('Yayın zaten aktif');
        updateStatus('Yayın zaten aktif!');
        return;
    }
    
    console.log('🎬 Yayın başlatılıyor...');
    updateStatus('Yayın başlatılıyor...');
    
    // Butonu devre dışı bırak
    const startBtn = document.getElementById('startStreamBtn');
    if (startBtn) {
        startBtn.disabled = true;
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Başlatılıyor...';
    }
    
    try {
        // Backend'den channel bilgisi al
        const roomId = 'main-room';
        console.log('📡 Backend\'e istek gönderiliyor:', `${getAPIBaseURL()}/rooms/${roomId}/join`);
        
        const response = await fetch(`${getAPIBaseURL()}/rooms/${roomId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // CORS için
            body: JSON.stringify({
                streamerEmail: currentUser.email,
                streamerName: currentUser.name || currentUser.email,
                deviceInfo: navigator.userAgent
            })
        });

        console.log('📡 Backend yanıtı:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Backend hatası:', errorText);
            throw new Error(`Backend yanıt vermedi (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Backend yanıtı:', data);
        
        if (!data.ok) {
            throw new Error(data.error || 'Channel oluşturulamadı');
        }
        
        if (!data.channelId) {
            throw new Error('Channel ID alınamadı');
        }
        
        currentChannelId = data.channelId;
        console.log('✅ Channel oluşturuldu:', currentChannelId);
        console.log('📦 Provider:', data.provider);
        
        // Agora ile yayın başlat (AWS IVS artık kullanılmıyor)
        if (data.provider === 'AGORA') {
            console.log('📡 Agora yayını başlatılıyor...');
            await startAgoraStream(data);
        } else {
            // Provider AGORA değilse hata ver
            throw new Error(`Beklenmeyen provider: ${data.provider}. Backend AGORA kullanmalı. STREAM_PROVIDER=AGORA kontrol edin.`);
        }
        
        isStreaming = true;
        updateLiveStatus('CANLI');
        updateStatus('✅ Yayın aktif! İzleyiciler katılabilir.');
        
        // Butonları güncelle
        if (startBtn) {
            startBtn.style.display = 'none';
        }
        const stopBtn = document.getElementById('stopStreamBtn');
        if (stopBtn) {
            stopBtn.style.display = 'block';
            stopBtn.disabled = false;
        }
        
        // Beğeni sayısını yükle
        await loadLikes();
        
        // Başarı mesajı
        console.log('✅ Yayın başarıyla başlatıldı!');
        
    } catch (error) {
        console.error('❌ Yayın başlatma hatası:', error);
        console.error('Hata detayı:', error.name, error.message, error.stack);
        
        updateStatus('❌ Yayın başlatma hatası: ' + error.message);
        
        // Butonu tekrar aktif et
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Yayını Başlat';
        }
        
        alert('Yayın başlatılamadı:\n\n' + error.message + '\n\nLütfen konsolu kontrol edin (F12).');
    }
}

// Start Agora Stream
async function startAgoraStream(channelData) {
    console.log('📡 Agora yayını başlatılıyor...');
    
    try {
        if (!AgoraRTC) {
            throw new Error('Agora SDK yüklenmedi');
        }
        
        // Eğer client zaten varsa, önce temizle
        if (agoraClient) {
            try {
                await agoraClient.leave();
                agoraClient.removeAllListeners();
            } catch (e) {
                console.warn('Önceki client temizlenirken hata:', e);
            }
            agoraClient = null;
        }
        
        // Agora Client oluştur
        agoraClient = AgoraRTC.createClient({ 
            mode: 'live', 
            codec: 'vp8' 
        });
        
        // Publish flag (sonsuz döngü önlemek için)
        let isPublishing = false;
        
        // Event listeners ekle (remote user'lar için) - sadece bir kez
        agoraClient.on('user-published', async (user, mediaType) => {
            // Kendi stream'imizi ignore et (sonsuz döngü önlemek için)
            if (localAgoraUid !== null && user.uid === localAgoraUid) {
                console.log('⚠️ Local user stream ignore edildi (kendi stream\'imiz), UID:', user.uid);
                return;
            }
            
            // Eğer şu anda publish işlemi yapıyorsak, ignore et
            if (isPublishing) {
                console.log('⚠️ Publish işlemi sırasında event ignore edildi');
                return;
            }
            
            console.log('📡 Remote user published:', user.uid, mediaType);
            try {
                // Remote user'ı subscribe et
                await agoraClient.subscribe(user, mediaType);
                
                if (mediaType === 'video') {
                    const remoteVideo = document.getElementById('remoteVideo');
                    if (remoteVideo && user.videoTrack) {
                        // play() metoduna DOM elementi verilmeli, string ID değil
                        user.videoTrack.play(remoteVideo);
                        remoteVideo.style.display = 'block';
                        console.log('✅ Remote video oynatılıyor');
                    }
                }
                
                if (mediaType === 'audio') {
                    if (user.audioTrack) {
                        // Audio track için play() çağrısı gerekmez, otomatik oynatılır
                        console.log('✅ Remote audio oynatılıyor');
                    }
                }
            } catch (subscribeError) {
                console.error('❌ Subscribe hatası:', subscribeError);
            }
        });
        
        agoraClient.on('user-unpublished', (user, mediaType) => {
            console.log('📡 Remote user unpublished:', user.uid, mediaType);
            if (mediaType === 'video') {
                const remoteVideo = document.getElementById('remoteVideo');
                if (remoteVideo) {
                    remoteVideo.style.display = 'none';
                }
            }
        });
        
        agoraClient.on('exception', (evt) => {
            console.error('❌ Agora exception:', evt);
        });
        
        console.log('✅ Agora client oluşturuldu ve event listener\'lar eklendi');
        
        // Channel'a katıl - webrtc token kullan
        const token = channelData.webrtc?.token || channelData.publisherToken || null;
        const uid = channelData.webrtc?.uid || null;
        
        console.log('📡 Agora join parametreleri:', {
            appId: channelData.appId,
            appIdLength: channelData.appId?.length || 0,
            channelName: channelData.channelName,
            hasToken: !!token,
            tokenLength: token ? token.length : 0,
            uid: uid
        });
        
        // App ID kontrolü
        if (!channelData.appId || channelData.appId.length !== 32) {
            throw new Error(`Geçersiz App ID: ${channelData.appId}. App ID 32 karakter olmalı.`);
        }
        
        // Token ile join (Agora resmi paket ile oluşturuldu)
        // Agora'nın resmi token generator paketi kullanılıyor
        let joinedUid;
        
        if (token) {
            // Token ile join (production - Agora resmi paket ile oluşturuldu)
            console.log('🔑 Token ile join ediliyor (Agora resmi paket ile oluşturuldu)...');
            joinedUid = await agoraClient.join(
                channelData.appId,
                channelData.channelName,
                token,
                uid || null
            );
            console.log('✅ Token ile join başarılı');
        } else {
            // Token yoksa development mode (sadece test için)
            console.warn('⚠️ Token yok, development mode deneniyor...');
            joinedUid = await agoraClient.join(
                channelData.appId,
                channelData.channelName,
                null, // Token null (development mode)
                uid || null
            );
            console.log('✅ Development mode başarılı (token olmadan)');
        }
        
        localAgoraUid = joinedUid; // Local UID'yi global değişkene sakla (sonsuz döngü önlemek için)
        console.log('✅ Agora channel\'a katıldı, UID:', localAgoraUid);
        
        // Live mode için client role set et (yayıncı olarak 'host' role'ü)
        // WebRTC uyumluluğu için gerekli
        try {
            await agoraClient.setClientRole('host');
            console.log('✅ Client role set edildi: host (yayıncı)');
        } catch (roleError) {
            console.warn('⚠️ Client role set edilemedi (devam ediliyor):', roleError);
        }
        
        // Kısa bir gecikme ekle (event listener'ların hazır olması için)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Local stream'den track'leri al
        const videoTracks = localStream.getVideoTracks();
        const audioTracks = localStream.getAudioTracks();
        
        // Video track yayınla
        if (videoTracks.length > 0) {
            const videoTrack = videoTracks[0];
            try {
                // Agora SDK 4.x için createCustomVideoTrack kullan
                agoraTracks.videoTrack = await AgoraRTC.createCustomVideoTrack({
                    mediaStreamTrack: videoTrack
                });
                console.log('📤 Video track publish ediliyor...');
                isPublishing = true; // Flag set et
                try {
                    await agoraClient.publish([agoraTracks.videoTrack]);
                    console.log('✅ Video track yayınlandı:', videoTrack.label);
                } finally {
                    isPublishing = false; // Flag reset et (hata olsa bile)
                }
            } catch (videoError) {
                console.error('❌ Video track yayınlama hatası:', videoError);
                // Fallback: direkt mediaStreamTrack kullan
                throw new Error(`Video track yayınlanamadı: ${videoError.message}`);
            }
            } else {
            console.warn('⚠️ Video track bulunamadı');
        }
        
        // Audio track yayınla
        if (audioTracks.length > 0) {
            const audioTrack = audioTracks[0];
            try {
                // Agora SDK 4.x için createCustomAudioTrack kullan
                agoraTracks.audioTrack = await AgoraRTC.createCustomAudioTrack({
                    mediaStreamTrack: audioTrack
                });
                console.log('📤 Audio track publish ediliyor...');
                isPublishing = true; // Flag set et
                try {
                    await agoraClient.publish([agoraTracks.audioTrack]);
                    console.log('✅ Audio track yayınlandı:', audioTrack.label);
                } finally {
                    isPublishing = false; // Flag reset et (hata olsa bile)
                }
            } catch (audioError) {
                console.error('❌ Audio track yayınlama hatası:', audioError);
                // Fallback: direkt mediaStreamTrack kullan
                throw new Error(`Audio track yayınlanamadı: ${audioError.message}`);
            }
        } else {
            console.warn('⚠️ Audio track bulunamadı');
        }
        
        console.log('✅ Agora yayını başarıyla başlatıldı');
        
    } catch (error) {
        console.error('❌ Agora yayın hatası:', error);
        throw error;
    }
}

// AWS IVS kaldırıldı - Artık sadece Agora.io kullanılıyor
// Bu fonksiyon kullanılmıyor, geriye dönük uyumluluk için tutuluyor
async function startAWSIVSStream(channelData) {
    console.warn('⚠️ AWS IVS artık kullanılmıyor. Agora.io kullanılıyor.');
    throw new Error('AWS IVS artık desteklenmiyor. Backend AGORA provider kullanmalı.');
}

// Stop Stream
async function stopStream() {
    if (!isStreaming) {
        return;
    }
    
    console.log('⏹️ Yayın durduruluyor...');
    updateStatus('Yayın durduruluyor...');
    
    try {
        // Agora tracks'leri kapat
        if (agoraTracks.videoTrack) {
            agoraTracks.videoTrack.stop();
            agoraTracks.videoTrack.close();
            agoraTracks.videoTrack = null;
        }
        
        if (agoraTracks.audioTrack) {
            agoraTracks.audioTrack.stop();
            agoraTracks.audioTrack.close();
            agoraTracks.audioTrack = null;
        }
        
        // Agora client'tan ayrıl
        if (agoraClient) {
            await agoraClient.leave();
            agoraClient.removeAllListeners();
            agoraClient = null;
        }
        
        // Local UID'yi sıfırla
        localAgoraUid = null;
        
        // Local stream'i kapat
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
        // Local video'yu temizle
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = null;
            localVideo.style.display = 'none';
        }
        
        isStreaming = false;
        currentChannelId = null;
        updateLiveStatus('HAZIRLANIYOR');
        updateStatus('Yayın durduruldu');
        
        // Butonları güncelle
        const startBtn = document.getElementById('startStreamBtn');
        const stopBtn = document.getElementById('stopStreamBtn');
        const cameraBtn = document.getElementById('cameraAccessBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (stopBtn) stopBtn.style.display = 'none';
        if (cameraBtn) cameraBtn.style.display = 'block';
        
    } catch (error) {
        console.error('❌ Yayın durdurma hatası:', error);
        updateStatus('Yayın durdurma hatası: ' + error.message);
    }
}

// Send Message
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    if (!messageInput || !messageInput.value.trim()) {
        return;
    }
    
    if (!currentChannelId) {
        alert('Önce yayını başlatın!');
        return;
    }
    
    const message = messageInput.value.trim();
    
    try {
        const response = await fetch(`${getAPIBaseURL()}/streams/${currentChannelId}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // CORS için
            body: JSON.stringify({
                message: message,
                userEmail: currentUser.email,
                userName: currentUser.name || currentUser.email
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            addMessageToContainer({
                message: data.message.message,
                sender: data.message.userName,
                timestamp: data.message.timestamp
            });
            messageInput.value = '';
        }
    } catch (error) {
        console.error('Mesaj gönderme hatası:', error);
        // Fallback: Local olarak ekle
        addMessageToContainer({
            message: message,
            sender: currentUser.name || currentUser.email,
            timestamp: new Date().toISOString()
        });
        messageInput.value = '';
    }
}

// Add Message to Container
function addMessageToContainer(messageData) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
        <div class="message-sender">${messageData.sender}</div>
        <div class="message-text">${messageData.message}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Toggle Like
async function toggleLike() {
    if (!currentChannelId) {
        alert('Önce yayını başlatın!');
        return;
    }
    
    try {
        const response = await fetch(`${getAPIBaseURL()}/streams/${currentChannelId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // CORS için
            body: JSON.stringify({
                userEmail: currentUser.email
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            likeCount = data.likeCount || 0;
            isLiked = data.liked || false;
            updateLikeButton();
        }
    } catch (error) {
        console.error('Beğeni hatası:', error);
    }
}

// Load Likes
async function loadLikes() {
    if (!currentChannelId) return;
    
    try {
        const response = await fetch(`${getAPIBaseURL()}/streams/${currentChannelId}/likes`, {
            credentials: 'include' // CORS için
        });
        if (response.ok) {
            const data = await response.json();
            likeCount = data.likeCount || 0;
            updateLikeButton();
        }
    } catch (error) {
        console.error('Beğeni yükleme hatası:', error);
    }
}

// Update Like Button
function updateLikeButton() {
    const likeBtn = document.getElementById('likeBtn');
    const likeCountEl = document.getElementById('likeCount');
    
    if (likeBtn) {
        if (isLiked) {
            likeBtn.innerHTML = '<i class="fas fa-heart"></i> Beğenildi (<span id="likeCount">' + likeCount + '</span>)';
            likeBtn.style.background = '#dc2626';
        } else {
            likeBtn.innerHTML = '<i class="far fa-heart"></i> Beğen (<span id="likeCount">' + likeCount + '</span>)';
            likeBtn.style.background = '#dc2626';
        }
    }
    
    if (likeCountEl) {
        likeCountEl.textContent = likeCount;
    }
}

// Update Status
function updateStatus(message) {
    const statusText = document.getElementById('statusText');
    if (statusText) {
        statusText.textContent = message;
    }
}

// Update Live Status
function updateLiveStatus(status) {
    const liveStatus = document.getElementById('liveStatus');
    if (liveStatus) {
        liveStatus.textContent = status;
    }
}

// Global functions
window.requestCameraAccess = requestCameraAccess;
window.startStream = startStream;
window.stopStream = stopStream;
window.sendMessage = sendMessage;
window.toggleLike = toggleLike;

console.log('✅ Canlı Yayın Sistemi Yüklendi');

