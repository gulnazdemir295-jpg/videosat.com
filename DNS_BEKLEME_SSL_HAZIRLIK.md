# ⏳ DNS YAYILMA BEKLEME - SSL HAZIRLIK

**Durum:** DNS ayarları yapıldı, yayılma bekleniyor  
**Süre:** 5-10 dakika (bazen 30 dakikaya kadar sürebilir)

---

## ✅ TAMAMLANANLAR

1. ✅ Nginx kuruldu
2. ✅ Nginx config oluşturuldu
3. ✅ Backend proxy çalışıyor
4. ✅ Security Group port 80 açık
5. ✅ DNS A kaydı eklendi
6. ✅ Certbot kuruldu (SSL için)

---

## 🔍 DNS KONTROLÜ

**DNS yayıldığını kontrol etmek için:**

```bash
nslookup api.basvideo.com
```

**VEYA:**

```bash
dig api.basvideo.com
```

**Beklenen:** `107.23.178.153` IP'si görünmeli

---

## ⏱️ OTOMATİK KONTROL SCRIPT'İ

**DNS yayıldı mı kontrol etmek için:**

```bash
# Lokal bilgisayarınızda
while ! nslookup api.basvideo.com | grep -q "107.23.178.153"; do
  echo "DNS henüz yayılmadı, 30 saniye bekliyor..."
  sleep 30
done
echo "✅ DNS yayıldı! IP: $(nslookup api.basvideo.com | grep -A1 'Name:' | tail -1 | awk '{print $2}')"
```

---

## 🔒 SSL SERTİFİKASI (DNS YAYILDIKTAN SONRA)

**DNS yayıldıktan sonra şu komutları çalıştıracağız:**

```bash
# EC2'de
sudo certbot --nginx -d api.basvideo.com
```

**Sorular:**
1. **Email adresi:** Email'inizi girin
2. **Terms of Service:** `A` yazın, Enter
3. **Share email:** `N` yazın, Enter
4. **HTTP to HTTPS redirect:** `2` yazın, Enter

---

## 📋 BEKLEME SÜRESİ

**Tipik DNS yayılma süreleri:**
- **Hızlı:** 5-10 dakika
- **Normal:** 10-30 dakika
- **Yavaş:** 30 dakika - 2 saat (nadir)

**DNS sağlayıcısına göre:**
- **Route 53:** Genellikle 1-5 dakika
- **Cloudflare:** Genellikle 1-5 dakika
- **Diğer sağlayıcılar:** 5-30 dakika

---

## 🧪 TEST

**DNS yayıldıktan sonra test:**

```bash
# 1. DNS kontrolü
nslookup api.basvideo.com

# 2. HTTP test (port 80)
curl http://api.basvideo.com/api/health

# 3. SSL sertifikası al
sudo certbot --nginx -d api.basvideo.com

# 4. HTTPS test
curl https://api.basvideo.com/api/health
```

---

## 🎯 SONRAKI ADIMLAR

**DNS yayıldığında:**
1. ✅ DNS kontrolü yap
2. ✅ HTTP test (port 80)
3. ✅ SSL sertifikası al
4. ✅ HTTPS test
5. ✅ Frontend test

**DNS yayıldı mı kontrol edin ve bana haber verin!** 🚀

---

**Son Güncelleme:** 5 Ocak 2025  
**Durum:** ⏳ DNS yayılması bekleniyor

