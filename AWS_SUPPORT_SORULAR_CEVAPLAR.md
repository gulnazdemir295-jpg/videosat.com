# 📝 AWS Support Case - Sorular ve Cevaplar

## ❓ Ekranda Görünen Sorular

AWS Support case oluştururken ödeme yöntemi ile ilgili sorular soruluyor. Bu sorular, case'in daha hızlı çözülmesi için tasarlanmış.

---

## ✅ SORULAR VE CEVAPLAR

### Soru 1: "Have you added a valid credit/debit card as your default payment method?"
**Türkçe:** "Varsayılan ödeme yönteminiz olarak geçerli bir kredi/banka kartı eklediniz mi?"

**Cevap:** **"Evet" (Yes)** ✅
- Adım 1'de payment method kontrolü yaptık
- Eğer kart varsa: "Evet"
- Eğer kart yoksa: Önce kart ekle, sonra "Evet" de

**Nasıl Seçilir:**
- Açılır menüye tıkla
- "Evet" veya "Yes" yaz ve seç
- Veya direkt "Yes" seçeneğini seç

---

### Soru 2: "Have you confirmed the credit/debit card details on file are correct?"
**Türkçe:** "Dosyadaki kredi/banka kartı bilgilerinin doğru olduğunu onayladınız mı?"

**Cevap:** **"Evet" (Yes)** ✅
- Adım 1'de kontrol ettik
- Kart bilgileri doğruysa: "Evet"
- Eğer şüphen varsa: AWS Console'dan tekrar kontrol et

**Nasıl Seçilir:**
- Açılır menüye tıkla
- "Evet" veya "Yes" seç

---

### Soru 3: "Does your credit/debit card have sufficient funds for a $1 temporary authorization charge?"
**Türkçe:** "Kredi/banka kartınızda 1 dolarlık geçici yetkilendirme ücreti için yeterli bakiye var mı?"

**Cevap:** **"Evet" (Yes)** ✅
- AWS genellikle $1 geçici yetkilendirme yapar (geri verilir)
- Kartında yeterli bakiye varsa: "Evet"
- Eğer yoksa: Kartı yükle veya farklı kart dene

**Nasıl Seçilir:**
- Açılır menüye tıkla
- "Evet" veya "Yes" seç

---

### Soru 4: "Have you contacted your bank or tried a different credit/debit card?"
**Türkçe:** "Bankanızla iletişime geçtiniz mi veya farklı bir kredi/banka kartı denediniz mi?"

**Cevap:** **"Hayır" (No)** ❌
- Sorun kart ile ilgili değil, hesap doğrulaması ile ilgili
- IVS pending verification = Hesap doğrulaması sorunu
- Kart çalışıyor, sorun farklı

**Veya:** Eğer kart ile ilgili sorun olduğunu düşünüyorsan: **"Evet"** de

**Nasıl Seçilir:**
- Açılır menüye tıkla
- "Hayır" veya "No" seç

---

## 📋 ADIM ADIM DOLDURMA

### Adım 1: İlk Soruyu Cevapla
1. **İlk soru** açılır menüsüne tıkla
2. **"Yes"** veya **"Evet"** yaz
3. **"Yes"** seçeneğini seç

### Adım 2: İkinci Soruyu Cevapla
1. **İkinci soru** açılır menüsüne tıkla
2. **"Yes"** seç

### Adım 3: Üçüncü Soruyu Cevapla
1. **Üçüncü soru** açılır menüsüne tıkla
2. **"Yes"** seç

### Adım 4: Dördüncü Soruyu Cevapla
1. **Dördüncü soru** açılır menüsüne tıkla
2. **"No"** seç (çünkü sorun kart ile değil, hesap doğrulaması ile ilgili)

---

## ✅ DOĞRU CEVAPLAR ÖZETİ

| Soru | Cevap | Neden |
|------|-------|-------|
| 1. Kart eklendi mi? | **Evet** | Adım 1'de kontrol ettik ✅ |
| 2. Kart bilgileri doğru mu? | **Evet** | Adım 1'de kontrol ettik ✅ |
| 3. Yeterli bakiye var mı? | **Evet** | $1 yetkilendirme için yeterli ✅ |
| 4. Banka ile iletişime geçildi mi? | **Hayır** | Sorun kart değil, hesap doğrulaması ❌ |

---

## 🚨 ÖNEMLİ NOTLAR

### Eğer Kart Yoksa:
1. **Önce kart ekle!** (AWS Console → Payment methods)
2. Sonra bu sorulara "Evet" de
3. Ardından case'i oluştur

### Eğer Kart Bilgileri Yanlışsa:
1. **Önce düzelt!** (AWS Console → Payment methods → Edit)
2. Sonra bu sorulara "Evet" de
3. Ardından case'i oluştur

### Eğer Yeterli Bakiye Yoksa:
1. **Kartı yükle** veya **farklı kart dene**
2. Sonra bu sorulara "Evet" de
3. Ardından case'i oluştur

---

## 📝 SONRAKI ADIMLAR

Bu soruları cevapladıktan sonra:

1. **"İleri" (Next)** veya **"Devam"** butonuna tıkla
2. **Case detaylarını** doldur (önceki rehberdeki gibi)
3. **Case Type:** "Account" seç
4. **Description:** IVS pending verification mesajını yaz
5. **Submit** et

---

## 💡 TAVSİYE

**En iyi yaklaşım:**
- Tüm soruları doğru cevapla
- Sonra case detaylarında asıl sorunu açıkla:
  - "Payment method mevcut ve doğru"
  - "Sorun ödeme değil, AWS IVS hesap doğrulaması"
  - "Pending verification hatası alıyorum"

---

## ✅ ÖZET

**Sorular:**
1. ✅ Kart eklendi mi? → **Evet**
2. ✅ Kart bilgileri doğru mu? → **Evet**
3. ✅ Yeterli bakiye var mı? → **Evet**
4. ❌ Banka ile iletişime geçildi mi? → **Hayır** (sorun farklı)

**Sonra:**
- İleri butonuna tıkla
- Case detaylarını doldur
- Submit et

---

**📞 Soruları cevapladıktan sonra bana haber ver, sonraki adıma geçelim!** 💪


