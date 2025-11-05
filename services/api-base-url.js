/**
 * Merkezi API Base URL Fonksiyonu
 * Tüm servislerde kullanılacak tek bir fonksiyon
 * Merkezi config dosyasını kullanır
 */

// Merkezi config'i yükle (eğer varsa)
let backendConfig = null;
if (typeof window !== 'undefined') {
    // Browser'da config script'i yüklenmeli
    // window.BACKEND_CONFIG veya window.getAPIBaseURL kullanılacak
}

// Global API Base URL fonksiyonu
function getAPIBaseURL() {
    // Önce window.getAPIBaseURL varsa onu kullan (merkezi config'den gelir)
    if (typeof window !== 'undefined' && typeof window.getAPIBaseURL === 'function') {
        return window.getAPIBaseURL();
    }
    
    // Fallback: hostname'e göre belirle
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // Production
        if (hostname === 'basvideo.com' || hostname.includes('basvideo.com')) {
            return 'https://basvideo.com/api';
        }
        
        // Local development - Merkezi default port
        const DEFAULT_BACKEND_PORT = window.DEFAULT_BACKEND_PORT || 3000;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `http://localhost:${DEFAULT_BACKEND_PORT}/api`;
        }
        
        // Fallback: mevcut origin + /api
        return `${protocol}//${hostname}:${DEFAULT_BACKEND_PORT}/api`;
    }
    
    // Node.js environment (backend)
    return process.env.API_BASE_URL || 'http://localhost:3000/api';
}

// Global olarak erişilebilir yap
if (typeof window !== 'undefined') {
    window.getAPIBaseURL = getAPIBaseURL;
}

// Module exports (Node.js için)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getAPIBaseURL };
}

