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
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
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
    document.getElementById(modalId).style.display = 'none';
}

function switchToRegister() {
    closeModal('loginModal');
    showRegisterModal();
}

function switchToLogin() {
    closeModal('registerModal');
    showLoginModal();
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showAlert('Lütfen tüm alanları doldurun.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Giriş yapılıyor...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock user data based on email
        const mockUser = {
            id: Date.now(),
            email: email,
            role: getUserRoleFromEmail(email),
            companyName: getCompanyNameFromEmail(email),
            phone: '+90 555 123 4567',
            createdAt: new Date().toISOString()
        };
        
        // Save user data
        currentUser = mockUser;
        isLoggedIn = true;
        userRole = mockUser.role;
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        
        // Close modal and redirect to dashboard
        closeModal('loginModal');
        showAlert('Başarıyla giriş yaptınız!', 'success');
        
        // Redirect to appropriate dashboard
        setTimeout(() => {
            redirectToDashboard();
        }, 1000);
        
    } catch (error) {
        showAlert('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    } finally {
        // Reset button state
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
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
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
    // Mock role assignment based on email
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
    if (!userRole) {
        window.location.href = 'index.html';
        return;
    }
    
    const dashboardUrls = {
        'hammaddeci': 'panels/hammaddeci.html',
        'uretici': 'panels/uretici.html',
        'toptanci': 'panels/toptanci.html',
        'satici': 'panels/satici.html',
        'musteri': 'panels/musteri.html',
        'admin': 'panels/admin.html'
    };
    
    const dashboardUrl = dashboardUrls[userRole] || 'index.html';
    window.location.href = dashboardUrl;
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
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = 'var(--shadow-md)';
    } else {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
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

// Export functions for global access
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.closeModal = closeModal;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.toggleMobileMenu = toggleMobileMenu;
window.scrollToFeatures = scrollToFeatures;
window.logout = logout;

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
