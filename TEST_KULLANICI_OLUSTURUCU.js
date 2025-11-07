/**
 * Test Kullanıcı Oluşturucu
 * 
 * Satıcı ve müşteri test kullanıcılarını kolayca oluşturur
 */

// Test Kullanıcıları Oluştur
async function createTestUsers() {
    console.log('👥 Test kullanıcıları oluşturuluyor...');
    
    try {
        // SHA-256 hash fonksiyonu
        async function sha256(str) {
            const utf8 = new TextEncoder().encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
            return Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }
        
        const password = 'test123';
        const passwordHash = await sha256(password);
        
        // Test kullanıcıları
        const testUsers = [
            {
                // SATICI
                id: Date.now(),
                email: 'satici@videosat.com',
                password: password,
                passwordHash: passwordHash,
                companyName: 'Test Satıcı Firması',
                role: 'satici',
                firstName: 'Test',
                lastName: 'Satıcı',
                phone: '+90 555 111 2233',
                address: 'Test Adresi, İstanbul',
                city: 'istanbul',
                sector: 'satici',
                status: 'active',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                memberNumber: 'SAT-2024-001'
            },
            {
                // MÜŞTERİ
                id: Date.now() + 1,
                email: 'musteri@videosat.com',
                password: password,
                passwordHash: passwordHash,
                companyName: 'Test Müşteri',
                role: 'musteri',
                firstName: 'Test',
                lastName: 'Müşteri',
                phone: '+90 555 444 5566',
                address: 'Test Adresi, İstanbul',
                city: 'istanbul',
                sector: 'musteri',
                status: 'active',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                memberNumber: 'MUS-2024-001'
            }
        ];
        
        // Mevcut kullanıcıları al
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Test kullanıcılarını ekle/güncelle
        testUsers.forEach(testUser => {
            const existingIndex = users.findIndex(u => u.email === testUser.email);
            if (existingIndex >= 0) {
                users[existingIndex] = testUser;
                console.log(`✅ ${testUser.role} kullanıcısı güncellendi: ${testUser.email}`);
            } else {
                users.push(testUser);
                console.log(`✅ ${testUser.role} kullanıcısı oluşturuldu: ${testUser.email}`);
            }
        });
        
        // Kullanıcıları kaydet
        localStorage.setItem('users', JSON.stringify(users));
        
        // Sonuçları göster
        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║          ✅ TEST KULLANICILARI OLUŞTURULDU                    ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');
        
        console.log('📦 SATICI (Seller)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   📧 E-posta: satici@videosat.com');
        console.log('   🔑 Şifre:   test123');
        console.log('   🏢 Şirket:  Test Satıcı Firması\n');
        
        console.log('🛒 MÜŞTERİ (Customer)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   📧 E-posta: musteri@videosat.com');
        console.log('   🔑 Şifre:   test123');
        console.log('   🏢 Şirket:  Test Müşteri\n');
        
        console.log('🚀 Artık giriş yapabilirsiniz!\n');
        
        return testUsers;
        
    } catch (error) {
        console.error('❌ Test kullanıcıları oluşturma hatası:', error);
        throw error;
    }
}

// Backend'e de kaydet (eğer backend varsa)
async function createTestUsersInBackend() {
    console.log('🔄 Backend\'e test kullanıcıları kaydediliyor...');
    
    try {
        const testUsers = [
            {
                email: 'satici@videosat.com',
                password: 'test123',
                companyName: 'Test Satıcı Firması',
                role: 'satici',
                firstName: 'Test',
                lastName: 'Satıcı',
                phone: '+90 555 111 2233'
            },
            {
                email: 'musteri@videosat.com',
                password: 'test123',
                companyName: 'Test Müşteri',
                role: 'musteri',
                firstName: 'Test',
                lastName: 'Müşteri',
                phone: '+90 555 444 5566'
            }
        ];
        
        // Backend URL'ini al
        const backendURL = typeof getAPIBaseURL === 'function' 
            ? getAPIBaseURL() 
            : 'http://localhost:3000';
        
        for (const userData of testUsers) {
            try {
                const response = await fetch(`${backendURL}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                if (response.ok) {
                    console.log(`✅ Backend: ${userData.role} kullanıcısı oluşturuldu: ${userData.email}`);
                } else {
                    const errorData = await response.text();
                    console.warn(`⚠️ Backend: ${userData.email} zaten mevcut veya hata: ${errorData}`);
                }
            } catch (error) {
                console.warn(`⚠️ Backend kayıt hatası (${userData.email}):`, error.message);
            }
        }
        
        console.log('✅ Backend kayıt işlemi tamamlandı\n');
        
    } catch (error) {
        console.warn('⚠️ Backend kayıt işlemi atlandı:', error.message);
    }
}

// Tüm test kullanıcılarını oluştur (hem localStorage hem backend)
async function setupAllTestUsers() {
    console.log('🚀 Tüm test kullanıcıları oluşturuluyor...\n');
    
    // localStorage'a kaydet
    await createTestUsers();
    
    // Backend'e de kaydet (opsiyonel)
    await createTestUsersInBackend();
    
    console.log('🎉 İşlem tamamlandı!');
}

// Global fonksiyonlar
if (typeof window !== 'undefined') {
    window.createTestUsers = createTestUsers;
    window.createTestUsersInBackend = createTestUsersInBackend;
    window.setupAllTestUsers = setupAllTestUsers;
    
    console.log('✅ Test Kullanıcı Oluşturucu yüklendi');
    console.log('💡 Kullanım:');
    console.log('   - await createTestUsers() - Sadece localStorage');
    console.log('   - await setupAllTestUsers() - localStorage + Backend');
}

// Node.js ortamında da çalışabilir
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createTestUsers,
        createTestUsersInBackend,
        setupAllTestUsers
    };
}

