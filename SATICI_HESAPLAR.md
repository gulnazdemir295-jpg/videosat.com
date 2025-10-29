# Satıcı Test Hesapları

## 📋 Hazır Satıcı Hesapları

### 1. Ana Satıcı Hesabı
**Email:** `satici@videosat.com`  
**Şifre:** `satici123`  
**Firma:** Test Satıcı Firma  
**Role:** satici

### 2. Alternatif Satıcı Hesabı 1
**Email:** `satici1@videosat.com`  
**Şifre:** `satici456`  
**Firma:** Ayakkabı Dünyası  
**Role:** satici

### 3. Alternatif Satıcı Hesabı 2
**Email:** `satici2@videosat.com`  
**Şifre:** `satici789`  
**Firma:** Giyim Mağazası  
**Role:** satici

### 4. Alternatif Satıcı Hesabı 3
**Email:** `tiyatro@videosat.com`  
**Şifre:** `tiyatro123`  
**Firma:** Tiyatro Kıyafetleri  
**Role:** satici

---

## 🔧 Hesap Oluşturma

Bu hesapları oluşturmak için browser console'da çalıştır:

```javascript
async function createSaticiAccounts() {
    async function sha256(str) {
        const utf8 = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    const accounts = [
        { email: 'satici@videosat.com', password: 'satici123', name: 'Test Satıcı Firma' },
        { email: 'satici1@videosat.com', password: 'satici456', name: 'Ayakkabı Dünyası' },
        { email: 'satici2@videosat.com', password: 'satici789', name: 'Giyim Mağazası' },
        { email: 'tiyatro@videosat.com', password: 'tiyatro123', name: 'Tiyatro Kıyafetleri' }
    ];
    
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    
    for (const acc of accounts) {
        const exists = users.find(u => u.email === acc.email);
        if (!exists) {
            const passwordHash = await sha256(acc.password);
            const newUser = {
                id: Date.now() + Math.random(),
                email: acc.email,
                role: 'satici',
                companyName: acc.name,
                phone: '+90 555 ' + Math.floor(Math.random() * 10000),
                memberNumber: 'SATICI-' + Date.now().toString(36).toUpperCase(),
                createdAt: new Date().toISOString(),
                isActive: true,
                passwordHash: passwordHash
            };
            users.push(newUser);
            console.log('✅ Oluşturuldu:', acc.email);
        } else {
            console.log('⚠️ Zaten var:', acc.email);
        }
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    console.log('🎉 Tüm satıcı hesapları hazır!');
}

createSaticiAccounts();
```

---

**Not:** Şifreler SHA-256 ile hash'lenmiş olarak saklanır.

