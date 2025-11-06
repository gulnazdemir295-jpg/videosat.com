// Authentication Service - JWT Token Management with Backend Integration
class AuthService {
    constructor() {
        this.tokenKey = 'videosat_token';
        this.refreshKey = 'videosat_refresh_token';
        this.userKey = 'videosat_user'; // User bilgileri için ayrı key
        this.apiBaseUrl = this.getApiBaseUrl();
    }

    // API base URL'i belirle
    getApiBaseUrl() {
        // Production
        if (window.location.hostname === 'basvideo.com' || window.location.hostname === 'www.basvideo.com') {
            return 'https://api.basvideo.com/api';
        }
        // Development
        return 'http://localhost:3000/api';
    }

    // Backend'e login isteği gönder
    async login(email, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Giriş başarısız');
            }

            if (data.success && data.data) {
                // Token'ları sakla
                this.setTokens(data.data.accessToken, data.data.refreshToken);
                // Kullanıcı bilgilerini sakla
                this.setUser(data.data.user);
                return { success: true, user: data.data.user };
            }

            throw new Error('Beklenmeyen yanıt formatı');
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message || 'Giriş başarısız' };
        }
    }

    // Backend'e register isteği gönder
    async register(userData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Kayıt başarısız');
            }

            if (data.success && data.data) {
                // Token'ları sakla
                this.setTokens(data.data.accessToken, data.data.refreshToken);
                // Kullanıcı bilgilerini sakla
                this.setUser(data.data.user);
                return { success: true, user: data.data.user };
            }

            throw new Error('Beklenmeyen yanıt formatı');
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: error.message || 'Kayıt başarısız' };
        }
    }

    // Token'ı yenile
    async refreshAccessToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            return { success: false, message: 'Refresh token bulunamadı' };
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            const data = await response.json();

            if (!response.ok) {
                // Refresh token geçersiz, çıkış yap
                this.clearTokens();
                return { success: false, message: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.' };
            }

            if (data.success && data.data) {
                this.setTokens(data.data.accessToken, data.data.refreshToken);
                return { success: true };
            }

            throw new Error('Beklenmeyen yanıt formatı');
        } catch (error) {
            console.error('Refresh token error:', error);
            this.clearTokens();
            return { success: false, message: 'Token yenileme başarısız' };
        }
    }

    // Token'ı doğrula ve kullanıcı bilgilerini getir
    async verifyToken() {
        const token = this.getAccessToken();
        if (!token) {
            return { success: false, authenticated: false };
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                // Token geçersiz, refresh dene
                if (response.status === 401) {
                    const refreshResult = await this.refreshAccessToken();
                    if (refreshResult.success) {
                        // Yeniden dene
                        return this.verifyToken();
                    }
                }
                this.clearTokens();
                return { success: false, authenticated: false };
            }

            if (data.success && data.data) {
                this.setUser(data.data.user);
                return { success: true, authenticated: true, user: data.data.user };
            }

            return { success: false, authenticated: false };
        } catch (error) {
            console.error('Verify token error:', error);
            return { success: false, authenticated: false };
        }
    }

    // Çıkış yap
    async logout() {
        const token = this.getAccessToken();
        if (token) {
            try {
                await fetch(`${this.apiBaseUrl}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        this.clearTokens();
    }

    // Store tokens
    setTokens(accessToken, refreshToken) {
        localStorage.setItem(this.tokenKey, accessToken);
        localStorage.setItem(this.refreshKey, refreshToken);
    }

    // Get access token
    getAccessToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Get refresh token
    getRefreshToken() {
        return localStorage.getItem(this.refreshKey);
    }

    // Store user data
    setUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    // Get user data
    getUser() {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    // Clear tokens and user data
    clearTokens() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshKey);
        localStorage.removeItem(this.userKey);
        // Eski sistem için de temizle
        localStorage.removeItem('currentUser');
    }

    // Check if authenticated
    async isAuthenticated() {
        const token = this.getAccessToken();
        if (!token) {
            return false;
        }

        // Token'ı doğrula
        const verifyResult = await this.verifyToken();
        return verifyResult.authenticated || false;
    }

    // Get current user (synchronous - cached)
    getCurrentUser() {
        return this.getUser();
    }

    // API istekleri için Authorization header ekle
    getAuthHeaders() {
        const token = this.getAccessToken();
        if (!token) {
            return {};
        }
        return {
            'Authorization': `Bearer ${token}`
        };
    }

    // Fetch wrapper - otomatik token ekler ve refresh yapar
    async authenticatedFetch(url, options = {}) {
        let token = this.getAccessToken();
        
        // İlk deneme
        let response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            }
        });

        // 401 hatası alırsak token'ı yenile ve tekrar dene
        if (response.status === 401) {
            const refreshResult = await this.refreshAccessToken();
            if (refreshResult.success) {
                token = this.getAccessToken();
                response = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${token}`
                    }
                });
            } else {
                // Refresh başarısız, çıkış yap
                this.clearTokens();
                window.location.href = '/index.html';
                throw new Error('Oturum süresi doldu');
            }
        }

        return response;
    }
}

// Export auth service instance
const authService = new AuthService();
window.authService = authService;

console.log('✅ Auth Service initialized (JWT with Backend)');
