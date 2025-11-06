# 🚀 Nginx Kurulumu - Adım Adım

**EC2 IP:** `107.23.178.153`  
**Kullanıcı:** `ubuntu`  
**Key:** `~/Downloads/basvideo-backend-key.pem`

---

## 📋 ADIM 1: EC2'ye Bağlan

**Mac Terminal'de:**

```bash
ssh -i ~/Downloads/basvideo-backend-key.pem ubuntu@107.23.178.153
```

**Beklenen:** `Welcome to Ubuntu...` mesajı

---

## 📋 ADIM 2: Nginx Kurulu mu Kontrol Et

**EC2 terminal'inde:**

```bash
# Nginx kurulu mu?
nginx -v
```

**Eğer "command not found" derse → Nginx kurulu değil, kurmalıyız**

**Eğer versiyon gösterirse → Nginx zaten kurulu ✅**

---

## 📋 ADIM 3: Nginx Kur (Eğer kurulu değilse)

**EC2 terminal'inde:**

```bash
# Paket listesini güncelle
sudo apt update

# Nginx kur
sudo apt install nginx -y

# Nginx durumunu kontrol et
sudo systemctl status nginx
```

**Beklenen:** `active (running)` görünmeli ✅

---

## 📋 ADIM 4: Nginx'i Başlat (Eğer çalışmıyorsa)

**EC2 terminal'inde:**

```bash
# Nginx'i başlat
sudo systemctl start nginx

# Nginx'i otomatik başlatmayı etkinleştir (reboot sonrası)
sudo systemctl enable nginx

# Durum kontrolü
sudo systemctl status nginx
```

**Beklenen:** `active (running)` ✅

---

## 📋 ADIM 5: Port 80 Kontrolü

**EC2 terminal'inde:**

```bash
# Port 80 dinleniyor mu?
sudo netstat -tlnp | grep :80
# VEYA
sudo ss -tlnp | grep :80
```

**Beklenen:** Port 80 `LISTEN` durumunda ✅

---

## 📋 ADIM 6: Security Group Kontrolü (AWS Console)

**AWS Console'dan:**
1. EC2 → Security Groups
2. `basvideo-backend-sg` (veya ilgili security group) seçin
3. **Inbound rules** → **Edit inbound rules**
4. Şu kurallar var mı kontrol edin:
   - **HTTP (80)**: Source: `0.0.0.0/0` ✅
   - **HTTPS (443)**: Source: `0.0.0.0/0` ✅

**Eğer yoksa ekleyin!**

---

## 📋 ADIM 7: Nginx Test (Tarayıcıdan)

**Tarayıcıda açın:**
```
http://107.23.178.153
```

**Beklenen:** Nginx "Welcome to nginx!" sayfası ✅

---

## ✅ SONRAKİ ADIM: Nginx Config

Nginx kurulduktan sonra backend için config yapacağız.

---

**🚀 EC2'ye bağlandınız mı? Nginx kurulu mu kontrol edin!**

