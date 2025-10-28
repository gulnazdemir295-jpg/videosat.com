// Live Stream Configuration
let localStream = null;
let remoteStream = null;
let localPeerConnection = null;
let remotePeerConnection = null;
let isStreaming = false;
let streamStartTime = null;
let timerInterval = null;
let selectedProducts = [];

// Mock products
const products = [
    { id: 1, name: "Tuğla Premium", price: "850 ₺", unit: "paket" },
    { id: 2, name: "Çimento 50kg", price: "450 ₺", unit: "çuval" },
    { id: 3, name: "Kum 1 Ton", price: "650 ₺", unit: "ton" },
    { id: 4, name: "Demir 12mm", price: "5.200 ₺", unit: "ton" }
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    checkWebRTCSupport();
});

// Check WebRTC support
function checkWebRTCSupport() {
    // Check for HTTPS (required for production)
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
    productsList.innerHTML = products.map(product => `
        <div class="product-item" onclick="selectProduct(${product.id})" id="product-${product.id}">
            <div class="product-name">${product.name}</div>
            <div class="product-price">${product.price} / ${product.unit}</div>
        </div>
    `).join('');
}

// Select product
function selectProduct(productId) {
    const product = products.find(p => p.id === productId);
    const productElement = document.getElementById(`product-${productId}`);
    
    if (selectedProducts.includes(productId)) {
        selectedProducts = selectedProducts.filter(id => id !== productId);
        productElement.classList.remove('active');
    } else {
        selectedProducts.push(productId);
        productElement.classList.add('active');
    }
    
    console.log('Selected products:', selectedProducts);
}

// Start stream
async function startStream() {
    if (!checkWebRTCSupport()) return;
    
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
        localVideo.srcObject = localStream;
        document.getElementById('waitingMessage').style.display = 'none';
        
        updateStatus('Yayın başlatıldı! Diğer kullanıcılara görünüyorsunuz.');
        isStreaming = true;
        streamStartTime = Date.now();
        
        // Enable/disable buttons
        document.querySelector('.control-btn.start').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        
        // Start timer
        startTimer();
        
        // Add participant
        addParticipant('Siz', true);
        
        // Start WebRTC connection (simplified)
        startWebRTC();
        
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
    localVideo.srcObject = null;
    
    isStreaming = false;
    updateStatus('Yayın duraklatıldı.');
    
    // Enable/disable buttons
    document.querySelector('.control-btn.start').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    
    // Stop timer
    stopTimer();
}

// End stream
function endStream() {
    if (confirm('Yayını sonlandırmak istediğinize emin misiniz?')) {
        stopStream();
        window.location.href = 'index.html';
    }
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
        
        document.getElementById('timer').textContent = 
            `${displayHours}:${displayMinutes}:${displaySeconds}`;
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
    document.getElementById('statusInfo').innerHTML = 
        `<i class="fas fa-info-circle"></i> ${message}`;
}

// Add participant
function addParticipant(name, isYou = false) {
    const participantsList = document.getElementById('participantsList');
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    participantsList.innerHTML += `
        <li class="participant">
            <div class="participant-avatar">${initials}</div>
            <div>
                <div style="font-weight: bold;">${name}</div>
                <div style="font-size: 12px; color: #666;">
                    ${isYou ? 'Siz (Yayıncı)' : 'Katılımcı'}
                </div>
            </div>
        </li>
    `;
}

// Start WebRTC (simplified simulation)
function startWebRTC() {
    console.log('WebRTC bağlantısı başlatılıyor...');
    
    // Simulate remote connection after a delay
    setTimeout(() => {
        if (isStreaming) {
            addParticipant('Uzak Katılımcı', false);
            updateStatus('Yayın aktif. Başka bir katılımcı bağlandı!');
        }
    }, 2000);
}

// Handle page unload
window.addEventListener('beforeunload', function() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
});
