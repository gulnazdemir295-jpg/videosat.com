/**
 * Test Kullanıcılarını Otomatik Oluşturma Script'i
 * Bu script'i tarayıcı konsolunda çalıştırarak test hesaplarını oluşturabilirsiniz
 */

async function sha256(str) {
    const utf8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function setupTestUsers() {
    const password = 'test123';
    const passwordHash = await sha256(password);
    
    const testUsers = [
        {
            id: 1001,
            email: 'hammaddeci@videosat.com',
            role: 'hammaddeci',
            companyName: 'Test Hammadeci Firması',
            phone: '+90 555 100 1001',
            memberNumber: 'HMM-2024-001',
            createdAt: new Date().toISOString(),
            isActive: true,
            passwordHash: passwordHash
        },
        {
            id: 1002,
            email: 'uretici@videosat.com',
            role: 'uretici',
            companyName: 'Test Üretici Firması',
            phone: '+90 555 200 2002',
            memberNumber: 'URT-2024-001',
            createdAt: new Date().toISOString(),
            isActive: true,
            passwordHash: passwordHash
        },
        {
            id: 1003,
            email: 'toptanci@videosat.com',
            role: 'toptanci',
            companyName: 'Test Toptancı Firması',
            phone: '+90 555 300 3003',
            memberNumber: 'TOP-2024-001',
            createdAt: new Date().toISOString(),
            isActive: true,
            passwordHash: passwordHash
        }
    ];
    
    // Mevcut kullanıcıları al
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Test kullanıcılarını ekle (mevcutları güncelle)
    testUsers.forEach(testUser => {
        // Eğer kullanıcı varsa, güncelle; yoksa ekle
        const existingIndex = users.findIndex(u => u.email === testUser.email);
        if (existingIndex >= 0) {
            users[existingIndex] = testUser;
        } else {
            users.push(testUser);
        }
    });
    
    // localStorage'a kaydet
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log('✅ Test kullanıcıları başarıyla oluşturuldu!');
    console.log('\n📋 GİRİŞ BİLGİLERİ:');
    console.log('\n1️⃣ HAMMADDECİ:');
    console.log('   📧 E-posta: hammaddeci@videosat.com');
    console.log('   🔑 Şifre: test123');
    console.log('\n2️⃣ ÜRETİCİ:');
    console.log('   📧 E-posta: uretici@videosat.com');
    console.log('   🔑 Şifre: test123');
    console.log('\n3️⃣ TOPTANCI:');
    console.log('   📧 E-posta: toptanci@videosat.com');
    console.log('   🔑 Şifre: test123');
    console.log('\n🚀 Artık giriş yapabilirsiniz!');
    
    return users;
}

// Tarayıcıda çalıştırmak için
if (typeof window !== 'undefined') {
    window.setupTestUsers = setupTestUsers;
    console.log('💡 Test kullanıcılarını oluşturmak için konsolda şunu çalıştırın:');
    console.log('   setupTestUsers()');
}

