// Global Variables
let currentUser = null;
let isLoggedIn = false;
let userRole = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

// Initialize Application
function initializeApp() {
    console.log('VideoSat Platform Initialized');
    
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        userRole = currentUser.role;
        updateUIForLoggedInUser();
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

// Authentication Functions
function showLoginModal() {
    closeModal('registerModal');
    document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal() {
    closeModal('loginModal');
    document.getElementById('registerModal').style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    } else {
        // Fallback: close all modals
        document.querySelectorAll('.modal').forEach(m => {
            m.style.display = 'none';
        });
    }
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
        showAlert('Admin olarak başarıyla giriş yaptınız!', 'success');
        
        // Redirect to admin dashboard
        setTimeout(() => {
            redirectToDashboard();
        }, 1000);
        
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
        
        // Şifreyi hash'le
        const passwordHash = await sha256(password);
        console.log(`🔑 Şifre hash'lendi: ${passwordHash.substring(0, 10)}...`);
        
        // User veritabanını al
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        console.log(`👥 Toplam kullanıcı sayısı: ${users.length}`);
        
        // Kullanıcıyı bul
        const user = users.find(u => u.email === email && u.passwordHash === passwordHash);
        
        if (!user) {
            errorMessage = 'E-posta ya da şifre hatalı!';
            console.log(`❌ Kullanıcı bulunamadı: ${email}`);
            
            // Debug: Kullanıcıları listele
            console.log('📋 Mevcut kullanıcılar:', users.map(u => ({ email: u.email, role: u.role })));
            
            showAlert(errorMessage, 'error');
            return;
        }
        
        console.log(`✅ Kullanıcı bulundu: ${user.email} (${user.role})`);
        
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
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Generate member number
    const generateMemberNumber = () => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `${timestamp}-${random}`;
    };
    
    // Şifreyi hash'le
    const passwordHash = await sha256(password);
    
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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
        
    } catch (error) {
        showAlert('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
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
    
    // Panels klasörü silindi, tüm kullanıcıları canlı yayın sayfasına yönlendir
    const basePath = getBasePath();
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
    if (navAuth && currentUser) {
        navAuth.innerHTML = `
            <span class="user-info">
                <i class="fas fa-user"></i>
                ${currentUser.companyName}
            </span>
            <button class="btn btn-outline" onclick="logout()">Çıkış</button>
        `;
    }
}

function logout() {
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
    
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({
        behavior: 'smooth'
    });
}

function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${getAlertIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(alert);
    
    // Position alert
    alert.style.position = 'fixed';
    alert.style.top = '100px';
    alert.style.right = '20px';
    alert.style.zIndex = '3000';
    alert.style.maxWidth = '400px';
    alert.style.boxShadow = 'var(--shadow-lg)';
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
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

// Admin Login Functions
function showAdminLoginModal() {
    closeModal('loginModal');
    closeModal('registerModal');
    document.getElementById('adminLoginModal').style.display = 'block';
}

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
