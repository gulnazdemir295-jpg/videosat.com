// Satıcı Hesabı Oluştur
// Bu script'i tarayıcı Console'da çalıştır

async function createSaticiAccount() {
    // SHA-256 hash fonksiyonu
    async function sha256(str) {
        const utf8 = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    try {
        const passwordHash = await sha256('satici123');
        
        const newUser = {
            id: Date.now(),
            email: 'satici@videosat.com',
            role: 'satici',
            companyName: 'Test Satıcı Firma',
            phone: '+90 555 123 4567',
            memberNumber: 'SATICI-' + Date.now().toString(36).toUpperCase(),
            createdAt: new Date().toISOString(),
            isActive: true,
            passwordHash: passwordHash
        };
        
        // Mevcut kullanıcıları al
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Satıcıyı ekle (eğer yoksa)
        const exists = users.find(u => u.email === 'satici@videosat.com');
        if (!exists) {
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            console.log('✅ Satıcı hesabı oluşturuldu!');
            console.log('Email:', newUser.email);
            console.log('Şifre: satici123');
        } else {
            console.log('⚠️ Satıcı hesabı zaten var, şifreyi güncelliyorum...');
            users = users.map(u => u.email === 'satici@videosat.com' ? newUser : u);
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        return newUser;
    } catch (e) {
        console.error('❌ Hata:', e);
    }
}

// Çalıştır
createSaticiAccount();

