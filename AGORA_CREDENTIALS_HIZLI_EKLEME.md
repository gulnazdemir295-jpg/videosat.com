# 🚀 Agora Credentials Hızlı Ekleme

**Tarih:** 6 Kasım 2025  
**Durum:** ⚠️ Agora App ID ve Certificate gerekli

---

## ⚡ HIZLI ADIMLAR

### 1. Agora.io Console'a Gidin
**URL:** https://console.agora.io/

### 2. Proje Oluşturun veya Mevcut Projeyi Seçin
- **Projects** → **Create Project**
- **Project Name:** `basvideo-live-streaming`
- **Scenario:** Live Streaming
- **Submit**

### 3. App ID ve Certificate Kopyalayın
- Proje detay sayfasında:
  - **App ID:** Kopyalayın (32 karakter)
  - **Primary Certificate:** Generate → Show → Kopyalayın (32 karakter)

### 4. Bana Paylaşın
- **App ID:** `...`
- **App Certificate:** `...`

Ben sizin için EC2'deki .env dosyasını güncelleyeceğim!

---

## 📋 ALTERNATİF: Kendiniz Ekleyin

EC2 Terminal'inde:

```bash
nano /home/ubuntu/api/.env
```

Şu satırları güncelleyin:
```env
AGORA_APP_ID=GERÇEK_APP_ID_BURAYA
AGORA_APP_CERTIFICATE=GERÇEK_CERTIFICATE_BURAYA
```

Kaydet: `Ctrl+X` → `Y` → `Enter`

Backend'i yeniden başlat:
```bash
pm2 restart basvideo-backend
```

---

**Son Güncelleme:** 6 Kasım 2025, 10:27 UTC

