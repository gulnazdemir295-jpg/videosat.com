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
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        updateStatus('❌ WebRTC desteklenmiyor. Chrome, Firefox, Safari veya Edge kullanın.');
        return false;
    }
    
    if (!isSecure && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        updateStatus('⚠️ HTTPS gereklidir. Localhost dışında çalışmak için HTTPS kullanın.');
    }
    
    updateStatus('✅ WebRTC destekleniyor. Kamera/mikrofon erişimi kontrol ediliyor...');
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
    // Test için bakiye ekle
    localStorage.setItem('livestreamBalance', '120'); // 2 saat
    loadStreamBalance();
    hidePreStreamSetup();
    showAlert('Test modu: 2 saat bakiye eklendi.', 'info');
}

// Hide Pre-Stream Setup
function hidePreStreamSetup() {
    document.getElementById('preStreamSetup').classList.remove('active');
    document.getElementById('mainContent').style.display = 'grid';
}

// Show Buy Stream Time Modal
function showBuyStreamTimeModal() {
    // Load payment modal from panel-app.js if available
    if (window.showBuyStreamTimeModal) {
        window.showBuyStreamTimeModal();
    } else {
        showAlert('Ödeme sistemi yükleniyor...', 'info');
        // Fallback: redirect to panel
        setTimeout(() => {
            window.location.href = '../panels/hammaddeci.html#live-stream';
        }, 1000);
    }
}

// Start stream
async function startStream() {
    if (!checkWebRTCSupport()) return;
    
    // Check balance
    const balance = parseFloat(localStorage.getItem('livestreamBalance') || '0');
    if (balance === 0 && isStreamer) {
        if (!confirm('Yayın bakiyeniz yok. Test için devam etmek ister misiniz?')) {
            return;
        }
    }
    
    try {
        updateStatus('Kamera ve mikrofon erişim izinleri isteniyor...');
        
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
        
        // Display local video
        const localVideo = document.getElementById('localVideo');
        const remoteVideo = document.getElementById('remoteVideo');
        const waitingMessage = document.getElementById('waitingMessage');
        
        if (isStreamer) {
            // Streamer: local video sağ alt, remote video ana ekran (başka bir yayından gelirse)
            localVideo.srcObject = localStream;
            localVideo.style.display = 'block';
        } else {
            // Viewer: local video sağ alt, remote video ana ekran (streamer'dan)
            localVideo.srcObject = localStream;
            localVideo.style.display = 'block';
        }
        
        if (waitingMessage) {
            waitingMessage.style.display = 'none';
        }
        
        // Set remote video background
        remoteVideo.style.background = '#000000';
        
        updateStatus('Yayın başlatıldı! Diğer kullanıcılara görünüyorsunuz.');
        isStreaming = true;
        streamStartTime = Date.now();
        
        // Generate stream ID
        streamId = `STREAM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Save active stream
        const streamData = {
            id: streamId,
            status: 'live',
            startedAt: new Date().toISOString(),
            isStreamer: isStreamer,
            selectedProducts: selectedProducts
        };
        localStorage.setItem('activeLivestream', JSON.stringify(streamData));
        
        // Enable/disable buttons
        document.querySelector('.control-btn.start').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        
        // Update live badge
        document.getElementById('liveBadge').innerHTML = '<i class="fas fa-circle"></i> <span>CANLI</span>';
        document.getElementById('liveStatus').textContent = 'CANLI';
        
        // Start timer
        startTimer();
        
        // Add participant
        addParticipant(isStreamer ? 'Siz (Yayıncı)' : 'Siz (Katılımcı)', true);
        
        // Start WebRTC connection (simplified)
        startWebRTC();
        
        // Notify viewers
        if (window.websocketService) {
            window.websocketService.emit('stream_started', {
                streamId: streamId,
                streamer: currentUser?.companyName || 'Yayıncı'
            });
        }
        
    } catch (error) {
        console.error('Error accessing media devices:', error);
        updateStatus('Kamera veya mikrofon erişimi reddedildi. Lütfen tarayıcı ayarlarından izin verin.');
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

// Export functions globally
window.toggleLike = toggleLike;
window.toggleFollow = toggleFollow;
window.openShopping = openShopping;
window.skipPaymentStep = skipPaymentStep;
window.showBuyStreamTimeModal = showBuyStreamTimeModal;
window.startNewStream = startNewStream;
window.goToDashboard = goToDashboard;
window.selectProduct = selectProduct;

console.log('✅ Enhanced Live Stream System Loaded');
