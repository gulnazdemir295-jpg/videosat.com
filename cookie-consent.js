// Cookie Consent Manager
class CookieConsent {
    constructor() {
        this.cookiePreferences = {
            necessary: true, // Zorunlu çerezler her zaman açık
            analytics: false,
            marketing: false
        };
        this.init();
    }

    init() {
        // Check if user has already consented
        const consent = localStorage.getItem('cookieConsent');
        const preferences = localStorage.getItem('cookiePreferences');
        
        if (preferences) {
            try {
                this.cookiePreferences = { ...this.cookiePreferences, ...JSON.parse(preferences) };
            } catch (e) {
                console.error('Cookie preferences parse error:', e);
            }
        }
        
        if (!consent) {
            this.showConsent();
        } else {
            // Apply saved preferences
            this.applyPreferences();
        }
    }

    showConsent() {
        // Create cookie banner
        const banner = document.createElement('div');
        banner.id = 'cookieBanner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-info">
                    <i class="fas fa-cookie-bite"></i>
                    <div class="cookie-text">
                        <h4>Çerez Kullanımı</h4>
                        <p>Bu site, size en iyi deneyimi sunmak için çerezler kullanmaktadır. Zorunlu çerezler site işlevselliği için gereklidir. Analitik ve pazarlama çerezlerini tercihlerinize göre yönetebilirsiniz.</p>
                    </div>
                </div>
                <div class="cookie-actions">
                    <a href="cookie-policy.html" class="btn btn-link" target="_blank">Detaylar</a>
                    <button class="btn btn-secondary" onclick="showCookiePreferences()">
                        <i class="fas fa-cog"></i> Tercihler
                    </button>
                    <button class="btn btn-danger" onclick="rejectCookies()">
                        <i class="fas fa-times"></i> Reddet
                    </button>
                    <button class="btn btn-primary" onclick="acceptAllCookies()">
                        <i class="fas fa-check"></i> Tümünü Kabul Et
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Animate in
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }

    acceptAll() {
        this.cookiePreferences = {
            necessary: true,
            analytics: true,
            marketing: true
        };
        this.savePreferences();
        this.hideBanner();
    }

    reject() {
        this.cookiePreferences = {
            necessary: true, // Zorunlu çerezler her zaman açık
            analytics: false,
            marketing: false
        };
        this.savePreferences();
        this.hideBanner();
    }

    acceptSelected() {
        this.savePreferences();
        this.hideBanner();
    }

    savePreferences() {
        localStorage.setItem('cookieConsent', 'accepted');
        localStorage.setItem('cookieConsentDate', new Date().toISOString());
        localStorage.setItem('cookiePreferences', JSON.stringify(this.cookiePreferences));
        this.applyPreferences();
    }

    applyPreferences() {
        // Analytics cookies
        if (this.cookiePreferences.analytics) {
            // Enable analytics tracking
            if (window.analyticsService) {
                window.analyticsService.enable();
            }
        } else {
            // Disable analytics tracking
            if (window.analyticsService) {
                window.analyticsService.disable();
            }
        }

        // Marketing cookies
        if (this.cookiePreferences.marketing) {
            // Enable marketing tracking
            console.log('Marketing cookies enabled');
        } else {
            // Disable marketing tracking
            console.log('Marketing cookies disabled');
        }
    }

    showPreferencesModal() {
        // Create preferences modal
        const modal = document.createElement('div');
        modal.id = 'cookiePreferencesModal';
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'cookiePreferencesTitle');
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2 id="cookiePreferencesTitle">Çerez Tercihleri</h2>
                    <span class="close" onclick="closeCookiePreferences()" aria-label="Kapat">&times;</span>
                </div>
                <div class="auth-form">
                    <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">
                        Aşağıdaki çerez kategorilerini yönetebilirsiniz. Zorunlu çerezler site işlevselliği için gereklidir ve devre dışı bırakılamaz.
                    </p>
                    
                    <div class="cookie-category" style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-md);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <div>
                                <h4 style="margin: 0; color: var(--text-primary);">Zorunlu Çerezler</h4>
                                <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: var(--text-secondary);">
                                    Site işlevselliği için gerekli çerezler
                                </p>
                            </div>
                            <label class="cookie-toggle" style="position: relative; display: inline-block; width: 50px; height: 26px;">
                                <input type="checkbox" checked disabled style="opacity: 0; width: 0; height: 0;">
                                <span class="cookie-slider" style="position: absolute; cursor: not-allowed; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--primary-color); border-radius: 26px; opacity: 0.6;"></span>
                            </label>
                        </div>
                    </div>

                    <div class="cookie-category" style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-md);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <div>
                                <h4 style="margin: 0; color: var(--text-primary);">Analitik Çerezler</h4>
                                <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: var(--text-secondary);">
                                    Site kullanımını analiz etmek için kullanılır
                                </p>
                            </div>
                            <label class="cookie-toggle" style="position: relative; display: inline-block; width: 50px; height: 26px;">
                                <input type="checkbox" id="analyticsToggle" ${this.cookiePreferences.analytics ? 'checked' : ''} onchange="updateCookiePreference('analytics', this.checked)">
                                <span class="cookie-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${this.cookiePreferences.analytics ? 'var(--primary-color)' : '#ccc'}; border-radius: 26px; transition: 0.3s;"></span>
                            </label>
                        </div>
                    </div>

                    <div class="cookie-category" style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-md);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <div>
                                <h4 style="margin: 0; color: var(--text-primary);">Pazarlama Çerezleri</h4>
                                <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: var(--text-secondary);">
                                    Kişiselleştirilmiş reklamlar için kullanılır
                                </p>
                            </div>
                            <label class="cookie-toggle" style="position: relative; display: inline-block; width: 50px; height: 26px;">
                                <input type="checkbox" id="marketingToggle" ${this.cookiePreferences.marketing ? 'checked' : ''} onchange="updateCookiePreference('marketing', this.checked)">
                                <span class="cookie-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${this.cookiePreferences.marketing ? 'var(--primary-color)' : '#ccc'}; border-radius: 26px; transition: 0.3s;"></span>
                            </label>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                        <button class="btn btn-primary btn-block" onclick="saveCookiePreferences()">
                            <i class="fas fa-save"></i> Tercihleri Kaydet
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeCookiePreferences();
            }
        });
    }

    hideBanner() {
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
    }

    hidePreferencesModal() {
        const modal = document.getElementById('cookiePreferencesModal');
        if (modal) {
            modal.style.display = 'none';
            setTimeout(() => modal.remove(), 300);
        }
    }
}

// Global functions
function acceptAllCookies() {
    window.cookieConsent.acceptAll();
}

function rejectCookies() {
    window.cookieConsent.reject();
}

function showCookiePreferences() {
    window.cookieConsent.showPreferencesModal();
}

function closeCookiePreferences() {
    window.cookieConsent.hidePreferencesModal();
}

function updateCookiePreference(category, enabled) {
    window.cookieConsent.cookiePreferences[category] = enabled;
    // Update toggle visual
    const toggle = document.getElementById(category + 'Toggle');
    if (toggle) {
        const slider = toggle.nextElementSibling;
        if (slider) {
            slider.style.backgroundColor = enabled ? 'var(--primary-color)' : '#ccc';
        }
    }
}

function saveCookiePreferences() {
    window.cookieConsent.acceptSelected();
    closeCookiePreferences();
}

// Initialize
window.cookieConsent = new CookieConsent();

