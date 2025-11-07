/**
 * Panel Access Gateway
 * Handles short panel URLs with role-based authentication before redirecting
 */

(function() {
    'use strict';

    class PanelAccessGateway {
        constructor() {
            this.role = document.body.dataset.requiredRole || null;
            this.redirectUrl = this.computeRedirectUrl(document.body.dataset.redirectUrl || '/');
            this.panelName = document.body.dataset.panelName || 'Panel';
            this.defaultEmail = document.body.dataset.defaultEmail || '';
            this.form = document.getElementById('panelAccessForm');
            this.messageEl = document.getElementById('panelAccessMessage');
            this.submitButton = this.form?.querySelector('button[type="submit"]');
            this.emailInput = this.form?.querySelector('input[name="email"]');
            this.passwordInput = this.form?.querySelector('input[name="password"]');
            this.supportEl = document.getElementById('panelSupportText');
            this.sessionKey = `panel_access_${this.role || 'general'}`;
            this.changePasswordToggle = document.getElementById('panelChangePasswordToggle');
            this.changePasswordForm = document.getElementById('panelChangePasswordForm');
            this.changePasswordMessageEl = document.getElementById('panelChangePasswordMessage');
            this.changePasswordFields = this.changePasswordForm
                ? {
                    current: this.changePasswordForm.querySelector('input[name="currentPassword"]'),
                    next: this.changePasswordForm.querySelector('input[name="newPassword"]'),
                    confirm: this.changePasswordForm.querySelector('input[name="confirmPassword"]')
                }
                : {};
            this.fallbackUsers = this.getFallbackUsers();
        }

        computeRedirectUrl(rawUrl) {
            if (!this.role) {
                return rawUrl || '/';
            }

            const cleanUrl = (rawUrl || '').trim();
            const isCustom = cleanUrl && !cleanUrl.includes('live-stream') && !cleanUrl.includes('admin-dashboard');
            if (isCustom && !cleanUrl.endsWith('/')) {
                return cleanUrl;
            }

            try {
                const target = new URL('../panel.html', window.location.href);
                target.searchParams.set('role', this.role);
                return target.pathname + target.search;
            } catch (error) {
                console.warn('Panel redirect hesaplanırken hata oluştu:', error);
                return `/panel.html?role=${this.role}`;
            }
        }

        async init() {
            if (!this.form) {
                console.error('Panel access form not found');
                return;
            }

            this.seedFallbackUsers();
            this.prefillEmail();
            this.setupSupportText();
            this.attachListeners();
            this.setupPasswordChange();

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

        setupPasswordChange() {
            if (!this.changePasswordForm) {
                return;
            }

            this.setChangePasswordVisibility(false);

            if (this.changePasswordToggle) {
                this.changePasswordToggle.setAttribute('aria-controls', 'panelChangePasswordForm');
                this.changePasswordToggle.addEventListener('click', () => {
                    const shouldShow = this.changePasswordForm.hasAttribute('hidden');
                    this.setChangePasswordVisibility(shouldShow);
                    if (shouldShow) {
                        if (!this.emailInput?.value && this.defaultEmail) {
                            this.emailInput.value = this.defaultEmail;
                        }
                        this.changePasswordFields.current?.focus();
                    } else {
                        this.changePasswordForm.reset();
                        this.showMessage('', 'info', this.changePasswordMessageEl);
                    }
                });
            }

            this.changePasswordForm.addEventListener('submit', (event) => this.handleChangePassword(event));
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

                const fallbackAdmins = [
                    { email: 'admin@videosat.com', password: 'admin123', role: 'admin' },
                    { email: 'admin@basvideo.com', password: 'admin123', role: 'admin' }
                ];

                const adminUser = fallbackAdmins.find((admin) => admin.email === email && admin.password === password);
                if (adminUser) {
                    const userTemplate = {
                        id: `admin-${Date.now()}`,
                        email: adminUser.email,
                        role: adminUser.role,
                        companyName: 'VideoSat Admin',
                        firstName: 'Admin',
                        lastName: 'User',
                        phone: '+90 555 000 0000',
                        address: 'Admin Adresi',
                        city: 'istanbul',
                        sector: 'admin',
                        status: 'active',
                        createdAt: new Date().toISOString(),
                        lastLogin: new Date().toISOString(),
                        password: adminUser.password
                    };

                    users.push(userTemplate);
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('currentUser', JSON.stringify(userTemplate));
                    return { success: true, user: userTemplate };
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

        showMessage(message, type = 'info', element = this.messageEl) {
            if (!element) return;
            if (!message) {
                element.textContent = '';
                element.className = 'panel-message';
                element.setAttribute('hidden', '');
                return;
            }
            element.textContent = message;
            element.className = `panel-message show ${type}`;
            element.removeAttribute('hidden');
        }

        redirectToPanel() {
            window.location.href = this.redirectUrl;
        }

        setChangePasswordVisibility(visible) {
            if (!this.changePasswordForm) return;
            if (visible) {
                this.changePasswordForm.removeAttribute('hidden');
                this.changePasswordToggle?.classList.add('active');
                this.changePasswordToggle?.setAttribute('aria-expanded', 'true');
            } else {
                this.changePasswordForm.setAttribute('hidden', '');
                this.changePasswordToggle?.classList.remove('active');
                this.changePasswordToggle?.setAttribute('aria-expanded', 'false');
            }
        }

        setChangePasswordLoading(isLoading) {
            if (!this.changePasswordForm) return;
            const submitBtn = this.changePasswordForm.querySelector('button[type="submit"]');
            if (!submitBtn) return;
            submitBtn.disabled = isLoading;
            submitBtn.innerHTML = isLoading
                ? '<i class="fas fa-spinner fa-spin"></i> Güncelleniyor...'
                : '<i class="fas fa-save"></i> Şifreyi Güncelle';
        }

        getFallbackUsers() {
            return [
                { email: 'admin@videosat.com', password: 'admin123', role: 'admin', companyName: 'VideoSat Yönetim', firstName: 'Admin', lastName: 'Kullanıcısı' },
                { email: 'admin@basvideo.com', password: 'admin123', role: 'admin', companyName: 'VideoSat Yönetim', firstName: 'Admin', lastName: 'VideoSat' },
                { email: 'hammaddeci@videosat.com', password: 'test123', role: 'hammaddeci', companyName: 'Hammadde Tedarik A.Ş.', firstName: 'Hammadde', lastName: 'Yetkilisi' },
                { email: 'uretici@videosat.com', password: 'test123', role: 'uretici', companyName: 'Üretim Firma Ltd.', firstName: 'Üretim', lastName: 'Koordinatörü' },
                { email: 'toptanci@videosat.com', password: 'test123', role: 'toptanci', companyName: 'Toptan Satış A.Ş.', firstName: 'Toptancı', lastName: 'Temsilcisi' },
                { email: 'satici@videosat.com', password: 'satici123', role: 'satici', companyName: 'Perakende Satış Ltd.', firstName: 'Satış', lastName: 'Yetkilisi' },
                { email: 'yonetim@videosat.com', password: 'yonetim123', role: 'yonetim', companyName: 'VideoSat Yönetim Birimi', firstName: 'Yönetim', lastName: 'Koordinatörü' },
                { email: 'finans@videosat.com', password: 'finans123', role: 'finans', companyName: 'VideoSat Finans Departmanı', firstName: 'Finans', lastName: 'Uzmanı' },
                { email: 'operasyon@videosat.com', password: 'operasyon123', role: 'operasyon', companyName: 'VideoSat Operasyon Ekibi', firstName: 'Operasyon', lastName: 'Sorumlusu' },
                { email: 'musterihizmetleri@videosat.com', password: 'musteri123', role: 'musteri-hizmetleri', companyName: 'VideoSat Destek Merkezi', firstName: 'Müşteri', lastName: 'Temsilcisi' },
                { email: 'insankaynaklari@videosat.com', password: 'ik123456', role: 'insan-kaynaklari', companyName: 'VideoSat İnsan Kaynakları', firstName: 'İK', lastName: 'Uzmanı' },
                { email: 'muhasebe@videosat.com', password: 'muhasebe123', role: 'muhasebe', companyName: 'VideoSat Muhasebe', firstName: 'Muhasebe', lastName: 'Yetkilisi' },
                { email: 'faturalandirma@videosat.com', password: 'fatura123', role: 'faturalandirma', companyName: 'VideoSat Faturalandırma', firstName: 'Faturalandırma', lastName: 'Uzmanı' },
                { email: 'personelozluk@videosat.com', password: 'ozluk123', role: 'personel-ozluk-isleri', companyName: 'VideoSat Özlük İşleri', firstName: 'Özlük', lastName: 'Uzmanı' },
                { email: 'reklam@videosat.com', password: 'reklam123', role: 'reklam', companyName: 'VideoSat Reklam ve Pazarlama', firstName: 'Reklam', lastName: 'Yöneticisi' },
                { email: 'isgelistirme@videosat.com', password: 'gelistirme123', role: 'is-gelistirme', companyName: 'VideoSat İş Geliştirme', firstName: 'İş', lastName: 'Geliştirme' },
                { email: 'arge@videosat.com', password: 'arge12345', role: 'ar-ge', companyName: 'VideoSat AR-GE', firstName: 'AR-GE', lastName: 'Uzmanı' },
                { email: 'yazilimdonanimguvenlik@videosat.com', password: 'ydg12345', role: 'yazilim-donanim-guvenlik', companyName: 'VideoSat Teknoloji ve Güvenlik', firstName: 'Teknoloji', lastName: 'Uzmanı' }
            ];
        }

        seedFallbackUsers() {
            const existingUsers = this.getStoredUsers();
            const byEmail = new Map(existingUsers.map((user) => [
                (user.email || '').toLowerCase(),
                user
            ]));

            let updated = false;

            this.fallbackUsers.forEach((fallback) => {
                const key = (fallback.email || '').toLowerCase();
                if (!key || byEmail.has(key)) {
                    return;
                }

                const seedUser = {
                    id: `seed-${key}`,
                    email: fallback.email,
                    password: fallback.password,
                    role: fallback.role,
                    companyName: fallback.companyName,
                    firstName: fallback.firstName,
                    lastName: fallback.lastName,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    lastLogin: null,
                    mustChangePassword: true
                };

                existingUsers.push(seedUser);
                byEmail.set(key, seedUser);
                updated = true;
            });

            if (updated) {
                this.saveUsers(existingUsers);
            }
        }

        getStoredUsers() {
            try {
                const usersStr = localStorage.getItem('users');
                const users = usersStr ? JSON.parse(usersStr) : [];
                return Array.isArray(users) ? users : [];
            } catch (error) {
                console.warn('Stored users parse failed:', error);
                return [];
            }
        }

        saveUsers(users) {
            try {
                localStorage.setItem('users', JSON.stringify(users));
            } catch (error) {
                console.warn('Persist users failed:', error);
            }
        }

        findOrCreateUser(email) {
            const normalizedEmail = (email || '').trim().toLowerCase();
            let users = this.getStoredUsers();
            let index = users.findIndex((u) => u.email?.toLowerCase() === normalizedEmail);
            let record = index >= 0 ? users[index] : null;

            if (!record) {
                const fallback = this.fallbackUsers.find((user) => user.email === normalizedEmail);
                if (fallback) {
                    record = {
                        id: `seed-${Date.now()}`,
                        email: fallback.email,
                        password: fallback.password,
                        role: fallback.role,
                        companyName: fallback.companyName,
                        firstName: fallback.firstName || fallback.role.charAt(0).toUpperCase() + fallback.role.slice(1),
                        lastName: fallback.lastName || 'Kullanıcı',
                        status: 'active',
                        createdAt: new Date().toISOString(),
                        lastLogin: new Date().toISOString()
                    };
                    users.push(record);
                    index = users.length - 1;
                    this.saveUsers(users);
                }
            }

            return { users, index, record };
        }

        syncCurrentUser(updatedUser) {
            if (!updatedUser) return;
            try {
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            } catch (error) {
                console.warn('Persist currentUser failed:', error);
            }
            if (window.authService && typeof window.authService.setUser === 'function') {
                try {
                    window.authService.setUser(updatedUser);
                } catch (error) {
                    console.warn('AuthService setUser failed:', error);
                }
            }
        }

        async handleChangePassword(event) {
            event.preventDefault();

            if (!this.changePasswordForm) {
                return;
            }

            const messageEl = this.changePasswordMessageEl;
            const email = (this.emailInput?.value || this.defaultEmail || '').trim().toLowerCase();
            const currentPassword = this.changePasswordFields.current?.value || '';
            const newPassword = this.changePasswordFields.next?.value || '';
            const confirmPassword = this.changePasswordFields.confirm?.value || '';

            this.showMessage('', 'info', messageEl);

            if (!email) {
                this.showMessage('Lütfen önce e-posta alanını doldurun.', 'error', messageEl);
                this.emailInput?.focus();
                return;
            }

            if (!currentPassword || !newPassword || !confirmPassword) {
                this.showMessage('Mevcut, yeni ve tekrar şifre alanlarının tümünü doldurun.', 'error', messageEl);
                return;
            }

            if (newPassword.length < 8) {
                this.showMessage('Yeni şifre en az 8 karakter olmalıdır.', 'error', messageEl);
                return;
            }

            if (newPassword === currentPassword) {
                this.showMessage('Yeni şifre mevcut şifreniz ile aynı olamaz.', 'error', messageEl);
                return;
            }

            if (newPassword !== confirmPassword) {
                this.showMessage('Yeni şifre ve tekrarı eşleşmiyor.', 'error', messageEl);
                return;
            }

            const { users, index, record } = this.findOrCreateUser(email);

            if (!record) {
                this.showMessage('Bu e-posta ile bir kullanıcı bulunamadı. Lütfen önce giriş yapın.', 'error', messageEl);
                return;
            }

            const storedPassword = record.password || record.passwordHash;
            if (storedPassword && storedPassword !== currentPassword) {
                this.showMessage('Mevcut şifreniz doğrulanamadı.', 'error', messageEl);
                return;
            }

            this.setChangePasswordLoading(true);

            try {
                const updatedRecord = {
                    ...record,
                    password: newPassword,
                    lastPasswordChange: new Date().toISOString()
                };

                delete updatedRecord.passwordHash;

                if (index >= 0) {
                    users[index] = updatedRecord;
                } else {
                    users.push(updatedRecord);
                }

                this.saveUsers(users);
                this.syncCurrentUser(updatedRecord);
                sessionStorage.setItem(this.sessionKey, 'granted');

                this.showMessage('Şifreniz başarıyla güncellendi.', 'success', messageEl);
                this.changePasswordForm.reset();

                setTimeout(() => {
                    this.setChangePasswordVisibility(false);
                    this.showMessage('', 'info', messageEl);
                }, 1600);
            } catch (error) {
                console.error('Password change failed:', error);
                this.showMessage('Şifre güncelleme sırasında bir hata oluştu. Lütfen tekrar deneyin.', 'error', messageEl);
            } finally {
                this.setChangePasswordLoading(false);
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const gateway = new PanelAccessGateway();
        gateway.init();
    });
})();
