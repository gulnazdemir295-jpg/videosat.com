# 🔗 Müşteri Takip Sistemi - Doğru Hiyerarşi

## 📅 Oluşturulma Tarihi: 2024
## 👤 Geliştirici: VideoSat Platform Team

---

## 🎯 DOĞRU TAKİP HİYERAŞİSİ

```
Hammaddeci (En Üst)
    ↓ (Kimseyi takip etmez)
    ↓ Müşterileri: Üreticiler
    
Üreticiler
    ↓ Takip eder: Hammaddeci
    ↓ Müşterileri: Toptancılar
    
Toptancılar
    ↓ Takip eder: Üreticiler
    ↓ Müşterileri: Satıcılar
    
Satıcılar
    ↓ Takip eder: Toptancılar
    ↓ Müşterileri: Müşteriler
    
Müşteriler (En Alt)
    ↓ Takip eder: Satıcılar
    ↓ Müşterileri: YOK (Final consumer)
```

---

## 📋 DETAYLI HİYERAŞİ

### 1️⃣ HAMMADECİ

**Rol:** Tedarikçi  
**Takip Ettiği:** YOK (Kimseyi takip etmez)  
**Müşterileri (Takipçileri):** Üreticiler

**Özellikler:**
- Kimseyi takip etmez
- Canlı yayın başlatır
- Üreticilere canlı yayına davet gönderir
- "Takipçilerim" bölümünde üreticileri görür

---

### 2️⃣ ÜRETİCİ

**Rol:** İmalatçı  
**Takip Ettiği:** Hammaddeci  
**Müşterileri (Takipçileri):** Toptancılar

**Özellikler:**
- Hammaddeciyi takip eder
- Hammaddecinin canlı yayınlarını izler
- Canlı yayın başlatır
- Toptancılara canlı yayına davet gönderir
- "Takipçilerim" bölümünde toptancıları görür

**Panel Bölümleri:**
- "Hammadeciler" → Hammaddeci listesi, "Takip Et" butonu
- "Canlı Yayınlar" → Hammaddecinin canlı yayınları
- "Takipçilerim" → Toptancılar listesi

---

### 3️⃣ TOPLANCI

**Rol:** Toptan Satıcı  
**Takip Ettiği:** Üreticiler  
**Müşterileri (Takipçileri):** Satıcılar

**Özellikler:**
- Üreticileri takip eder
- Üreticinin canlı yayınlarını izler
- Canlı yayın başlatır
- Satıcılara canlı yayına davet gönderir
- "Takipçilerim" bölümünde satıcıları görür

**Panel Bölümleri:**
- "Üreticiler" → Üretici listesi, "Takip Et" butonu
- "Canlı Yayınlar" → Üreticinin canlı yayınları
- "Takipçilerim" → Satıcılar listesi

---

### 4️⃣ SATICI

**Rol:** Perakende Satıcı  
**Takip Ettiği:** Toptancılar  
**Müşterileri (Takipçileri):** Müşteriler

**Özellikler:**
- Toptancıları takip eder
- Toptancının canlı yayınlarını izler
- Canlı yayın başlatır
- Müşterilere canlı yayına davet gönderir
- "Takipçilerim" bölümünde müşterileri görür

**Panel Bölümleri:**
- "Toptancılar" → Toptancı listesi, "Takip Et" butonu
- "Canlı Yayınlar" → Toptancının canlı yayınları
- "Takipçilerim" → Müşteriler listesi

---

### 5️⃣ MÜŞTERİ

**Rol:** Son Tüketici  
**Takip Ettiği:** Satıcılar  
**Müşterileri (Takipçileri):** YOK

**Özellikler:**
- Satıcıları takip eder
- Satıcının canlı yayınlarını izler
- Canlı yayın başlatmaz
- Sadece satın alma yapar

**Panel Bölümleri:**
- "Satıcılar" → Satıcı listesi, "Takip Et" butonu
- "Canlı Yayınlar" → Satıcının canlı yayınları
- "Takip Ettiğim Firmalar" → Takip listesi

---

## 🔄 İŞ AKIŞI

### Senaryo 1: Hammaddeci → Üretici

1. **Hammaddeci:**
   - Canlı yayın başlatır
   - Üreticilere davet gönderir

2. **Üretici:**
   - Hammaddeciyi takip eder (Already followed)
   - Canlı yayın bildirimi alır
   - Yayına katılır
   - Ürün satın alır

---

### Senaryo 2: Üretici → Toptancı

1. **Üretici:**
   - Canlı yayın başlatır
   - Toptancılara davet gönderir

2. **Toptancı:**
   - Üreticiyi takip eder (Already followed)
   - Canlı yayın bildirimi alır
   - Yayına katılır
   - Ürün toptan satın alır

---

### Senaryo 3: Toptancı → Satıcı

1. **Toptancı:**
   - Canlı yayın başlatır
   - Satıcılara davet gönderir

2. **Satıcı:**
   - Toptancıyı takip eder (Already followed)
   - Canlı yayın bildirimi alır
   - Yayına katılır
   - Ürün satın alır

---

### Senaryo 4: Satıcı → Müşteri

1. **Satıcı:**
   - Canlı yayın başlatır
   - Müşterilere davet gönderir

2. **Müşteri:**
   - Satıcıyı takip eder (Already followed)
   - Canlı yayın bildirimi alır
   - Yayına katılır
   - Ürün satın alır

---

## 📊 "TAKİPÇİLERİM" BÖLÜMÜ

### Her Panelde "Takipçilerim" Bölümü:

**Hammaddeci:**  
- Göreceği: Üreticiler (Müşterileri)
- Yapabileceği: Üreticileri yayına davet etme

**Üretici:**  
- Göreceği: Toptancılar (Müşterileri)
- Yapabileceği: Toptancıları yayına davet etme

**Toptancı:**  
- Göreceği: Satıcılar (Müşterileri)
- Yapabileceği: Satıcıları yayına davet etme

**Satıcı:**  
- Göreceği: Müşteriler (Müşterileri)
- Yapabileceği: Müşterileri yayına davet etme

**Müşteri:**  
- "Takipçilerim" bölümü YOK
- "Takip Ettiğim Firmalar" bölümü var

---

## 🎯 GEREKLI DEĞİŞİKLİKLER

### 1. Hammaddeci Panel
- [x] "Takipçilerim" bölümü var
- [x] "Takip Ettiğim" bölümü olmamalı (kimseyi takip etmez)
- [x] Üreticilere yayına davet gönderebilir

### 2. Üretici Panel
- [x] "Hammadeciler" bölümü var
- [ ] Hammaddecilere "Takip Et" butonu eklenmeli
- [x] "Canlı Yayınlar" bölümü olmalı (Hammaddecilerin yayınları)
- [x] "Takipçilerim" bölümü var (Toptancılar)

### 3. Toptancı Panel
- [ ] "Üreticiler" bölümünde "Takip Et" butonu eklenmeli
- [ ] "Canlı Yayınlar" bölümü eklenmeli (Üreticilerin yayınları)
- [x] "Takipçilerim" bölümü var (Satıcılar)

### 4. Satıcı Panel
- [ ] "Toptancılar" bölümünde "Takip Et" butonu eklenmeli
- [ ] "Canlı Yayınlar" bölümü eklenmeli (Toptancıların yayınları)
- [x] "Takipçilerim" bölümü var (Müşteriler)

### 5. Müşteri Panel
- [x] "Satıcılar" bölümü var
- [ ] Satıcılara "Takip Et" butonu eklenmeli
- [x] "Canlı Yayınlar" bölümü var (Satıcıların yayınları)
- [x] "Takip Ettiğim Firmalar" bölümü var

---

## 🔄 TAKİP SİSTEMİ AKIŞI

### Bir Şirket Diğerini Takip Ettiğinde:

1. **Takip ilişkisi oluşturulur:**
   - Follow service'e kaydedilir
   - Takip eden → Takip edilen listesine eklenir

2. **Canlı yayın bildirimleri:**
   - Takip edilen firma yayın başlatınca
   - Takip edenlere bildirim gönderilir

3. **Canlı yayın listesi:**
   - Takip edilen firmanın yayınları listelenir
   - "Canlı Yayınlar" bölümünde görünür

---

## 📋 TEST SENARYOSU

### Adım 1: Hammaddeci - Canlı Yayın Başlatır
1. Hammaddeci olarak giriş yap
2. Canlı yayın başlat
3. Aktif yayın ID'sini not et

### Adım 2: Üretici - Hammaddeciyi Takip Eder
1. Üretici olarak giriş yap
2. "Hammadeciler" bölümüne git
3. Bir hammaddeciyi "Takip Et"
4. "Takip Edildi" bildirimi alınır

### Adım 3: Üretici - Hammaddecinin Canlı Yayınını Görür
1. "Canlı Yayınlar" bölümüne git
2. Hammaddecinin aktif yayını görünür
3. "Yayına Katıl" butonuna tıkla
4. Yayına katılırsın

### Adım 4: Üretici - Toptancıları Takipçi Olarak Görür
1. "Takipçilerim" bölümüne git
2. Sadece Toptancıları görür (üretici değil)
3. Toptancıları yayına davet edebilir

---

## ✅ ÖZET

**Takip Akışı:**
- Hammaddeci → Kimseyi takip etmez
- Üretici → Hammaddeciyi takip eder
- Toptancı → Üreticiyi takip eder
- Satıcı → Toptancıyı takip eder
- Müşteri → Satıcıyı takip eder

**Müşteri İlişkisi:**
- Hammaddeci'nin müşterisi: Üretici
- Üretici'nin müşterisi: Toptancı
- Toptancı'nın müşterisi: Satıcı
- Satıcı'nın müşterisi: Müşteri
- Müşteri'nin müşterisi: YOK (Final consumer)

**Takipçilerim Bölümü:**
- Her firma, kendi müşterilerini "Takipçilerim" bölümünde görür
- Müşterilere canlı yayına davet gönderebilir

---

**Son Güncelleme:** 2024  
**Versiyon:** 1.0  
**Geliştirici:** VideoSat Platform Team

