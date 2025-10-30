// VideoSat Platform - Test User Creator
// Test kullanıcısı oluşturma ve giriş testi

async function createTestUser() {
    console.log('👤 Test kullanıcısı oluşturuluyor...');
    
    try {
        // SHA-256 hash fonksiyonu
        async function sha256(str) {
            const utf8 = new TextEncoder().encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
            return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        
        // Test kullanıcısı verisi
        const testUser = {
            id: Date.now(),
            email: 'musteri@videosat.com',
            password: 'test123',
            passwordHash: await sha256('test123'),
            companyName: 'Test Müşteri',
            role: 'musteri',
            firstName: 'Test',
            lastName: 'Müşteri',
            phone: '+90 555 123 4567',
            address: 'Test Adresi, İstanbul',
            city: 'istanbul',
            sector: 'musteri',
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        // Mevcut kullanıcıları al
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Eğer kullanıcı zaten varsa güncelle
        const existingUserIndex = users.findIndex(u => u.email === testUser.email);
        if (existingUserIndex >= 0) {
            users[existingUserIndex] = testUser;
            console.log('✅ Mevcut test kullanıcısı güncellendi');
        } else {
            users.push(testUser);
            console.log('✅ Yeni test kullanıcısı oluşturuldu');
        }
        
        // Kullanıcıları kaydet
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('👤 Test kullanıcısı bilgileri:');
        console.log('📧 Email:', testUser.email);
        console.log('🔑 Şifre:', testUser.password);
        console.log('🏢 Şirket:', testUser.companyName);
        console.log('👤 Rol:', testUser.role);
        console.log('🔐 Hash:', testUser.passwordHash.substring(0, 20) + '...');
        
        return testUser;
        
    } catch (error) {
        console.error('❌ Test kullanıcısı oluşturma hatası:', error);
        throw error;
    }
}

// Test girişi yap
async function testLogin(email, password) {
    console.log(`🔐 Test girişi: ${email}`);
    
    try {
        // SHA-256 hash fonksiyonu
        async function sha256(str) {
            const utf8 = new TextEncoder().encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
            return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        
        const passwordHash = await sha256(password);
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.passwordHash === passwordHash);
        
        if (user) {
            console.log('✅ Test girişi başarılı:', user);
            return { success: true, user: user };
        } else {
            console.log('❌ Test girişi başarısız');
            console.log('📋 Mevcut kullanıcılar:', users.map(u => ({ email: u.email, role: u.role })));
            return { success: false, error: 'Kullanıcı bulunamadı' };
        }
        
    } catch (error) {
        console.error('❌ Test girişi hatası:', error);
        return { success: false, error: error.message };
    }
}

// Tüm kullanıcıları listele
function listAllUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('👥 Tüm kullanıcılar:');
    users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.companyName}`);
    });
    return users;
}

// Kullanıcı verilerini temizle
function clearAllUsers() {
    localStorage.removeItem('users');
    localStorage.removeItem('currentUser');
    console.log('🧹 Tüm kullanıcı verileri temizlendi');
}

// Test kullanıcıları oluştur
async function createAllTestUsers() {
    console.log('👥 Tüm test kullanıcıları oluşturuluyor...');
    
    const testUsers = [
        {
            email: 'hammaddeci@videosat.com',
            password: 'test123',
            companyName: 'Test Hammaddeci Firması',
            role: 'hammaddeci',
            firstName: 'Test',
            lastName: 'Hammaddeci'
        },
        {
            email: 'uretici@videosat.com',
            password: 'test123',
            companyName: 'Test Üretici Firması',
            role: 'uretici',
            firstName: 'Test',
            lastName: 'Üretici'
        },
        {
            email: 'toptanci@videosat.com',
            password: 'test123',
            companyName: 'Test Toptancı Firması',
            role: 'toptanci',
            firstName: 'Test',
            lastName: 'Toptancı'
        },
        {
            email: 'satici@videosat.com',
            password: 'test123',
            companyName: 'Test Satıcı Firması',
            role: 'satici',
            firstName: 'Test',
            lastName: 'Satıcı'
        },
        {
            email: 'musteri@videosat.com',
            password: 'test123',
            companyName: 'Test Müşteri',
            role: 'musteri',
            firstName: 'Test',
            lastName: 'Müşteri'
        },
        {
            email: 'satici1@videosat.com',
            password: 'test123',
            companyName: 'Elektronik Satıcısı',
            role: 'satici',
            firstName: 'Ahmet',
            lastName: 'Yılmaz'
        },
        {
            email: 'satici2@videosat.com',
            password: 'test123',
            companyName: 'Giyim Satıcısı',
            role: 'satici',
            firstName: 'Ayşe',
            lastName: 'Demir'
        },
        {
            email: 'satici3@videosat.com',
            password: 'test123',
            companyName: 'Ev Eşyası Satıcısı',
            role: 'satici',
            firstName: 'Mehmet',
            lastName: 'Kaya'
        }
    ];
    
    try {
        // SHA-256 hash fonksiyonu
        async function sha256(str) {
            const utf8 = new TextEncoder().encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
            return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        
        const users = [];
        
        for (const userData of testUsers) {
            const user = {
                id: Date.now() + Math.random(),
                email: userData.email,
                password: userData.password,
                passwordHash: await sha256(userData.password),
                companyName: userData.companyName,
                role: userData.role,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phone: '+90 555 123 4567',
                address: 'Test Adresi, İstanbul',
                city: 'istanbul',
                sector: userData.role,
                status: 'active',
                createdAt: new Date().toISOString(),
                lastLogin: null
            };
            
            users.push(user);
            console.log(`✅ ${userData.role} kullanıcısı oluşturuldu: ${userData.email}`);
        }
        
        // Kullanıcıları kaydet
        localStorage.setItem('users', JSON.stringify(users));
        console.log('🎉 Tüm test kullanıcıları oluşturuldu!');
        
        return users;
        
    } catch (error) {
        console.error('❌ Test kullanıcıları oluşturma hatası:', error);
        throw error;
    }
}

// Global fonksiyonlar
window.createTestUser = createTestUser;
window.testLogin = testLogin;
window.listAllUsers = listAllUsers;
window.clearAllUsers = clearAllUsers;
window.createAllTestUsers = createAllTestUsers;

console.log('✅ Test User Creator yüklendi');

