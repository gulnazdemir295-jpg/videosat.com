// Cookie Consent Manager
class CookieConsent {
    constructor() {
        this.init();
    }

    init() {
        // Check if user has already consented
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            this.showConsent();
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
                        <p>Bu site, size en iyi deneyimi sunmak için çerezler kullanmaktadır. Siteyi kullanarak çerez politikamızı kabul etmiş olursunuz.</p>
                    </div>
                </div>
                <div class="cookie-actions">
                    <a href="terms.html#cookies" class="btn btn-link" target="_blank">Detaylar</a>
                    <button class="btn btn-primary" onclick="acceptCookies()">
                        <i class="fas fa-check"></i> Kabul Et
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

    accept() {
        localStorage.setItem('cookieConsent', 'accepted');
        localStorage.setItem('cookieConsentDate', new Date().toISOString());
        this.hideBanner();
    }

    hideBanner() {
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
    }
}

// Global function
function acceptCookies() {
    window.cookieConsent.accept();
}

// Initialize
window.cookieConsent = new CookieConsent();

