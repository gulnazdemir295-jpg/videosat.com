// Authentication Service - JWT Token Management
class AuthService {
    constructor() {
        this.tokenKey = 'videosat_token';
        this.refreshKey = 'videosat_refresh_token';
    }

    // Generate JWT token (mock)
    generateToken(user) {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            userId: user.id,
            email: user.email,
            role: user.role,
            exp: Date.now() + (15 * 60 * 1000), // 15 minutes
            iat: Date.now()
        }));
        const signature = this.generateSignature(header, payload);
        
        return `${header}.${payload}.${signature}`;
    }

    // Generate refresh token
    generateRefreshToken(user) {
        return btoa(JSON.stringify({
            userId: user.id,
            token: this.randomString(32),
            exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        }));
    }

    // Verify token
    verifyToken(token) {
        try {
            const [header, payload, signature] = token.split('.');
            
            // Verify signature
            if (signature !== this.generateSignature(header, payload)) {
                return { valid: false, reason: 'Invalid signature' };
            }
            
            // Parse payload
            const data = JSON.parse(atob(payload));
            
            // Check expiration
            if (data.exp < Date.now()) {
                return { valid: false, reason: 'Token expired' };
            }
            
            return { valid: true, data };
        } catch (error) {
            return { valid: false, reason: 'Invalid token' };
        }
    }

    // Refresh token
    async refreshAccessToken(refreshToken) {
        try {
            const data = JSON.parse(atob(refreshToken));
            
            if (data.exp < Date.now()) {
                return { success: false, message: 'Refresh token expired' };
            }
            
            // Get user from token
            const user = { id: data.userId };
            const newToken = this.generateToken(user);
            
            return { success: true, token: newToken };
        } catch (error) {
            return { success: false, message: 'Invalid refresh token' };
        }
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

    // Clear tokens
    clearTokens() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshKey);
    }

    // Check if authenticated
    isAuthenticated() {
        const token = this.getAccessToken();
        if (!token) return false;
        
        const verification = this.verifyToken(token);
        if (!verification.valid) {
            // Try to refresh
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
                // In real app, would call refresh endpoint
                this.clearTokens();
            }
            return false;
        }
        
        return true;
    }

    // Get current user from token
    getCurrentUser() {
        const token = this.getAccessToken();
        if (!token) return null;
        
        const verification = this.verifyToken(token);
        if (verification.valid) {
            return verification.data;
        }
        
        return null;
    }

    // Generate signature (mock)
    generateSignature(header, payload) {
        return btoa(`${header}.${payload}.secret`).substring(0, 43);
    }

    // Random string generator
    randomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

// Export auth service instance
const authService = new AuthService();
window.authService = authService;

console.log('✅ Auth Service initialized (JWT)');

