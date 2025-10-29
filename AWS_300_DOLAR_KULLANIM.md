# AWS 300 USD Kredi Kullanım Planı

## 💰 AWS Fast Ramp Credits
- **Kredi:** 300 USD
- **Geçerlilik:** 6 ay
- **Ürün:** AWS IVS (Canlı Video Streaming)

---

## 📊 MALIYET HESAPLAMA

### AWS IVS Fiyatları:
- **Canlı yayın:** $0.035/saat
- **Veri transferi:** $0.09/GB (ilk 1 TB ücretsiz)

### Senaryolar:

#### Senaryo 1: Orta Kullanım (Önerilen)
- **Günlük:** 2 saat yayın
- **Aylık:** 60 saat
- **Maliyet:** $2.10/ay
- **Free Tier:** 750 saat/ay (yeterli!)
- **Kredi kullanımı:** $0/ay
- **Sonuç:** ✅ İlk 6 ay tamamen ücretsiz (kredi kullanmadan)

#### Senaryo 2: Yoğun Kullanım
- **Günlük:** 8 saat yayın
- **Aylık:** 240 saat
- **Maliyet:** $8.40/ay
- **Free Tier:** 750 saat/ay (yeterli!)
- **Kredi kullanımı:** $0/ay
- **Sonuç:** ✅ İlk 6 ay tamamen ücretsiz

#### Senaryo 3: Çok Yoğun Kullanım
- **Günlük:** 20 saat yayın
- **Aylık:** 600 saat
- **Maliyet:** $21.00/ay
- **Free Tier:** 750 saat/ay (yeterli!)
- **Kredi kullanımı:** $0/ay
- **Sonuç:** ✅ İlk 6 ay tamamen ücretsiz

#### Senaryo 4: Maksimum Kullanım
- **Günlük:** 24 saat yayın
- **Aylık:** 720 saat
- **Maliyet:** $25.20/ay
- **Free Tier:** 750 saat/ay (yeterli!)
- **Kredi kullanımı:** $0/ay
- **Sonuç:** ✅ İlk 6 ay tamamen ücretsiz

---

## 🎯 SONUÇ: 300 USD Kredi Neden Kullanılmıyor?

### AWS Free Tier:
- **750 saat/ay** canlı yayın **ÜCRETSİZ**
- İlk 12 ay geçerli
- AWS Fast Ramp Credits ile **birlikte** kullanılabilir

### Önerilen Kullanım:

#### 1. İlk 6 Ay (Kredi Süresi İçinde):
```
✅ AWS Free Tier kullan (750 saat/ay)
✅ 300 USD krediyi kullanma (biriksin)
💰 Maliyet: $0
```

#### 2. 7-12 Ay (Kredi Süresi İçinde):
```
✅ AWS Free Tier biterse (750 saat/ay dolduysa)
✅ 300 USD krediyi kullan başla
💰 Maliyet: Kredi üzerinden (gerçek ödeme yok)
```

#### 3. 13-18 Ay (Kredi Bittikten Sonra):
```
⚠️ AWS Free Tier bitmiş olacak
⚠️ Kredi de bitmiş olacak
💰 Maliyet: Gerçek ödeme gerekli
```

---

## 💡 300 USD Kredi Ne Zaman Kullanılmalı?

### En İyi Strateji:

1. **İlk 6 ay:** Sadece Free Tier kullan (krediyi biriktir)
2. **7-12 ay:** Free Tier varsa hala ücretsiz, yoksa kredi kullan
3. **Kredi birikimi:** 300 USD tamamen birikecek ve sonraki dönemlerde kullanılacak

### Alternatif Strateji (İvedi Test İçin):

1. **Hemen:** IVS'i aktif et
2. **Free Tier + Kredi:** Birlikte kullan
3. **Sonuç:** Fazla kredi kullanımı (gerekli değil)

---

## 📈 GERÇEKÇİ SENARYO

### VideoSat Platformu İçin:

#### Aylık Kullanım:
- **Canlı yayın saatleri:** ~100 saat/ay (ortalama)
- **Free Tier:** 750 saat/ay
- **Aylık maliyet:** $0 (Free Tier içinde)

#### Yıllık Projeksiyon:
- **İlk 12 ay:** $0 (Free Tier)
- **13-18 ay:** $300 (kredi)
- **Toplam 18 ay maliyet:** $0 (ücretsiz!)

---

## 🎬 KURULUM SONRASI

### 1. AWS Console'da İzleme:
```
Services → IVS → Metrics
→ Canlı yayın saatlerini takip et
→ Kredi kullanımını kontrol et
```

### 2. Maliyet Alarmı:
```
Services → CloudWatch → Alarms
→ Billing alarm oluştur
→ $10 (Free Tier limiti)
```

### 3. Auto-Scaling:
```
IVS otomatik ölçekleniyor
→ Manuel ayar gerekmez
→ Sadece kullanımı izle
```

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Free Tier Limiti:**
   - 750 saat/ay
   - Aşılırsa ücretlendirme başlar
   - Kredi otomatik kullanılır

2. **Kredi Geçerliliği:**
   - 6 ay içinde kullanılmalı
   - Kullanılmazsa yanar!

3. **Veri Transferi:**
   - İlk 1 TB ücretsiz
   - 5,000 GB = 5 TB (Free Tier'da ücretsiz)

---

## 🎯 SONUÇ

### VideoSat Platformu İçin:
✅ **İlk 6-12 ay tamamen ücretsiz**
✅ **300 USD kredi yedekte**
✅ **Gerçek canlı yayın yapılabilir**
✅ **AWS IVS entegrasyonu hazır**

### Yapılacaklar:
1. AWS IVS kanalı oluştur
2. Credentials'ları kaydet
3. Frontend'e entegre et
4. Test et!

---

**Hazırlayan:** VideoSat Platform Team  
**Tarih:** 2024  
**Durum:** ✅ AWS kredisi kullanılabilir, Free Tier ile birleştirilebilir

