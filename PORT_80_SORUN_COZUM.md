# 🔧 Port 80 Sorunu Çözümü - Certbot Timeout

**Sorun:** `Timeout during connect (likely firewall problem)`

Let's Encrypt sunucuları port 80'e bağlanamıyor.

---

## 🔍 KONTROL ADIMLARI

### 1. Port 80 Dinleniyor mu?

**EC2 terminal'inde:**

```bash
sudo netstat -tlnp | grep :80
# VEYA
sudo ss -tlnp | grep :80
```

**Beklenen:** Port 80 `LISTEN` durumunda ve `nginx` process'i görünmeli

---

### 2. Nginx Port 80'de Çalışıyor mu?

**EC2 terminal'inde:**

```bash
curl -I http://localhost
```

**Beklenen:** `HTTP/1.1 200 OK` veya benzeri

---

### 3. UFW (Firewall) Durumu?

**EC2 terminal'inde:**

```bash
sudo ufw status
```

**Beklenen:** `Status: inactive` (kapalı olmalı)

**Eğer aktifse:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

### 4. Dışarıdan Erişilebilir mi?

**EC2 terminal'inde:**

```bash
curl -I http://107.23.178.153
```

**Beklenen:** `HTTP/1.1 200 OK` veya benzeri

**Eğer hata verirse → Security Group ayarları kontrol edilmeli**

---

## 🔐 AWS SECURITY GROUP KONTROLÜ

**AWS Console'dan:**

1. EC2 → Security Groups
2. `basvideo-backend-sg` (veya ilgili security group) seçin
3. **Inbound rules** → **Edit inbound rules**
4. Şu kurallar OLMALI:
   - **HTTP (80)**: 
     - Type: HTTP
     - Protocol: TCP
     - Port: 80
     - Source: 0.0.0.0/0
   - **HTTPS (443)**:
     - Type: HTTPS
     - Protocol: TCP
     - Port: 443
     - Source: 0.0.0.0/0

**Eğer yoksa EKLEYİN!**

---

## 🧪 TEST KOMUTLARI

**Mac Terminal'den (dışarıdan test):**

```bash
# Port 80 test
curl -I http://107.23.178.153

# Domain test
curl -I http://api.basvideo.com

# ACME challenge test
curl -I http://api.basvideo.com/.well-known/acme-challenge/test
```

**Beklenen:** Hepsi `200 OK` dönmeli

---

## ✅ ÇÖZÜM ADIMLARI

1. **Port 80 kontrolü yapın** (yukarıdaki komutlar)
2. **Security Group'da port 80 açık mı kontrol edin** (AWS Console)
3. **UFW kapalı mı kontrol edin**
4. **Dışarıdan erişilebilir mi test edin**
5. **Certbot'u tekrar çalıştırın:**

```bash
sudo certbot --nginx -d api.basvideo.com
```

---

## ⚠️ ÖNEMLİ NOTLAR

- Port 80 **MUTLAKA** açık olmalı (Security Group)
- UFW **KAPALI** olmalı (veya port 80'e izin vermeli)
- Nginx **PORT 80'DE** dinlemeli
- Domain **DNS A KAYDI** doğru olmalı (api.basvideo.com → 107.23.178.153)

---

**🚀 Kontrolleri yapın ve sonuçları paylaşın!**

