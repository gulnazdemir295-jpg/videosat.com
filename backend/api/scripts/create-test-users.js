/**
 * Test Kullanıcıları Oluşturma Script'i
 * 
 * Satıcı ve müşteri test kullanıcılarını backend'e kaydeder
 * 
 * Kullanım:
 *   node scripts/create-test-users.js
 *   veya
 *   npm run create-test-users
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const userServiceModule = require('../services/user-service');

// In-memory users map (fallback)
const users = new Map();

// User service'i initialize et
if (userServiceModule.initializeUserService) {
    // DynamoDB client yoksa null geç, in-memory kullanacak
    userServiceModule.initializeUserService(null, users);
}

const userService = {
    getUser: userServiceModule.getUser,
    saveUser: userServiceModule.saveUser
};

// Test kullanıcıları
const testUsers = [
    {
        email: 'satici@videosat.com',
        password: 'test123',
        companyName: 'Test Satıcı Firması',
        role: 'satici',
        firstName: 'Test',
        lastName: 'Satıcı',
        phone: '+90 555 111 2233',
        address: 'Test Adresi, İstanbul',
        city: 'istanbul',
        sector: 'satici',
        status: 'active',
        memberNumber: 'SAT-2024-001'
    },
    {
        email: 'musteri@videosat.com',
        password: 'test123',
        companyName: 'Test Müşteri',
        role: 'musteri',
        firstName: 'Test',
        lastName: 'Müşteri',
        phone: '+90 555 444 5566',
        address: 'Test Adresi, İstanbul',
        city: 'istanbul',
        sector: 'musteri',
        status: 'active',
        memberNumber: 'MUS-2024-001'
    }
];

/**
 * Test kullanıcılarını oluştur
 */
async function createTestUsers() {
    console.log('👥 Test kullanıcıları oluşturuluyor...\n');
    
    try {
        const results = [];
        
        for (const userData of testUsers) {
            try {
                // Kullanıcının zaten var olup olmadığını kontrol et
                const existingUser = await userService.getUser(userData.email);
                
                if (existingUser) {
                    console.log(`⚠️  ${userData.email} zaten mevcut, atlanıyor...`);
                    results.push({ email: userData.email, status: 'exists' });
                    continue;
                }
                
                // Şifreyi hash'le
                const passwordHash = await bcrypt.hash(userData.password, 10);
                
                // Kullanıcı verisi
                const user = {
                    email: userData.email,
                    password: passwordHash,
                    companyName: userData.companyName,
                    role: userData.role,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phone: userData.phone,
                    address: userData.address,
                    city: userData.city,
                    sector: userData.sector,
                    status: userData.status,
                    memberNumber: userData.memberNumber,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                // Kullanıcıyı kaydet
                await userService.saveUser(user);
                
                console.log(`✅ ${userData.role} kullanıcısı oluşturuldu: ${userData.email}`);
                results.push({ email: userData.email, status: 'created' });
                
            } catch (error) {
                console.error(`❌ ${userData.email} oluşturulurken hata:`, error.message);
                results.push({ email: userData.email, status: 'error', error: error.message });
            }
        }
        
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
        
        console.log('📊 Özet:');
        results.forEach(result => {
            const icon = result.status === 'created' ? '✅' : result.status === 'exists' ? '⚠️' : '❌';
            console.log(`   ${icon} ${result.email}: ${result.status}`);
        });
        
        console.log('\n🚀 Artık bu kullanıcılarla giriş yapabilirsiniz!\n');
        
        return results;
        
    } catch (error) {
        console.error('❌ Test kullanıcıları oluşturulurken hata:', error);
        throw error;
    }
}

// Script çalıştırıldığında
if (require.main === module) {
    createTestUsers()
        .then(() => {
            console.log('✅ İşlem tamamlandı');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ İşlem başarısız:', error);
            process.exit(1);
        });
}

module.exports = {
    createTestUsers,
    testUsers
};
