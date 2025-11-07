// Global Variables
let currentUser = null;
let isLoggedIn = false;
let userRole = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupMobileMenuListeners();
    checkAuthStatus();
});

// Initialize Application
async function initializeApp() {
    console.log('VideoSat Platform Initialized');
    
    // Check if user is logged in using new auth service
    if (window.authService) {
        const verifyResult = await authService.verifyToken();
        if (verifyResult.authenticated && verifyResult.user) {
            currentUser = verifyResult.user;
            isLoggedIn = true;
            userRole = verifyResult.user.role;
            updateUIForLoggedInUser();
            console.log('✅ Kullanıcı oturumu doğrulandı:', currentUser.email);
        } else {
            // Eski sistem uyumluluğu - localStorage'dan kontrol et
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                try {
                    const user = JSON.parse(savedUser);
                    currentUser = user;
                    isLoggedIn = true;
                    userRole = user.role;
                    updateUIForLoggedInUser();
                    console.log('⚠️ Eski sistem kullanıcı bilgisi yüklendi:', user.email);
                } catch (e) {
                    console.error('Eski kullanıcı bilgisi parse edilemedi:', e);
                }
            }
        }
    } else {
        // Auth service henüz yüklenmemiş, eski sistemi kullan
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            isLoggedIn = true;
            userRole = currentUser.role;
            updateUIForLoggedInUser();
        }
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Admin Login Form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Contact Form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Ana sayfadaki anchor linkleri için smooth scroll
            if (href === '#home' || href === '#features' || href === '#pricing' || href === '#contact') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Navbar yüksekliği için offset
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Nav logo için özel işlem
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo && navLogo.getAttribute('href') === 'index.html') {
        navLogo.addEventListener('click', function(e) {
            // Eğer zaten anasayfadaysak, sayfanın başına scroll yap
            if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// Setup Mobile Menu Listeners
function setupMobileMenuListeners() {
    // Menü dışına tıklanınca kapat
    document.addEventListener('click', closeMobileMenuOnOutsideClick);
    
    // Nav linklerine tıklanınca menüyü kapat
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenuOnLinkClick();
        });
    });
    
    // ESC tuşu ile menüyü kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const navMenu = document.getElementById('navMenu');
            if (navMenu && navMenu.classList.contains('active')) {
                closeMobileMenuOnLinkClick();
            }
        }
    });
    
    // Pencere boyutu değişince menüyü kapat (desktop'a geçince)
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                const navMenu = document.getElementById('navMenu');
                const hamburger = document.querySelector('.hamburger');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    if (hamburger) {
                        hamburger.classList.remove('active');
                    }
                    document.body.style.overflow = '';
                }
            }
        }, 250);
    });
}

// Authentication Functions
function showLoginModal() {
    closeModal('registerModal');
    closeModal('adminLoginModal');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        // Lock body scroll
        lockBodyScroll();
        // Focus trap
        trapFocus(modal);
        // Add ESC key listener
        addModalListeners(modal);
    }
}

function showRegisterModal() {
    closeModal('loginModal');
    closeModal('adminLoginModal');
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        // Lock body scroll
        lockBodyScroll();
        // Focus trap
        trapFocus(modal);
        // Add ESC key listener
        addModalListeners(modal);
    }
}

function showAdminLoginModal() {
    closeModal('loginModal');
    closeModal('registerModal');
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        // Lock body scroll
        lockBodyScroll();
        // Focus trap
        trapFocus(modal);
        // Add ESC key listener
        addModalListeners(modal);
    }
}

// Body scroll lock/unlock functions
function lockBodyScroll() {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.classList.add('modal-open');
    // Store scroll position for later restoration
    document.body.dataset.scrollY = scrollY;
}

function unlockBodyScroll() {
    const scrollY = document.body.dataset.scrollY || 0;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.classList.remove('modal-open');
    window.scrollTo(0, parseInt(scrollY || 0, 10));
    delete document.body.dataset.scrollY;
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        // Remove listeners
        removeModalListeners(modal);
    } else {
        // Fallback: close all modals
        document.querySelectorAll('.modal').forEach(m => {
            m.style.display = 'none';
            m.setAttribute('aria-hidden', 'true');
            removeModalListeners(m);
        });
    }
    
    // Unlock body scroll if no other modal is open
    const openModals = document.querySelectorAll('.modal[style*="display: block"]');
    if (openModals.length === 0) {
        unlockBodyScroll();
    }
}

// Modal event listeners
function addModalListeners(modal) {
    // ESC key handler
    const escHandler = (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal(modal.id);
        }
    };
    
    // Click outside to close
    const clickHandler = (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    };
    
    modal._escHandler = escHandler;
    modal._clickHandler = clickHandler;
    
    document.addEventListener('keydown', escHandler);
    modal.addEventListener('click', clickHandler);
}

function removeModalListeners(modal) {
    if (modal._escHandler) {
        document.removeEventListener('keydown', modal._escHandler);
        delete modal._escHandler;
    }
    if (modal._clickHandler) {
        modal.removeEventListener('click', modal._clickHandler);
        delete modal._clickHandler;
    }
}

// Focus trap for accessibility
function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (firstElement) {
        firstElement.focus();
    }
    
    // Trap focus within modal
    const trapHandler = (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    };
    
    modal._trapHandler = trapHandler;
    modal.addEventListener('keydown', trapHandler);
}

// Handle Admin Login
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminUsername').value.trim().toLowerCase();
    const password = document.getElementById('adminPassword').value;
    
    if (!email || !password) {
        showAlert('Lütfen tüm alanları doldurun.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Admin girişi yapılıyor...';
    submitBtn.disabled = true;
    
    let loginSuccess = false;
    let errorMessage = null;
    
    try {
        console.log(`🔐 Admin giriş denemesi: ${email}`);
        
        // Admin kullanıcıları (basit kontrol)
        const adminUsers = [
            { email: 'admin@videosat.com', password: 'admin123', role: 'admin' },
            { email: 'admin@basvideo.com', password: 'admin123', role: 'admin' }
        ];
        
        const adminUser = adminUsers.find(u => u.email === email && u.password === password);
        
        if (!adminUser) {
            errorMessage = 'Admin e-posta ya da şifre hatalı!';
            console.log(`❌ Admin kullanıcı bulunamadı: ${email}`);
            showAlert(errorMessage, 'error');
            return;
        }
        
        console.log(`✅ Admin kullanıcı bulundu: ${adminUser.email}`);
        
        // Admin kullanıcısını oluştur
        const user = {
            id: Date.now(),
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
            lastLogin: new Date().toISOString()
        };
        
        // currentUser olarak ayarla
        currentUser = user;
        isLoggedIn = true;
        userRole = user.role;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        loginSuccess = true;
        
        // Close modal and redirect to dashboard
        closeModal('adminLoginModal');
        unlockBodyScroll(); // Unlock scroll before redirect
        showAlert('Admin olarak başarıyla giriş yaptınız!', 'success');
        
        // Redirect to admin dashboard (reduced delay)
        setTimeout(() => {
            redirectToDashboard();
        }, 500);
        
    } catch(err) {
        errorMessage = 'Admin girişi sırasında bir hata oluştu: ' + err.message;
        console.error('❌ Admin giriş hatası:', err);
        showAlert(errorMessage, 'error');
    } finally {
        // Login attempt'i logla
        if (window.loginLogger) {
            window.loginLogger.logLoginAttempt(email, password, loginSuccess, errorMessage);
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Global function for window access
window.closeModal = closeModal;
window.showAlert = showAlert;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleAdminLogin = handleAdminLogin;
window.redirectToDashboard = redirectToDashboard;

function switchToRegister() {
    closeModal('loginModal');
    showRegisterModal();
}

function switchToLogin() {
    closeModal('registerModal');
    showLoginModal();
}

// SHA-256 hash fonksiyonu ekle
async function sha256(str) {
  const utf8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showAlert('Lütfen tüm alanları doldurun.', 'error');
        return;
    }
    
    // Kilitleme kontrolü
    if (window.loginLogger) {
        const lockStatus = window.loginLogger.isUserLocked(email);
        if (lockStatus && lockStatus.locked) {
            showAlert(lockStatus.message, 'error');
            return;
        }
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Giriş yapılıyor...';
    submitBtn.disabled = true;
    
    let loginSuccess = false;
    let errorMessage = null;
    
    try {
        console.log(`🔐 Giriş denemesi: ${email}`);
        
        // Yeni auth service ile giriş yap
        if (window.authService) {
            const result = await authService.login(email, password);
            
            if (result.success) {
                // Kullanıcı bilgilerini ayarla
                currentUser = result.user;
                isLoggedIn = true;
                userRole = result.user.role;
                
                // Eski sistem uyumluluğu için localStorage'a da kaydet
                localStorage.setItem('currentUser', JSON.stringify({
                    ...result.user,
                    email: result.user.email,
                    role: result.user.role,
                    companyName: result.user.companyName
                }));
                
                loginSuccess = true;
                
                // Close modal and redirect to dashboard
                closeModal('loginModal');
                unlockBodyScroll(); // Unlock scroll before redirect
                showAlert('Başarıyla giriş yaptınız!', 'success');
                
                // Redirect to appropriate dashboard (reduced delay)
                setTimeout(() => {
                    redirectToDashboard();
                }, 500);
            } else {
                errorMessage = result.message || 'E-posta ya da şifre hatalı!';
                showAlert(errorMessage, 'error');
            }
        } else {
            // Fallback: Eski sistem (localStorage)
            console.warn('⚠️ Auth service bulunamadı, eski sistem kullanılıyor');
            
            // Şifreyi hash'le
            const passwordHash = await sha256(password);
            
            // User veritabanını al
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Kullanıcıyı bul
            const user = users.find(u => u.email === email && u.passwordHash === passwordHash);
            
            if (!user) {
                errorMessage = 'E-posta ya da şifre hatalı!';
                showAlert(errorMessage, 'error');
                return;
            }
            
            // currentUser olarak ayarla
            currentUser = user;
            isLoggedIn = true;
            userRole = user.role;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            loginSuccess = true;
            
            // Close modal and redirect to dashboard
            closeModal('loginModal');
            showAlert('Başarıyla giriş yaptınız!', 'success');
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                redirectToDashboard();
            }, 1000);
        }
        
    } catch(err) {
        errorMessage = 'Giriş sırasında bir hata oluştu: ' + err.message;
        console.error('❌ Giriş hatası:', err);
        showAlert(errorMessage, 'error');
    } finally {
        // Login attempt'i logla
        if (window.loginLogger) {
            window.loginLogger.logLoginAttempt(email, password, loginSuccess, errorMessage);
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const role = document.getElementById('userRole').value;
    const companyName = document.getElementById('companyName').value;
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!role || !companyName || !email || !phone || !password || !confirmPassword) {
        showAlert('Lütfen tüm alanları doldurun.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Şifreler eşleşmiyor.', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Şifre en az 6 karakter olmalıdır.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Kayıt yapılıyor...';
    submitBtn.disabled = true;
    
    try {
        // Yeni auth service ile kayıt yap
        if (window.authService) {
            const result = await authService.register({
                email,
                password,
                companyName,
                role,
                phone,
                address: '' // Address field yoksa boş bırak
            });
            
            if (result.success) {
                // Kullanıcı bilgilerini ayarla
                currentUser = result.user;
                isLoggedIn = true;
                userRole = result.user.role;
                
                // Eski sistem uyumluluğu için localStorage'a da kaydet
                localStorage.setItem('currentUser', JSON.stringify({
                    ...result.user,
                    email: result.user.email,
                    role: result.user.role,
                    companyName: result.user.companyName,
                    phone: phone,
                    id: Date.now(),
                    memberNumber: generateMemberNumber(),
                    createdAt: new Date().toISOString(),
                    isActive: true
                }));
                
                // Close modal and redirect to dashboard
                closeModal('registerModal');
                unlockBodyScroll(); // Unlock scroll before redirect
                showAlert('Başarıyla kayıt oldunuz!', 'success');
                
                // Redirect to appropriate dashboard (reduced delay)
                setTimeout(() => {
                    redirectToDashboard();
                }, 500);
            } else {
                showAlert(result.message || 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
            }
        } else {
            // Fallback: Eski sistem (localStorage)
            console.warn('⚠️ Auth service bulunamadı, eski sistem kullanılıyor');
            
            // Generate member number
            const generateMemberNumber = () => {
                const timestamp = Date.now().toString(36).toUpperCase();
                const random = Math.random().toString(36).substring(2, 5).toUpperCase();
                return `${timestamp}-${random}`;
            };
            
            // Şifreyi hash'le
            const passwordHash = await sha256(password);
            
            // Create new user
            const newUser = {
                id: Date.now(),
                email: email,
                role: role,
                companyName: companyName,
                phone: phone,
                memberNumber: generateMemberNumber(),
                createdAt: new Date().toISOString(),
                isActive: true,
                passwordHash // Sadece hash kaydet
            };
            
            // Ayrıca tüm kullanıcıları 'users' altında tutarak sonraki girişte hash kontrolü yapabilmek için:
            let users = JSON.parse(localStorage.getItem('users')||'[]');
            users = users.filter(u => u.email !== newUser.email).concat([newUser]);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Save user data
            currentUser = newUser;
            isLoggedIn = true;
            userRole = newUser.role;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            // Close modal and redirect to dashboard
            closeModal('registerModal');
            showAlert('Başarıyla kayıt oldunuz!', 'success');
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                redirectToDashboard();
            }, 1000);
        }
        
    } catch (error) {
        console.error('Register error:', error);
        showAlert('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Generate member number helper
function generateMemberNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${timestamp}-${random}`;
}

// Handle Contact Form
async function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Gönderiliyor...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showAlert('Mesajınız başarıyla gönderildi!', 'success');
        e.target.reset();
        
    } catch (error) {
        showAlert('Mesaj gönderilirken bir hata oluştu.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Utility Functions
function getUserRoleFromEmail(email) {
    // Test accounts for live streaming
    const testAccounts = {
        'hammaddeci@videosat.com': 'hammaddeci',
        'uretici@videosat.com': 'uretici',
        'toptanci@videosat.com': 'toptanci',
        'test-hammaddeci@test.com': 'hammaddeci',
        'test-uretici@test.com': 'uretici',
        'test-toptanci@test.com': 'toptanci',
        'hammadde123@test.com': 'hammaddeci',
        'uretici123@test.com': 'uretici',
        'toptanci123@test.com': 'toptanci'
    };
    
    // Check if it's a known test account
    if (testAccounts[email]) {
        return testAccounts[email];
    }
    
    // Check email domain for role
    const lowerEmail = email.toLowerCase();
    if (lowerEmail.includes('hammadde') || lowerEmail.includes('raw')) {
        return 'hammaddeci';
    }
    if (lowerEmail.includes('uretici') || lowerEmail.includes('manufacturer')) {
        return 'uretici';
    }
    if (lowerEmail.includes('toptanci') || lowerEmail.includes('wholesale')) {
        return 'toptanci';
    }
    if (lowerEmail.includes('satici') || lowerEmail.includes('seller')) {
        return 'satici';
    }
    if (lowerEmail.includes('musteri') || lowerEmail.includes('customer')) {
        return 'musteri';
    }
    
    // Mock role assignment based on email hash
    const roles = ['hammaddeci', 'uretici', 'toptanci', 'satici', 'musteri', 'admin'];
    const hash = email.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    return roles[Math.abs(hash) % roles.length];
}

function getCompanyNameFromEmail(email) {
    const domain = email.split('@')[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1) + ' Ltd.';
}

function redirectToDashboard() {
    console.log('🔄 Dashboard yönlendirmesi başlatılıyor...');
    console.log('👤 Kullanıcı rolü:', userRole);
    console.log('🔐 Giriş durumu:', isLoggedIn);
    console.log('👤 Mevcut kullanıcı:', currentUser);
    
    if (!userRole || !isLoggedIn || !currentUser) {
        console.warn('⚠️ Kullanıcı bilgileri eksik, ana sayfaya yönlendiriliyor');
        const basePath = getBasePath();
        window.location.href = basePath + 'index.html';
        return;
    }
    
    const basePath = getBasePath();
    
    // Admin kullanıcılarını admin dashboard'a yönlendir
    if (userRole === 'admin') {
        const adminDashboardUrl = basePath + 'admin-dashboard.html';
        console.log('🎯 Admin dashboard sayfasına yönlendiriliyor:', adminDashboardUrl);
        
        // Yönlendirme öncesi son kontrol
        if (window.loginLogger) {
            window.loginLogger.logLoginAttempt(
                currentUser.email, 
                '***', 
                true, 
                null
            );
        }
        
        window.location.href = adminDashboardUrl;
        return;
    }
    
    // Diğer kullanıcıları canlı yayın sayfasına yönlendir
    const liveStreamUrl = basePath + 'live-stream.html';
    
    console.log('🎯 Canlı yayın sayfasına yönlendiriliyor:', liveStreamUrl);
    console.log('📁 Base path:', basePath);
    console.log('👤 Kullanıcı rolü:', userRole);
    
    // Yönlendirme öncesi son kontrol
    if (window.loginLogger) {
        window.loginLogger.logLoginAttempt(
            currentUser.email, 
            '***', 
            true, 
            null
        );
    }
    
    // Canlı yayın sayfasına yönlendir
    window.location.href = liveStreamUrl;
}

// Base path'i doğru şekilde belirle
function getBasePath() {
    const path = window.location.pathname;
    
    // Eğer panels klasöründeysek, bir üst dizine çık
    if (path.includes('panels/')) {
        return '../';
    }
    
    // Ana dizindeysek boş string döndür
    if (path.endsWith('/') || path === '' || path === '/') {
        return '';
    }
    
    // Dosya adı varsa, dosya adını kaldır
    const fileName = path.split('/').pop();
    if (fileName && fileName.includes('.')) {
        return '';
    }
    
    return '';
}

function updateUIForLoggedInUser() {
    const navAuth = document.querySelector('.nav-auth');
    const navMenu = document.querySelector('.nav-menu');
    const basePath = getBasePath();
    
    if (navAuth && currentUser) {
        // Update auth section
        let dashboardLink = '';
        if (userRole === 'admin') {
            dashboardLink = `<a href="${basePath}admin-dashboard.html" class="nav-link">
                <i class="fas fa-tachometer-alt"></i> Dashboard
            </a>`;
        } else {
            dashboardLink = `<a href="${basePath}live-stream.html" class="nav-link">
                <i class="fas fa-video"></i> Canlı Yayın
            </a>`;
        }
        
        navAuth.innerHTML = `
            <span class="user-info" style="color: var(--text-secondary); margin-right: 1rem;">
                <i class="fas fa-user"></i> ${currentUser.companyName || currentUser.email}
            </span>
            ${dashboardLink}
            <button class="btn btn-outline" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i> Çıkış
            </button>
        `;
    }
    
    // Update navigation menu for logged in users
    if (navMenu && currentUser) {
        // Hide login/register buttons if they exist in menu
        const loginLinks = navMenu.querySelectorAll('a[onclick*="showLoginModal"], a[onclick*="showRegisterModal"]');
        loginLinks.forEach(link => {
            link.style.display = 'none';
        });
        
        // Add dashboard link if not exists
        if (!navMenu.querySelector('a[href*="dashboard"], a[href*="live-stream"]')) {
            const dashboardItem = document.createElement('li');
            if (userRole === 'admin') {
                dashboardItem.innerHTML = `<a href="${basePath}admin-dashboard.html" class="nav-link">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a>`;
            } else {
                dashboardItem.innerHTML = `<a href="${basePath}live-stream.html" class="nav-link">
                    <i class="fas fa-video"></i> Canlı Yayın
                </a>`;
            }
            navMenu.insertBefore(dashboardItem, navMenu.firstChild);
        }
    }
}

async function logout() {
    // Yeni auth service ile çıkış yap
    if (window.authService) {
        await authService.logout();
    }
    
    // Local state'i temizle
    currentUser = null;
    isLoggedIn = false;
    userRole = null;
    localStorage.removeItem('currentUser');
    
    // Reset navigation
    const navAuth = document.querySelector('.nav-auth');
    if (navAuth) {
        navAuth.innerHTML = `
            <button class="btn btn-outline" onclick="showLoginModal()">Giriş Yap</button>
            <button class="btn btn-primary" onclick="showRegisterModal()">Kayıt Ol</button>
        `;
    }
    
    showAlert('Başarıyla çıkış yaptınız.', 'success');
    
    // Anasayfaya yönlendir
    setTimeout(() => {
        const basePath = getBasePath();
        // Eğer panel sayfasındaysak anasayfaya dön
        if (window.location.pathname.includes('panels/')) {
            window.location.href = '../index.html';
        } else {
            // Zaten anasayfadaysak sayfayı yenile
            window.location.href = basePath + 'index.html';
        }
    }, 1000);
}

function checkAuthStatus() {
    if (isLoggedIn && currentUser) {
        updateUIForLoggedInUser();
    }
}

// UI Functions
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.querySelector('.hamburger');
    const body = document.body;
    
    const isActive = navMenu.classList.contains('active');
    
    if (isActive) {
        // Menüyü kapat
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        body.style.overflow = ''; // Scroll'u geri aç
    } else {
        // Menüyü aç
        navMenu.classList.add('active');
        hamburger.classList.add('active');
        body.style.overflow = 'hidden'; // Scroll'u engelle
    }
}

// Menü dışına tıklanınca kapat
function closeMobileMenuOnOutsideClick(event) {
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.querySelector('.hamburger');
    const navContainer = document.querySelector('.nav-container');
    
    if (navMenu && navMenu.classList.contains('active')) {
        // Eğer tıklama menü dışındaysa
        if (!navContainer.contains(event.target) && !event.target.closest('.hamburger')) {
            navMenu.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
            }
            document.body.style.overflow = '';
        }
    }
}

// Menü linklerine tıklanınca kapat
function closeMobileMenuOnLinkClick() {
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.querySelector('.hamburger');
    
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        if (hamburger) {
            hamburger.classList.remove('active');
        }
        document.body.style.overflow = '';
    }
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({
        behavior: 'smooth'
    });
}

function showAlert(message, type = 'info', options = {}) {
    if (window.toastService && typeof window.toastService.show === 'function') {
        window.toastService.show(message, type, options);
        return;
    }
    
    // Fallback legacy alert
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${getAlertIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(alert);
    alert.style.position = 'fixed';
    alert.style.top = '100px';
    alert.style.right = '20px';
    alert.style.zIndex = '3000';
    alert.style.maxWidth = '400px';
    alert.style.boxShadow = 'var(--shadow-lg)';
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, options.duration || 5000);
}

function getAlertIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Handle Escape key to close modals
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
});

// Smooth scrolling for all internal links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }
});

// Add scroll effect to navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.98)'; // Siyah - siyah tema
        navbar.style.boxShadow = 'var(--shadow-md)';
    } else {
        navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.95)'; // Siyah - siyah tema
        navbar.style.boxShadow = 'none';
    }
});

// Initialize WebRTC for future live streaming
class WebRTCManager {
    constructor() {
        this.localStream = null;
        this.peerConnections = new Map();
        this.isStreaming = false;
    }
    
    async initializeCamera() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            return this.localStream;
        } catch (error) {
            console.error('Camera access denied:', error);
            throw new Error('Kamera erişimi reddedildi');
        }
    }
    
    async startStreaming() {
        if (!this.localStream) {
            await this.initializeCamera();
        }
        
        this.isStreaming = true;
        return this.localStream;
    }
    
    stopStreaming() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        this.isStreaming = false;
    }
}

// Initialize WebRTC Manager
const webRTCManager = new WebRTCManager();

// Admin Login Functions - Updated to use new modal system
// showAdminLoginModal is already defined above with new features

function switchToNormalLogin() {
    closeModal('adminLoginModal');
    showLoginModal();
}

// Handle Admin Login
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (!username || !password) {
        showAlert('Lütfen tüm alanları doldurun.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Giriş yapılıyor...';
    submitBtn.disabled = true;
    
    try {
        // Debug: Log the entered values
        console.log('Entered username:', username);
        console.log('Entered password:', password);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simple admin credentials check
        if ((username === 'ceo@videosat.com' && password === 'ceo123') ||
            (username === 'admin@videosat.com' && password === 'admin123') ||
            (username === 'admin' && password === 'admin123')) {
        // Generate member number for admin
                    const generateAdminMemberNumber = () => {
                        return 'ADMIN-0000';
                    };
        
        // Create admin user
                    const adminUser = {
                        id: 'admin-001',
                        username: username,
                        role: 'admin',
                        companyName: 'VideoSat Admin',
                        email: 'admin@videosat.com',
                        phone: '+90 212 555 0000',
                        memberNumber: generateAdminMemberNumber(),
                        createdAt: new Date().toISOString(),
                        isAdmin: true
                    };
            
            // Save admin data
            currentUser = adminUser;
            isLoggedIn = true;
            userRole = 'admin';
            localStorage.setItem('currentUser', JSON.stringify(adminUser));
            
            // Close modal and redirect to admin panel
            closeModal('adminLoginModal');
            showAlert('Admin paneline başarıyla giriş yaptınız!', 'success');
            
            // Redirect to admin panel
            setTimeout(() => {
                const basePath = getBasePath();
                window.location.href = basePath + 'live-stream.html';
            }, 1000);
            
        } else {
            showAlert('Geçersiz admin kullanıcı adı veya şifre!', 'error');
        }
        
    } catch (error) {
        showAlert('Admin girişi yapılırken bir hata oluştu.', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Modal click outside to close
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});

// Export functions for global access
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.showAdminLoginModal = showAdminLoginModal;
window.switchToNormalLogin = switchToNormalLogin;
window.closeModal = closeModal;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.toggleMobileMenu = toggleMobileMenu;
window.scrollToFeatures = scrollToFeatures;
window.logout = logout;
window.getAlertIcon = getAlertIcon;
window.showAlert = showAlert;

// Initialize pricing buttons
document.addEventListener('DOMContentLoaded', function() {
    const pricingButtons = document.querySelectorAll('.pricing-card .btn');
    pricingButtons.forEach(button => {
        button.addEventListener('click', function() {
            const plan = this.closest('.pricing-card').querySelector('h3').textContent;
            showAlert(`${plan} planı seçildi! Kayıt olmak için formu doldurun.`, 'info');
            setTimeout(() => {
                showRegisterModal();
            }, 1000);
        });
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.feature-card, .pricing-card, .contact-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

console.log('VideoSat Platform JavaScript Loaded Successfully');

// Şifreyi göster/gizle fonksiyonu
function togglePasswordVisibility(inputId,iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.className = 'fas fa-eye-slash toggle-password';
  } else {
    input.type = 'password';
    if (icon) icon.className = 'fas fa-eye toggle-password';
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;

// Şifremi unuttum ve beni hatırla fonksiyon template'i (sonra doldurabilmek için boş bırak)
async function handleForgotPassword(email) {}
async function handleRememberMe(email, shouldRemember) {}
