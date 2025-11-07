/**
 * Panel Access Gateway
 * Handles short panel URLs with role-based authentication before redirecting
 */

(function() {
    'use strict';

    class PanelAccessGateway {
        constructor() {
            this.role = document.body.dataset.requiredRole || null;
            this.redirectUrl = document.body.dataset.redirectUrl || '/';
            this.panelName = document.body.dataset.panelName || 'Panel';
            this.defaultEmail = document.body.dataset.defaultEmail || '';
            this.form = document.getElementById('panelAccessForm');
            this.messageEl = document.getElementById('panelAccessMessage');
            this.submitButton = this.form?.querySelector('button[type="submit"]');
            this.emailInput = this.form?.querySelector('input[name="email"]');
            this.passwordInput = this.form?.querySelector('input[name="password"]');
            this.supportEl = document.getElementById('panelSupportText');
            this.sessionKey = `panel_access_${this.role || 'general'}`;
        }

        async init() {
            if (!this.form) {
                console.error('Panel access form not found');
                return;
            }

            this.prefillEmail();
            this.setupSupportText();
            this.attachListeners();

            await this.ensureAuthService();
            await this.tryAutoRedirect();
        }

        prefillEmail() {
            if (this.defaultEmail && this.emailInput) {
                this.emailInput.value = this.defaultEmail;
            }
        }

        setupSupportText() {
            if (!this.supportEl) return;
            const supportEmail = document.body.dataset.supportEmail || 'destek@videosat.com';
            this.supportEl.innerHTML = `Sorun mu yaşıyorsunuz? <strong>${supportEmail}</strong> üzerinden bizimle iletişime geçebilirsiniz.`;
        }

        attachListeners() {
            this.form.addEventListener('submit', (event) => this.handleSubmit(event));
        }

        async ensureAuthService() {
            if (!window.authService && typeof AuthService === 'function') {
                window.authService = new AuthService();
            }
        }

        async tryAutoRedirect() {
            const sessionGranted = sessionStorage.getItem(this.sessionKey) === 'granted';
            const currentUser = await this.getCurrentUser();

            if (currentUser && this.userHasAccess(currentUser)) {
                sessionStorage.setItem(this.sessionKey, 'granted');
                this.redirectToPanel();
                return;
            }

            if (sessionGranted && currentUser) {
                this.redirectToPanel();
            }
        }

        getLegacyUser() {
            const userStr = localStorage.getItem('currentUser');
            if (!userStr) return null;
            try {
                return JSON.parse(userStr);
            } catch (error) {
                console.warn('Legacy user parse failed', error);
                return null;
            }
        }

        async getCurrentUser() {
            // Prefer auth service if available
            if (window.authService) {
                try {
                    const cached = window.authService.getCurrentUser?.();
                    if (cached) {
                        return cached;
                    }

                    const verifyResult = await window.authService.verifyToken?.();
                    if (verifyResult?.authenticated && verifyResult.user) {
                        return verifyResult.user;
                    }
                } catch (error) {
                    console.warn('Auth service verification failed:', error);
                }
            }

            return this.getLegacyUser();
        }

        userHasAccess(user) {
            if (!user) return false;
            if (!this.role) return true;
            return user.role === this.role;
        }

        async handleSubmit(event) {
            event.preventDefault();

            const email = this.emailInput?.value.trim().toLowerCase();
            const password = this.passwordInput?.value || '';

            if (!email || !password) {
                this.showMessage('Lütfen e-posta ve şifrenizi girin.', 'error');
                return;
            }

            this.setLoading(true);

            let loginResult = null;

            if (window.authService && typeof window.authService.login === 'function') {
                loginResult = await window.authService.login(email, password);
            }

            if (!loginResult || !loginResult.success) {
                loginResult = await this.legacyLogin(email, password);
            }

            if (loginResult.success) {
                const user = loginResult.user || (await this.getCurrentUser());
                if (this.userHasAccess(user)) {
                    sessionStorage.setItem(this.sessionKey, 'granted');
                    this.showMessage('Giriş başarılı. Yönlendiriliyorsunuz...', 'success');
                    setTimeout(() => this.redirectToPanel(), 600);
                } else {
                    this.showMessage('Bu panel için yetkiniz bulunmuyor.', 'error');
                }
            } else {
                this.showMessage(loginResult.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.', 'error');
            }

            this.setLoading(false);
        }

        async legacyLogin(email, password) {
            // Simple fallback based on stored test users
            try {
                const usersStr = localStorage.getItem('users');
                const users = usersStr ? JSON.parse(usersStr) : [];
                const user = users.find((u) => u.email?.toLowerCase() === email && (u.password === password || u.passwordHash === password));

                if (user) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    return { success: true, user };
                }
            } catch (error) {
                console.warn('Legacy login failed:', error);
            }

            return { success: false, message: 'Geçersiz giriş bilgileri.' };
        }

        setLoading(isLoading) {
            if (!this.submitButton) return;
            this.submitButton.disabled = isLoading;
            this.submitButton.innerHTML = isLoading
                ? '<i class="fas fa-spinner fa-spin"></i> Giriş yapılıyor...'
                : '<i class="fas fa-sign-in-alt"></i> Panele Giriş Yap';
        }

        showMessage(message, type = 'info') {
            if (!this.messageEl) return;
            this.messageEl.textContent = message;
            this.messageEl.className = `panel-message show ${type}`;
            this.messageEl.removeAttribute('hidden');
        }

        redirectToPanel() {
            window.location.href = this.redirectUrl;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const gateway = new PanelAccessGateway();
        gateway.init();
    });
})();
