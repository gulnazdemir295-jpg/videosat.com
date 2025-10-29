// Live Stream Enhanced System
// Handles: invitations, payment, viewer interactions, pre/post stream workflows

let localStream = null;
let remoteStream = null;
let localPeerConnection = null;
let remotePeerConnection = null;
let isStreaming = false;
let isStreamer = false; // Yayıncı mı, izleyici mi?
let streamStartTime = null;
let timerInterval = null;
let selectedProducts = [];
let streamId = null;
let currentUser = null;

// Viewer interactions
let likeCount = 0;
let isLiked = false;
let isFollowing = false;
let viewers = [];
let streamOrders = [];

// Mock products
const products = [
    { id: 1, name: "Tuğla Premium", price: "850 ₺", unit: "paket" },
    { id: 2, name: "Çimento 50kg", price: "450 ₺", unit: "çuval" },
    { id: 3, name: "Kum 1 Ton", price: "650 ₺", unit: "ton" },
    { id: 4, name: "Demir 12mm", price: "5.200 ₺", unit: "ton" }
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Live Stream JS başlatılıyor...');
    
    try {
        loadUserData();
        checkInvitationContext();
        loadProducts();
        loadStreamBalance();
        checkWebRTCSupport();
        setupInvitationSystem();
        checkActiveStream();
        
        // Connect to WebSocket service if available
        if (window.websocketService) {
            window.websocketService.connect();
            setupWebSocketListeners();
        }
        
        // Fallback: Add event listener to skip button if onclick doesn't work
        const skipBtn = document.getElementById('skipPaymentBtn');
        if (skipBtn) {
            skipBtn.addEventListener('click', function(e) {
                e.preventDefault();
                skipPaymentStep();
            });
        }
        
        // Add event listeners for other buttons
        const cameraBtn = document.getElementById('cameraAccessBtn');
        if (cameraBtn) {
            cameraBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('📹 Kamera erişimi butonuna tıklandı (JS)');
                requestCameraAccess();
            });
            // Butonu aktif hale getir
            cameraBtn.disabled = false;
            cameraBtn.style.opacity = '1';
            console.log('✅ Kamera erişimi butonu aktif edildi (JS)');
        }
        
        const startBtn = document.getElementById('startStreamBtn');
        if (startBtn) {
            startBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🎬 Yayın başlat butonuna tıklandı (JS)');
                startStream();
            });
            // Butonu aktif hale getir
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            console.log('✅ Yayın başlat butonu aktif edildi (JS)');
        }
        
        console.log('✅ Live Stream JS başlatıldı');
        
    } catch (error) {
        console.error('❌ Live Stream JS başlatma hatası:', error);
    }
});

// Load User Data
function loadUserData() {
    try {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            currentUser = JSON.parse(userData);
        }
    } catch (e) {
        console.error('Error loading user data:', e);
    }
}

// Check if user came from invitation
function checkInvitationContext() {
    const urlParams = new URLSearchParams(window.location.search);
    const invitationId = urlParams.get('invitation');
    const fromStream = urlParams.get('from');
    
    if (fromStream === 'streamer') {
        isStreamer = true;
        setupStreamerMode();
    } else if (invitationId) {
        isStreamer = false;
        setupViewerMode();
        markInvitationAsJoined(invitationId);
    } else {
        // Check for pending invitations
        checkPendingInvitations();
    }
}

// Check Pending Invitations
function checkPendingInvitations() {
    if (!currentUser) return;
    
    const invitations = JSON.parse(localStorage.getItem('liveStreamInvitations') || '[]');
    const myInvitations = invitations.filter(inv => 
        inv.to === currentUser.email && 
        inv.status === 'pending'
    );
    
    if (myInvitations.length > 0) {
        showInvitationNotification(myInvitations[0]);
    }
}

// Show Invitation Notification
function showInvitationNotification(invitation) {
    if (confirm(`${invitation.fromName} sizi canlı yayına davet ediyor. Katılmak ister misiniz?`)) {
        acceptInvitationFromStream(invitation.id);
    } else {
        declineInvitationFromStream(invitation.id);
    }
}

// Accept Invitation from Stream Page
function acceptInvitationFromStream(invitationId) {
    const invitations = JSON.parse(localStorage.getItem('liveStreamInvitations') || '[]');
    const invitation = invitations.find(i => i.id == invitationId);
    
    if (invitation) {
        invitation.status = 'accepted';
        invitation.acceptedAt = new Date().toISOString();
        localStorage.setItem('liveStreamInvitations', JSON.stringify(invitations));
        
        isStreamer = false;
        setupViewerMode();
        
        // Redirect to stream with invitation ID
        window.location.href = `?invitation=${invitationId}`;
    }
}

// Decline Invitation from Stream Page
function declineInvitationFromStream(invitationId) {
    const invitations = JSON.parse(localStorage.getItem('liveStreamInvitations') || '[]');
    const invitation = invitations.find(i => i.id == invitationId);
    
    if (invitation) {
        invitation.status = 'declined';
        invitation.declinedAt = new Date().toISOString();
        localStorage.setItem('liveStreamInvitations', JSON.stringify(invitations));
        
        showAlert('Davet reddedildi.', 'info');
    }
}

// Mark Invitation as Joined
function markInvitationAsJoined(invitationId) {
    const invitations = JSON.parse(localStorage.getItem('liveStreamInvitations') || '[]');
    const invitation = invitations.find(i => i.id == invitationId);
    
    if (invitation && invitation.status === 'accepted') {
        invitation.joinedAt = new Date().toISOString();
        localStorage.setItem('liveStreamInvitations', JSON.stringify(invitations));
    }
}

// Setup Streamer Mode
function setupStreamerMode() {
    document.getElementById('invitationsCard').style.display = 'block';
    document.getElementById('viewerInteractions').style.display = 'none';
    loadInvitationsForStreamer();
}

// Setup Viewer Mode
function setupViewerMode() {
    document.getElementById('invitationsCard').style.display = 'none';
    document.getElementById('viewerInteractions').style.display = 'block';
    document.getElementById('liveBadge').innerHTML = '<i class="fas fa-circle"></i> <span>İZLEYİCİ</span>';
}

// Load Invitations for Streamer
function loadInvitationsForStreamer() {
    if (!currentUser) return;
    
    const invitations = JSON.parse(localStorage.getItem('liveStreamInvitations') || '[]');
    const myInvitations = invitations.filter(inv => inv.from === currentUser.email);
    
    const panel = document.getElementById('invitationsPanel');
    if (!panel) return;
    
    if (myInvitations.length === 0) {
        panel.innerHTML = '<p style="color: #999; text-align: center;">Henüz davet gönderilmedi.</p>';
        return;
    }
    
    panel.innerHTML = myInvitations.map(inv => `
        <div class="invitation-item">
            <div class="invitation-header">
                <div>
                    <strong>${inv.toName}</strong>
                    <p style="font-size: 12px; color: #999; margin-top: 5px;">
                        ${formatInvitationStatus(inv.status)}
                    </p>
                </div>
            </div>
        </div>
    `).join('');
}

// Format Invitation Status
function formatInvitationStatus(status) {
    const statuses = {
        'pending': '⏳ Beklemede',
        'accepted': '✅ Kabul Edildi',
        'declined': '❌ Reddedildi'
    };
    return statuses[status] || status;
}

// Check Active Stream
function checkActiveStream() {
    const activeStream = localStorage.getItem('activeLivestream');
    if (activeStream) {
        try {
            const stream = JSON.parse(activeStream);
            if (stream.status === 'live') {
                streamId = stream.id;
                showPostStreamSummary(stream);
            }
        } catch (e) {
            console.error('Error loading active stream:', e);
        }
    }
}

// Setup WebSocket event listeners
function setupWebSocketListeners() {
    if (!window.websocketService) return;
    
    window.websocketService.on('connect', () => {
        console.log('✅ WebSocket connected for live stream');
    });
    
    window.websocketService.on('new_viewer', (data) => {
        updateViewerCount(data.count);
        addParticipant(data.viewerName || 'Yeni Katılımcı', false);
    });
    
    window.websocketService.on('message', (data) => {
        console.log('Message received:', data);
    });
    
    window.websocketService.on('product_update', (data) => {
        if (data.productId) {
            updateProductHighlight(data.productId);
        }
    });
    
    window.websocketService.on('like', (data) => {
        likeCount++;
        updateLikeCount();
    });
    
    window.websocketService.on('follow', (data) => {
        console.log('Follow event:', data);
    });
}

// Check WebRTC support
function checkWebRTCSupport() {
    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === 'basvideo.com';
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        updateStatus('❌ WebRTC desteklenmiyor. Chrome, Firefox, Safari veya Edge kullanın.');
        return false;
    }
    
    if (!isSecure) {
        updateStatus('⚠️ HTTPS gereklidir. basvideo.com otomatik olarak HTTPS kullanır.');
        console.warn('HTTPS kontrolü: Protocol =', window.location.protocol, 'Hostname =', window.location.hostname);
    }
    
    updateStatus('✅ WebRTC destekleniyor. Kamera/mikrofon erişimi kontrol ediliyor...');
    console.log('✅ WebRTC destek kontrolü başarılı - Protocol:', window.location.protocol);
    return true;
}

// Load products
function loadProducts() {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;
    
    productsList.innerHTML = products.map(product => `
        <div class="product-item" onclick="selectProduct(${product.id})" id="product-${product.id}">
            <div class="product-name">${product.name}</div>
            <div class="product-price">${product.price} / ${product.unit}</div>
        </div>
    `).join('');
}

// Select product
function selectProduct(productId) {
    if (!isStreamer) {
        openShopping();
        return;
    }
    
    const product = products.find(p => p.id === productId);
    const productElement = document.getElementById(`product-${productId}`);
    
    if (selectedProducts.includes(productId)) {
        selectedProducts = selectedProducts.filter(id => id !== productId);
        productElement.classList.remove('active');
    } else {
        selectedProducts.push(productId);
        productElement.classList.add('active');
    }
    
    // Notify viewers about product selection
    if (window.websocketService && isStreaming) {
        window.websocketService.emit('product_update', {
            productId: productId,
            streamId: streamId
        });
    }
    
    console.log('Selected products:', selectedProducts);
}

// Update Product Highlight
function updateProductHighlight(productId) {
    const productElement = document.getElementById(`product-${productId}`);
    if (productElement) {
        productElement.classList.add('active');
        setTimeout(() => {
            productElement.classList.remove('active');
        }, 2000);
    }
}

// Load Stream Balance
function loadStreamBalance() {
    const balance = parseFloat(localStorage.getItem('livestreamBalance') || '0');
    const hours = Math.floor(balance / 60);
    const minutes = balance % 60;
    
    const balanceDisplay = document.getElementById('balanceDisplay');
    if (balanceDisplay) {
        balanceDisplay.textContent = `Bakiye: ${hours}s ${minutes}dk`;
    }
    
    // If balance is 0, show payment step
    if (balance === 0 && isStreamer) {
        document.getElementById('paymentStep').classList.add('active');
    } else {
        hidePreStreamSetup();
    }
}

// Skip Payment Step (Test için)
function skipPaymentStep() {
    console.log('skipPaymentStep() çağrıldı');
    
    try {
        // Test için bakiye ekle
        localStorage.setItem('livestreamBalance', '120'); // 2 saat
        console.log('Bakiye eklendi: 120 dakika');
        
        // Bakiye yükle
        loadStreamBalance();
        console.log('Bakiye yüklendi');
        
        // Pre-stream setup'ı gizle
        hidePreStreamSetup();
        console.log('Pre-stream setup gizlendi');
        
        // Ana içeriği göster
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.style.display = 'grid';
            console.log('Ana içerik gösterildi');
        }
        
        // Bildirim göster
        if (typeof showAlert === 'function') {
            showAlert('Test modu: 2 saat bakiye eklendi.', 'info');
        } else {
            alert('Test modu: 2 saat bakiye eklendi.');
        }
        
        console.log('skipPaymentStep() başarıyla tamamlandı');
        
    } catch (error) {
        console.error('skipPaymentStep() hatası:', error);
        alert('Hata: ' + error.message);
    }
}

// Hide Pre-Stream Setup
function hidePreStreamSetup() {
    try {
        const preStreamSetup = document.getElementById('preStreamSetup');
        const mainContent = document.getElementById('mainContent');
        
        if (preStreamSetup) {
            preStreamSetup.classList.remove('active');
            console.log('Pre-stream setup gizlendi');
        }
        
        if (mainContent) {
            mainContent.style.display = 'grid';
            console.log('Ana içerik gösterildi');
        }
    } catch (error) {
        console.error('hidePreStreamSetup() hatası:', error);
    }
}

// Show Buy Stream Time Modal
function showBuyStreamTimeModal() {
    // Load payment modal from panel-app.js if available
    if (window.showBuyStreamTimeModal && window.showBuyStreamTimeModal !== showBuyStreamTimeModal) {
        window.showBuyStreamTimeModal();
    } else {
        // showAlert fonksiyonu yüklenmemişse fallback kullan
        if (typeof showAlert === 'function') {
            showAlert('Ödeme sistemi yükleniyor...', 'info');
        } else {
            alert('Ödeme sistemi yükleniyor...');
        }
        // Fallback: redirect to panel
        setTimeout(() => {
            window.location.href = '../panels/hammaddeci.html#live-stream';
        }, 1000);
    }
}

// Start stream
async function startStream() {
    console.log('🎬 Yayın başlatılıyor...');
    
    if (!checkWebRTCSupport()) {
        console.error('❌ WebRTC desteklenmiyor');
        return;
    }
    
    // Check if camera access is already granted
    if (!localStream) {
        console.warn('⚠️ Kamera erişimi yok, önce kamera erişimi iste');
        updateStatus('Önce kamera erişimi isteyin!');
        
        if (typeof showAlert === 'function') {
            showAlert('Lütfen önce "Kamera Erişimi İste" butonuna tıklayın.', 'warning');
        } else {
            alert('Lütfen önce "Kamera Erişimi İste" butonuna tıklayın.');
        }
        return;
    }
    
    // Check balance
    const balance = parseFloat(localStorage.getItem('livestreamBalance') || '0');
    if (balance === 0 && isStreamer) {
        if (!confirm('Yayın bakiyeniz yok. Test için devam etmek ister misiniz?')) {
            console.log('❌ Kullanıcı bakiye olmadığı için yayını iptal etti');
            return;
        }
    }
    
    try {
        console.log('📺 Yayın başlatılıyor...');
        updateStatus('Yayın başlatılıyor...');
        
        // Display local video
        const localVideo = document.getElementById('localVideo');
        const remoteVideo = document.getElementById('remoteVideo');
        const waitingMessage = document.getElementById('waitingMessage');
        
        if (isStreamer) {
            // Streamer: local video sağ alt, remote video ana ekran (başka bir yayından gelirse)
            localVideo.srcObject = localStream;
            localVideo.style.display = 'block';
            console.log('📹 Yayıncı video gösterildi');
        } else {
            // Viewer: local video sağ alt, remote video ana ekran (streamer'dan)
            localVideo.srcObject = localStream;
            localVideo.style.display = 'block';
            console.log('👀 İzleyici video gösterildi');
        }
        
        if (waitingMessage) {
            waitingMessage.style.display = 'none';
        }
        
        // Set remote video background
        if (remoteVideo) {
            remoteVideo.style.background = '#000000';
        }
        
        updateStatus('✅ Yayın başlatıldı! Diğer kullanıcılara görünüyorsunuz.');
        isStreaming = true;
        streamStartTime = Date.now();
        
        // Generate stream ID
        streamId = `STREAM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        console.log('🆔 Stream ID:', streamId);
        
        // Save active stream
        const streamData = {
            id: streamId,
            status: 'live',
            startedAt: new Date().toISOString(),
            isStreamer: isStreamer,
            selectedProducts: selectedProducts
        };
        localStorage.setItem('activeLivestream', JSON.stringify(streamData));
        console.log('💾 Stream verisi kaydedildi');
        
        // Enable/disable buttons
        const startBtn = document.getElementById('startStreamBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.style.opacity = '0.5';
            console.log('⏸️ Başlat butonu devre dışı bırakıldı');
        }
        if (stopBtn) {
            stopBtn.disabled = false;
            stopBtn.style.opacity = '1';
            stopBtn.style.cursor = 'pointer';
            console.log('⏹️ Durdur butonu aktif edildi');
        }
        
        // Update live badge
        const liveBadge = document.getElementById('liveBadge');
        const liveStatus = document.getElementById('liveStatus');
        if (liveBadge) {
            liveBadge.innerHTML = '<i class="fas fa-circle"></i> <span>CANLI</span>';
        }
        if (liveStatus) {
            liveStatus.textContent = 'CANLI';
        }
        console.log('🔴 Canlı durumu güncellendi');
        
        // Start timer
        startTimer();
        console.log('⏰ Timer başlatıldı');
        
        // Add participant
        addParticipant(isStreamer ? 'Siz (Yayıncı)' : 'Siz (Katılımcı)', true);
        console.log('👤 Katılımcı eklendi');
        
        // Start WebRTC connection (simplified)
        startWebRTC();
        console.log('🌐 WebRTC bağlantısı başlatıldı');
        
        // Notify viewers
        if (window.websocketService) {
            window.websocketService.emit('stream_started', {
                streamId: streamId,
                streamer: currentUser?.companyName || 'Yayıncı'
            });
            console.log('📡 WebSocket bildirimi gönderildi');
        }
        
        // Show success message
        if (typeof showAlert === 'function') {
            showAlert('🎉 Yayın başarıyla başlatıldı!', 'success');
        } else {
            alert('🎉 Yayın başarıyla başlatıldı!');
        }
        
        console.log('✅ Yayın başarıyla başlatıldı');
        
    } catch (error) {
        console.error('❌ Yayın başlatma hatası:', error);
        updateStatus('❌ Yayın başlatılamadı: ' + error.message);
        
        if (typeof showAlert === 'function') {
            showAlert('Yayın başlatılamadı: ' + error.message, 'error');
        } else {
            alert('Yayın başlatılamadı: ' + error.message);
        }
    }
}

// Stop stream
function stopStream() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
    const localVideo = document.getElementById('localVideo');
    if (localVideo) {
        localVideo.srcObject = null;
    }
    
    isStreaming = false;
    updateStatus('Yayın duraklatıldı.');
    
    // Enable/disable buttons
    document.querySelector('.control-btn.start').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    
    // Stop timer
    stopTimer();
    
    // Update live badge
    document.getElementById('liveBadge').innerHTML = '<i class="fas fa-circle"></i> <span>DURAKLATILDI</span>';
}

// End stream
async function endStream() {
    if (!confirm('Yayını sonlandırmak istediğinize emin misiniz?')) {
        return;
    }
    
    stopStream();
    
    // Calculate duration
    let duration = 0;
    if (streamStartTime) {
        duration = Math.floor((Date.now() - streamStartTime) / 1000);
    }
    
    // Update balance
    if (isStreamer) {
        const balance = parseFloat(localStorage.getItem('livestreamBalance') || '0');
        const minutesUsed = Math.floor(duration / 60);
        const newBalance = Math.max(0, balance - minutesUsed);
        localStorage.setItem('livestreamBalance', newBalance.toString());
    }
    
    // Save stream data
    const streamData = {
        id: streamId,
        status: 'ended',
        startedAt: streamStartTime ? new Date(streamStartTime).toISOString() : new Date().toISOString(),
        endedAt: new Date().toISOString(),
        duration: duration,
        viewers: viewers.length,
        likes: likeCount,
        orders: streamOrders.length
    };
    
    localStorage.removeItem('activeLivestream');
    
    // Save to history
    const history = JSON.parse(localStorage.getItem('livestreamHistory') || '[]');
    history.push(streamData);
    localStorage.setItem('livestreamHistory', JSON.stringify(history));
    
    // Show post-stream summary
    showPostStreamSummary(streamData);
    
    // Notify viewers
    if (window.websocketService) {
        window.websocketService.emit('stream_ended', { streamId: streamId });
    }
}

// Show Post-Stream Summary
function showPostStreamSummary(streamData) {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('postStreamSummary').classList.add('active');
    
    const hours = Math.floor(streamData.duration / 3600);
    const minutes = Math.floor((streamData.duration % 3600) / 60);
    const seconds = streamData.duration % 60;
    
    document.getElementById('summaryDuration').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('summaryParticipants').textContent = streamData.viewers || 0;
    document.getElementById('summaryLikes').textContent = streamData.likes || 0;
    document.getElementById('summaryOrders').textContent = streamData.orders || 0;
}

// Start New Stream
function startNewStream() {
    document.getElementById('postStreamSummary').classList.remove('active');
    document.getElementById('preStreamSetup').classList.add('active');
    document.getElementById('mainContent').style.display = 'none';
    
    // Reset
    likeCount = 0;
    isLiked = false;
    viewers = [];
    streamOrders = [];
    selectedProducts = [];
    streamId = null;
    
    loadProducts();
    updateLikeCount();
}

// Go to Dashboard
function goToDashboard() {
    window.location.href = '../panels/hammaddeci.html';
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        if (!streamStartTime) return;
        
        const elapsed = Date.now() - streamStartTime;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        const displayHours = String(hours).padStart(2, '0');
        const displayMinutes = String(minutes % 60).padStart(2, '0');
        const displaySeconds = String(seconds % 60).padStart(2, '0');
        
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = `${displayHours}:${displayMinutes}:${displaySeconds}`;
        }
        
        // Update balance display
        if (isStreamer) {
            const balance = parseFloat(localStorage.getItem('livestreamBalance') || '0');
            const minutesUsed = Math.floor(seconds / 60);
            const remaining = Math.max(0, balance - minutesUsed);
            const hoursRem = Math.floor(remaining / 60);
            const minsRem = remaining % 60;
            
            const balanceDisplay = document.getElementById('balanceDisplay');
            if (balanceDisplay) {
                balanceDisplay.textContent = `Bakiye: ${hoursRem}s ${minsRem}dk`;
            }
            
            // Auto-stop if balance is 0
            if (remaining === 0 && balance > 0) {
                showAlert('Bakiye bitti. Yayın sonlandırılıyor...', 'warning');
                setTimeout(() => endStream(), 2000);
            }
        }
    }, 1000);
}

// Stop timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Update status
function updateStatus(message) {
    const statusInfo = document.getElementById('statusInfo');
    if (statusInfo) {
        statusInfo.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    }
}

// Add participant
function addParticipant(name, isYou = false) {
    const participantsList = document.getElementById('participantsList');
    if (!participantsList) return;
    
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    participantsList.innerHTML += `
        <li class="participant">
            <div class="participant-avatar">${initials}</div>
            <div>
                <div style="font-weight: bold; color: #ffffff;">${name}</div>
                <div style="font-size: 12px; color: #999;">
                    ${isYou ? 'Siz' : 'Katılımcı'}
                </div>
            </div>
        </li>
    `;
    
    if (!isYou) {
        viewers.push(name);
    }
}

// Start WebRTC (simplified simulation)
function startWebRTC() {
    console.log('WebRTC bağlantısı başlatılıyor...');
    
    // Simulate remote connection after a delay
    setTimeout(() => {
        if (isStreaming) {
            if (!isStreamer) {
                // Viewer joined
                updateStatus('Yayına katıldınız! Yayıncı görüntüsü yükleniyor...');
            } else {
                // Streamer waiting for viewers
                updateStatus('Yayın aktif. Katılımcılar bekleniyor...');
            }
        }
    }, 2000);
}

// Toggle Like
function toggleLike() {
    isLiked = !isLiked;
    
    if (isLiked) {
        likeCount++;
    } else {
        likeCount = Math.max(0, likeCount - 1);
    }
    
    updateLikeCount();
    
    // Notify streamer
    if (window.websocketService && streamId) {
        window.websocketService.emit('like', {
            streamId: streamId,
            liked: isLiked,
            count: likeCount
        });
    }
}

// Update Like Count
function updateLikeCount() {
    const likeBtn = document.getElementById('likeBtn');
    const likeCountEl = document.getElementById('likeCount');
    
    if (likeBtn && likeCountEl) {
        if (isLiked) {
            likeBtn.innerHTML = '<i class="fas fa-heart"></i> Beğenildi (<span id="likeCount">' + likeCount + '</span>)';
            likeBtn.classList.add('active');
        } else {
            likeBtn.innerHTML = '<i class="far fa-heart"></i> Beğen (<span id="likeCount">' + likeCount + '</span>)';
            likeBtn.classList.remove('active');
        }
    }
}

// Toggle Follow
function toggleFollow() {
    isFollowing = !isFollowing;
    
    const followBtn = document.getElementById('followBtn');
    if (followBtn) {
        if (isFollowing) {
            followBtn.innerHTML = '<i class="fas fa-star"></i> Takip Ediliyor';
            followBtn.classList.add('active');
            showAlert('Yayıncıyı takip etmeye başladınız!', 'success');
        } else {
            followBtn.innerHTML = '<i class="far fa-star"></i> Takip Et';
            followBtn.classList.remove('active');
        }
    }
    
    // Notify streamer
    if (window.websocketService && streamId) {
        window.websocketService.emit('follow', {
            streamId: streamId,
            following: isFollowing
        });
    }
}

// Open Shopping
function openShopping() {
    if (selectedProducts.length === 0) {
        showAlert('Henüz ürün seçilmedi.', 'info');
        return;
    }
    
    // Create order
    const order = {
        id: Date.now(),
        streamId: streamId,
        products: selectedProducts.map(id => {
            const product = products.find(p => p.id === id);
            return product ? { ...product, quantity: 1 } : null;
        }).filter(p => p !== null),
        createdAt: new Date().toISOString(),
        status: 'pending'
    };
    
    streamOrders.push(order);
    
    if (window.orderService && window.orderService.createOrder) {
        window.orderService.createOrder(order);
    }
    
    showAlert('Alışveriş sepeti açıldı!', 'success');
    
    // Redirect to order page or show modal
    console.log('Shopping order:', order);
}

// Leave Stream
function leaveStream() {
    if (!confirm('Yayından ayrılmak istediğinize emin misiniz?')) {
        return;
    }
    
    // Stop local stream
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
    // Remove from viewers
    if (window.websocketService && streamId) {
        window.websocketService.emit('viewer_left', {
            streamId: streamId
        });
    }
    
    // Redirect
    if (isStreamer) {
        goToDashboard();
    } else {
        window.location.href = '../index.html';
    }
}

// Rejoin Stream
function rejoinStream() {
    if (streamId) {
        window.location.href = `live-stream.html?stream=${streamId}`;
    } else {
        showAlert('Aktif yayın bulunamadı.', 'error');
    }
}

// Update Viewer Count
function updateViewerCount(count) {
    // Update viewer count display if needed
    console.log('Viewer count:', count);
}

// Setup Invitation System
function setupInvitationSystem() {
    // Check for new invitations periodically (every 5 seconds)
    setInterval(() => {
        if (!isStreaming && !isStreamer) {
            checkPendingInvitations();
        }
    }, 5000);
}

// Handle page unload
window.addEventListener('beforeunload', function() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    
    // Notify server about leaving
    if (window.websocketService && streamId && !isStreamer) {
        window.websocketService.emit('viewer_left', { streamId: streamId });
    }
});

// Request Camera Access
async function requestCameraAccess() {
    console.log('📹 Kamera erişimi isteniyor...');
    
    try {
        updateStatus('Kamera ve mikrofon erişimi isteniyor...');
        
        // Check if getUserMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('WebRTC desteklenmiyor. Lütfen modern bir tarayıcı kullanın.');
        }
        
        // Request camera and microphone access
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
        
        // Display local video
        const localVideo = document.getElementById('localVideo');
        const remoteVideo = document.getElementById('remoteVideo');
        const waitingMessage = document.getElementById('waitingMessage');
        
        if (localVideo) {
            localVideo.srcObject = localStream;
            localVideo.style.display = 'block';
            console.log('📺 Yerel video gösterildi');
        }
        
        if (waitingMessage) {
            waitingMessage.style.display = 'none';
        }
        
        // Set remote video background
        if (remoteVideo) {
            remoteVideo.style.background = '#000000';
        }
        
        updateStatus('✅ Kamera ve mikrofon erişimi başarılı! Yayını başlatabilirsiniz.');
        
        // Enable start button
        const startBtn = document.getElementById('startStreamBtn');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            startBtn.style.cursor = 'pointer';
            console.log('▶️ Yayın başlat butonu aktif edildi');
        }
        
        // Show success message
        if (typeof showAlert === 'function') {
            showAlert('Kamera erişimi başarılı! Artık yayını başlatabilirsiniz.', 'success');
        } else {
            alert('Kamera erişimi başarılı! Artık yayını başlatabilirsiniz.');
        }
        
    } catch (error) {
        console.error('❌ Kamera erişim hatası:', error);
        
        let errorMessage = 'Kamera veya mikrofon erişimi reddedildi.';
        
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Kamera erişimi reddedildi. Lütfen tarayıcı ayarlarından izin verin.';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'Kamera cihazı bulunamadı. Lütfen kamera bağlantısını kontrol edin.';
        } else if (error.name === 'NotReadableError') {
            errorMessage = 'Kamera başka uygulama tarafından kullanılıyor. Lütfen diğer uygulamaları kapatın.';
        } else if (error.name === 'OverconstrainedError') {
            errorMessage = 'Kamera ayarları desteklenmiyor. Lütfen farklı bir kamera deneyin.';
        }
        
        updateStatus('❌ ' + errorMessage);
        
        if (typeof showAlert === 'function') {
            showAlert(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
    }
}

// Open Product Selector Modal
function openProductSelector() {
    // Create modal for product selection
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    modal.innerHTML = `
        <div style="background: #1a1a1a; padding: 30px; border-radius: 15px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; border: 1px solid #dc2626;">
            <h3 style="color: #dc2626; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-box"></i> Ürün Seç
            </h3>
            <div id="productSelectorList" style="margin-bottom: 20px;">
                <!-- Products will be loaded here -->
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="closeProductSelector()" class="control-btn end" style="padding: 10px 20px;">
                    <i class="fas fa-times"></i> İptal
                </button>
                <button onclick="confirmProductSelection()" class="control-btn start" style="padding: 10px 20px;">
                    <i class="fas fa-check"></i> Seçimi Onayla
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load products from all panels
    loadProductsForSelector();
}

// Load Products for Selector
function loadProductsForSelector() {
    const productSelectorList = document.getElementById('productSelectorList');
    if (!productSelectorList) return;
    
    // Get products from all panels
    const allProducts = [
        // Hammaddeci products
        { id: 'h-1', name: 'Tuğla Premium', price: '850 ₺', unit: 'paket', panel: 'hammaddeci' },
        { id: 'h-2', name: 'Çimento 50kg', price: '450 ₺', unit: 'çuval', panel: 'hammaddeci' },
        { id: 'h-3', name: 'Kum 1 Ton', price: '650 ₺', unit: 'ton', panel: 'hammaddeci' },
        { id: 'h-4', name: 'Demir 12mm', price: '5.200 ₺', unit: 'ton', panel: 'hammaddeci' },
        
        // Üretici products
        { id: 'u-1', name: 'Hazır Beton C25', price: '1.200 ₺', unit: 'm³', panel: 'uretici' },
        { id: 'u-2', name: 'Prefabrik Panel', price: '850 ₺', unit: 'm²', panel: 'uretici' },
        { id: 'u-3', name: 'Çatı Kiremiti', price: '45 ₺', unit: 'adet', panel: 'uretici' },
        
        // Toptancı products
        { id: 't-1', name: 'İnşaat Malzemesi Paketi', price: '15.000 ₺', unit: 'set', panel: 'toptanci' },
        { id: 't-2', name: 'Elektrik Malzemeleri', price: '3.500 ₺', unit: 'set', panel: 'toptanci' },
        
        // Satıcı products
        { id: 's-1', name: 'Ev Dekorasyon Seti', price: '2.500 ₺', unit: 'set', panel: 'satici' },
        { id: 's-2', name: 'Bahçe Mobilyası', price: '1.800 ₺', unit: 'set', panel: 'satici' }
    ];
    
    productSelectorList.innerHTML = allProducts.map(product => `
        <div class="product-item" onclick="toggleProductSelection('${product.id}')" id="selector-product-${product.id}" style="margin-bottom: 10px;">
            <div class="product-name">${product.name}</div>
            <div class="product-price">${product.price} / ${product.unit}</div>
            <div style="font-size: 12px; color: #999;">Panel: ${product.panel}</div>
        </div>
    `).join('');
}

// Toggle Product Selection in Selector
function toggleProductSelection(productId) {
    const productElement = document.getElementById(`selector-product-${productId}`);
    if (productElement) {
        productElement.classList.toggle('active');
    }
}

// Confirm Product Selection
function confirmProductSelection() {
    const selectedProducts = document.querySelectorAll('#productSelectorList .product-item.active');
    const productIds = Array.from(selectedProducts).map(el => el.id.replace('selector-product-', ''));
    
    // Add selected products to stream
    productIds.forEach(id => {
        if (!selectedProducts.includes(id)) {
            selectedProducts.push(id);
        }
    });
    
    // Update products list
    updateProductsList();
    
    // Close modal
    closeProductSelector();
    
    showAlert(`${productIds.length} ürün yayına eklendi!`, 'success');
}

// Close Product Selector
function closeProductSelector() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Update Products List
function updateProductsList() {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;
    
    const allProducts = [
        { id: 'h-1', name: 'Tuğla Premium', price: '850 ₺', unit: 'paket' },
        { id: 'h-2', name: 'Çimento 50kg', price: '450 ₺', unit: 'çuval' },
        { id: 'h-3', name: 'Kum 1 Ton', price: '650 ₺', unit: 'ton' },
        { id: 'h-4', name: 'Demir 12mm', price: '5.200 ₺', unit: 'ton' },
        { id: 'u-1', name: 'Hazır Beton C25', price: '1.200 ₺', unit: 'm³' },
        { id: 'u-2', name: 'Prefabrik Panel', price: '850 ₺', unit: 'm²' },
        { id: 'u-3', name: 'Çatı Kiremiti', price: '45 ₺', unit: 'adet' },
        { id: 't-1', name: 'İnşaat Malzemesi Paketi', price: '15.000 ₺', unit: 'set' },
        { id: 't-2', name: 'Elektrik Malzemeleri', price: '3.500 ₺', unit: 'set' },
        { id: 's-1', name: 'Ev Dekorasyon Seti', price: '2.500 ₺', unit: 'set' },
        { id: 's-2', name: 'Bahçe Mobilyası', price: '1.800 ₺', unit: 'set' }
    ];
    
    const selectedProductsData = allProducts.filter(p => selectedProducts.includes(p.id));
    
    productsList.innerHTML = selectedProductsData.map(product => `
        <div class="product-item" onclick="openProductPage('${product.id}')" id="product-${product.id}">
            <div class="product-name">${product.name}</div>
            <div class="product-price">${product.price} / ${product.unit}</div>
            <div style="font-size: 12px; color: #dc2626; margin-top: 5px;">
                <i class="fas fa-external-link-alt"></i> Satın almak için tıklayın
            </div>
        </div>
    `).join('');
}

// Open Product Page
function openProductPage(productId) {
    // Redirect to product purchase page
    const productPages = {
        'h-1': '../panels/hammaddeci.html#products',
        'h-2': '../panels/hammaddeci.html#products',
        'h-3': '../panels/hammaddeci.html#products',
        'h-4': '../panels/hammaddeci.html#products',
        'u-1': '../panels/uretici.html#products',
        'u-2': '../panels/uretici.html#products',
        'u-3': '../panels/uretici.html#products',
        't-1': '../panels/toptanci.html#products',
        't-2': '../panels/toptanci.html#products',
        's-1': '../panels/satici.html#products',
        's-2': '../panels/satici.html#products'
    };
    
    const page = productPages[productId];
    if (page) {
        window.open(page, '_blank');
    } else {
        showAlert('Ürün sayfası bulunamadı.', 'error');
    }
}

// Open Invite Modal
function openInviteModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    modal.innerHTML = `
        <div style="background: #1a1a1a; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%; border: 1px solid #dc2626;">
            <h3 style="color: #dc2626; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-user-plus"></i> Yayına Davet Et
            </h3>
            <div style="margin-bottom: 20px;">
                <label style="color: white; display: block; margin-bottom: 5px;">E-posta Adresi:</label>
                <input type="email" id="inviteEmail" placeholder="davet@example.com" style="width: 100%; padding: 10px; border: 1px solid #404040; border-radius: 5px; background: #0a0a0a; color: white; margin-bottom: 10px;">
                <label style="color: white; display: block; margin-bottom: 5px;">İsim (Opsiyonel):</label>
                <input type="text" id="inviteName" placeholder="Davet edilen kişi" style="width: 100%; padding: 10px; border: 1px solid #404040; border-radius: 5px; background: #0a0a0a; color: white;">
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="closeInviteModal()" class="control-btn end" style="padding: 10px 20px;">
                    <i class="fas fa-times"></i> İptal
                </button>
                <button onclick="sendInvitation()" class="control-btn start" style="padding: 10px 20px;">
                    <i class="fas fa-paper-plane"></i> Davet Gönder
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close Invite Modal
function closeInviteModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Send Invitation
function sendInvitation() {
    const email = document.getElementById('inviteEmail').value.trim();
    const name = document.getElementById('inviteName').value.trim() || email.split('@')[0];
    
    if (!email) {
        showAlert('Lütfen e-posta adresi girin.', 'error');
        return;
    }
    
    // Create invitation
    const invitation = {
        id: Date.now(),
        from: currentUser?.email || 'yayinci@videosat.com',
        fromName: currentUser?.companyName || 'Yayıncı',
        to: email,
        toName: name,
        streamId: streamId || 'STREAM-' + Date.now(),
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Save invitation
    const invitations = JSON.parse(localStorage.getItem('liveStreamInvitations') || '[]');
    invitations.push(invitation);
    localStorage.setItem('liveStreamInvitations', JSON.stringify(invitations));
    
    // Close modal
    closeInviteModal();
    
    showAlert(`${name} (${email}) yayına davet edildi!`, 'success');
    
    // Update invitations list
    loadInvitationsForStreamer();
}

// Send Message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    const messageData = {
        id: Date.now(),
        sender: currentUser?.companyName || 'Anonim',
        message: message,
        timestamp: new Date().toISOString()
    };
    
    // Add message to container
    addMessageToContainer(messageData);
    
    // Clear input
    messageInput.value = '';
    
    // Notify other participants
    if (window.websocketService && streamId) {
        window.websocketService.emit('message', {
            streamId: streamId,
            message: messageData
        });
    }
}

// Add Message to Container
function addMessageToContainer(messageData) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
        padding: 8px 12px;
        margin-bottom: 8px;
        background: #0a0a0a;
        border-radius: 8px;
        border-left: 3px solid #dc2626;
    `;
    
    messageElement.innerHTML = `
        <div style="font-weight: bold; color: #dc2626; font-size: 12px;">${messageData.sender}</div>
        <div style="color: white; margin-top: 4px;">${messageData.message}</div>
        <div style="color: #999; font-size: 10px; margin-top: 4px;">${new Date(messageData.timestamp).toLocaleTimeString()}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle Message Key Press (Enter to send)
function handleMessageKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Export functions globally
window.toggleLike = toggleLike;
window.toggleFollow = toggleFollow;
window.openShopping = openShopping;
window.skipPaymentStep = skipPaymentStep;
window.showBuyStreamTimeModal = showBuyStreamTimeModal;
window.startNewStream = startNewStream;
window.goToDashboard = goToDashboard;
window.selectProduct = selectProduct;
window.startStream = startStream;
window.stopStream = stopStream;
window.endStream = endStream;
window.requestCameraAccess = requestCameraAccess;
window.openProductSelector = openProductSelector;
window.toggleProductSelection = toggleProductSelection;
window.confirmProductSelection = confirmProductSelection;
window.closeProductSelector = closeProductSelector;
window.openProductPage = openProductPage;
window.openInviteModal = openInviteModal;
window.closeInviteModal = closeInviteModal;
window.sendInvitation = sendInvitation;
window.sendMessage = sendMessage;
window.handleMessageKeyPress = handleMessageKeyPress;

console.log('✅ Enhanced Live Stream System Loaded v2');
