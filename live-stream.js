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

// API Base URL
function getAPIBaseURL() {
    const hostname = window.location.hostname;
    if (hostname === 'basvideo.com' || hostname.includes('basvideo.com')) {
        return 'https://basvideo.com/api';
    }
    return 'http://localhost:3000/api';
}

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎬 Canlı Yayın Sistemi Başlatılıyor...');
    
    // Kullanıcı bilgisini yükle
    loadUserData();
    
    // Backend bağlantısını test et
    await testBackendConnection();
    
    // Pre-stream setup'ı gizle
    const preStreamSetup = document.getElementById('preStreamSetup');
    if (preStreamSetup) {
        preStreamSetup.style.display = 'none';
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
        updateStatus('Kamera ve mikrofon erişimi isteniyor...');
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('WebRTC desteklenmiyor. Modern bir tarayıcı kullanın.');
        }
        
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
        
        // Local video'yu göster
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = localStream;
            localVideo.style.display = 'block';
        }
        
        updateStatus('Kamera erişimi başarılı! Yayını başlatabilirsiniz.');
        
        // Kamera butonunu gizle, yayın butonunu göster
        const cameraBtn = document.getElementById('cameraAccessBtn');
        const startBtn = document.getElementById('startStreamBtn');
        if (cameraBtn) cameraBtn.style.display = 'none';
        if (startBtn) startBtn.style.display = 'block';
        
    } catch (error) {
        console.error('❌ Kamera erişimi hatası:', error);
        updateStatus('Kamera erişimi hatası: ' + error.message);
        alert('Kamera erişimi için izin verin: ' + error.message);
    }
}

// Start Stream
async function startStream() {
    if (!localStream) {
        alert('Önce kamera erişimi isteyin!');
        return;
    }
    
    if (isStreaming) {
        console.warn('Yayın zaten aktif');
        return;
    }
    
    console.log('🎬 Yayın başlatılıyor...');
    updateStatus('Yayın başlatılıyor...');
    
    try {
        // Backend'den channel bilgisi al
        const roomId = 'main-room';
        const response = await fetch(`${getAPIBaseURL()}/rooms/${roomId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                streamerEmail: currentUser.email,
                streamerName: currentUser.name || currentUser.email,
                deviceInfo: navigator.userAgent
            })
        });
        
        if (!response.ok) {
            throw new Error('Backend yanıt vermedi');
        }
        
        const data = await response.json();
        
        if (!data.ok) {
            throw new Error(data.error || 'Channel oluşturulamadı');
        }
        
        currentChannelId = data.channelId;
        console.log('✅ Channel oluşturuldu:', currentChannelId);
        
        // Agora veya AWS IVS'ye göre yayın başlat
        if (data.provider === 'AGORA') {
            await startAgoraStream(data);
        } else {
            await startAWSIVSStream(data);
        }
        
        isStreaming = true;
        updateLiveStatus('CANLI');
        updateStatus('Yayın aktif!');
        
        // Butonları güncelle
        const startBtn = document.getElementById('startStreamBtn');
        const stopBtn = document.getElementById('stopStreamBtn');
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'block';
        
        // Beğeni sayısını yükle
        await loadLikes();
        
    } catch (error) {
        console.error('❌ Yayın başlatma hatası:', error);
        updateStatus('Yayın başlatma hatası: ' + error.message);
        alert('Yayın başlatılamadı: ' + error.message);
    }
}

// Start Agora Stream
async function startAgoraStream(channelData) {
    console.log('📡 Agora yayını başlatılıyor...');
    
    try {
        if (!AgoraRTC) {
            throw new Error('Agora SDK yüklenmedi');
        }
        
        // Agora Client oluştur
        agoraClient = AgoraRTC.createClient({ 
            mode: 'live', 
            codec: 'vp8' 
        });
        
        // Channel'a katıl
        await agoraClient.join(
            channelData.appId,
            channelData.channelName,
            channelData.publisherToken || null
        );
        
        console.log('✅ Agora channel\'a katıldı');
        
        // Local stream'den track'leri al
        const videoTrack = localStream.getVideoTracks()[0];
        const audioTrack = localStream.getAudioTracks()[0];
        
        // Video track yayınla
        if (videoTrack) {
            agoraTracks.videoTrack = AgoraRTC.createCustomVideoTrack({
                mediaStreamTrack: videoTrack
            });
            await agoraClient.publish([agoraTracks.videoTrack]);
            console.log('✅ Video track yayınlandı');
        }
        
        // Audio track yayınla
        if (audioTrack) {
            agoraTracks.audioTrack = AgoraRTC.createCustomAudioTrack({
                mediaStreamTrack: audioTrack
            });
            await agoraClient.publish([agoraTracks.audioTrack]);
            console.log('✅ Audio track yayınlandı');
        }
        
        console.log('✅ Agora yayını başarıyla başlatıldı');
        
    } catch (error) {
        console.error('❌ Agora yayın hatası:', error);
        throw error;
    }
}

// Start AWS IVS Stream (fallback)
async function startAWSIVSStream(channelData) {
    console.log('📡 AWS IVS yayını başlatılıyor...');
    updateStatus('AWS IVS yayını için OBS veya benzeri yazılım kullanın. Stream Key konsolda görünecek.');
    
    // AWS IVS için stream key'i göster (güvenlik için sadece konsolda)
    console.log('🔑 AWS IVS Stream Key:', channelData.streamKey);
    console.log('🔗 AWS IVS Ingest URL:', channelData.ingest);
    console.log('📺 AWS IVS Playback URL:', channelData.playbackUrl);
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
            agoraClient = null;
        }
        
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
        const response = await fetch(`${getAPIBaseURL()}/streams/${currentChannelId}/likes`);
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

