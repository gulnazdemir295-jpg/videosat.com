# Agora.io Certificate - Hangisini Kullanmalıyım?

## 🔍 Durumunuz

Agora.io Console'da **2 sertifika** görüyorsunuz:
- **Birincil Sertifika** (Primary Certificate)
- **İkincil Sertifika** (Secondary Certificate)

---

## ✅ Hangi Sertifikayı Kullanmalısınız?

### **BİRİNCİL (PRIMARY) SERTİFİKAYI KULLANIN!**

**Neden?**
- Sistemimiz şu anda tek bir App Certificate kullanıyor
- Primary Certificate, aktif olarak kullanılan sertifikadır
- Secondary Certificate genellikle yedek/backup amaçlıdır

---

## 📋 .env Dosyasına Eklerken

**Sadece Primary (Birincil) Certificate'ı ekleyin:**

```env
AGORA_APP_ID=aa3d1234567890abcdef...
AGORA_APP_CERTIFICATE=buraya_birincil_certificate_yapistirin
STREAM_PROVIDER=AGORA
PORT=3000
```

---

## ⚠️ Önemli Notlar

1. **İkincil Sertifika**: Şimdilik kullanmıyoruz, güvenli bir yere kaydedin
2. **Birincil Sertifika**: `.env` dosyasına ekleyeceğiniz sertifika bu
3. **App ID**: Zaten kopyaladınız, onu da ekleyin

---

## 🎯 Şimdi Yapmanız Gerekenler

1. **Birincil (Primary) Certificate'ı** kopyalayın
2. **İkincil (Secondary) Certificate'ı** bir yere kaydedin (yedek için)
3. `.env` dosyasına sadece **Birincil Certificate'ı** ekleyin

---

**Özet**: `.env` dosyasına **sadece BİRİNCİL (PRIMARY) Certificate'ı** ekleyin! ✅

