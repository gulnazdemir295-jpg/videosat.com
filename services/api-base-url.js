/**
 * Merkezi API Base URL Fonksiyonu
 * Tüm servislerde kullanılacak tek bir fonksiyon
 */

// Global API Base URL fonksiyonu
function getAPIBaseURL() {
    // Önce window.getAPIBaseURL varsa onu kullan
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
        
        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }
        
        // Fallback: mevcut origin + /api
        return `${protocol}//${hostname}/api`;
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

