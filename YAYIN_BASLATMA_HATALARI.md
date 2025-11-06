# 🎬 Yayın Başlatma Hataları - Detaylı Liste

## 📋 Genel Bakış

Bu dokümanda yayın başlatma sürecinde oluşabilecek **tüm hatalar** adım adım listelenmiştir.

---

## 🔴 1. Pre-Start Kontrolleri (Başlatma Öncesi)

### 1.1. Kamera Erişimi Yok
```javascript
Error: Kamera erişimi yok. Önce kamera erişimi isteyiniz!
```

**Sebep**: 
- `localStream` null veya undefined
- Kamera erişimi alınmamış
- Kullanıcı önce kamera erişimi istememiş

**Çözüm**:
- ✅ Kod zaten kontrol ediyor
- Kullanıcıya kamera erişimi iste butonuna tıklaması için talimat ver

**Kod**:
```javascript
// live-stream.js - Zaten kontrol var
if (!localStream) {
    const confirmResult = confirm('Kamera erişimi yok. Önce kamera erişimi isteyiniz!');
    if (confirmResult) {
        await requestCameraAccess();
    }
    return;
}
```

---

### 1.2. Video Track Bulunamadı
```javascript
Error: Video track bulunamadı. Lütfen kamera erişimini tekrar deneyin.
```

**Sebep**:
- `localStream.getVideoTracks().length === 0`
- Video track dispose edilmiş
- Kamera çalışmıyor

**Çözüm**:
- ✅ Kod zaten kontrol ediyor
- Kamera erişimini tekrar iste

**Kod**:
```javascript
// live-stream.js - Zaten kontrol var
if (videoTracks.length === 0) {
    alert('Video track bulunamadı. Lütfen kamera erişimini tekrar deneyin.');
    await requestCameraAccess();
    return;
}
```

---

### 1.3. Yayın Zaten Aktif
```javascript
Warning: Yayın zaten aktif
```

**Sebep**:
- `isStreaming === true`
- Önceki yayın durdurulmamış

**Çözüm**:
- ✅ Kod zaten kontrol ediyor
- Önce yayını durdur

**Kod**:
```javascript
// live-stream.js - Zaten kontrol var
if (isStreaming) {
    console.warn('Yayın zaten aktif');
    updateStatus('Yayın zaten aktif!');
    return;
}
```

---

## 🔴 2. Backend İletişim Hataları

### 2.1. Backend Connection Failed
```javascript
Error: Backend yanıt vermedi (500): Internal Server Error
Error: Backend yanıt vermedi (404): Not Found
Error: Backend yanıt vermedi (503): Service Unavailable
```

**Sebep**:
- Backend server down
- Network hatası
- Backend endpoint yanlış
- CORS hatası

**Çözüm**:
- Backend server durumunu kontrol et
- Network bağlantısını kontrol et
- Backend URL'ini kontrol et
- CORS ayarlarını kontrol et

**Kod**:
```javascript
// live-stream.js
const response = await fetch(`${getAPIBaseURL()}/rooms/${roomId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({...})
});

if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend yanıt vermedi (${response.status}): ${errorText}`);
}
```

---

### 2.2. Backend Timeout
```javascript
Error: Network timeout
TypeError: Failed to fetch
```

**Sebep**:
- Backend yanıt vermiyor
- Network yavaş
- Request timeout

**Çözüm**:
- Backend server durumunu kontrol et
- Network bağlantısını kontrol et
- Timeout süresini artır

---

### 2.3. Backend Response Invalid
```javascript
Error: Channel oluşturulamadı
Error: Channel ID alınamadı
```

**Sebep**:
- Backend response formatı yanlış
- `data.ok === false`
- `data.channelId` yok

**Çözüm**:
- Backend response formatını kontrol et
- Backend log'larını kontrol et
- Error detail'leri kontrol et

**Kod**:
```javascript
// live-stream.js - Zaten kontrol var
if (!data.ok) {
    throw new Error(data.error || 'Channel oluşturulamadı');
}

if (!data.channelId) {
    throw new Error('Channel ID alınamadı');
}
```

---

### 2.4. Backend Provider Hatası
```javascript
Error: Beklenmeyen provider: AWS_IVS. Backend AGORA kullanmalı.
```

**Sebep**:
- Backend'de `STREAM_PROVIDER !== 'AGORA'`
- Backend AWS IVS kullanıyor
- Provider yanlış yapılandırılmış

**Çözüm**:
- Backend'de `STREAM_PROVIDER=AGORA` set et
- Backend environment variables'ı kontrol et

**Kod**:
```javascript
// live-stream.js - Zaten kontrol var
if (data.provider === 'AGORA') {
    await startAgoraStream(data);
} else {
    throw new Error(`Beklenmeyen provider: ${data.provider}. Backend AGORA kullanmalı.`);
}
```

---

## 🔴 3. Agora SDK Hataları

### 3.1. Agora SDK Yüklenmedi
```javascript
Error: Agora SDK yüklenmedi
TypeError: Cannot read property 'createClient' of undefined
```

**Sebep**:
- Agora SDK script'i yüklenmemiş
- Script yolu yanlış
- Network hatası

**Çözüm**:
- Agora SDK script'ini HTML'e ekle
- Script yüklenene kadar bekle

**Kod**:
```javascript
// live-stream.js - Zaten kontrol var
if (!AgoraRTC) {
    throw new Error('Agora SDK yüklenmedi');
}
```

---

### 3.2. Agora Client Oluşturulamadı
```javascript
Error: Agora client oluşturulamadı
```

**Sebep**:
- Agora SDK hatası
- Browser WebRTC desteklemiyor
- SDK versiyon uyumsuzluğu

**Çözüm**:
- Agora SDK versiyonunu kontrol et
- Browser WebRTC desteğini kontrol et
- Modern browser kullan

**Kod**:
```javascript
// live-stream.js
agoraClient = AgoraRTC.createClient({ 
    mode: 'live', 
    codec: 'vp8' 
});
```

---

### 3.3. Agora Join Failed
```javascript
Error: Join channel failed
AgoraRTCError: ...
```

**Sebep**:
- Invalid token
- Invalid channel name
- Invalid App ID
- Network hatası

**Çözüm**:
- Token'ı kontrol et
- Channel name'i kontrol et
- App ID'yi kontrol et
- Network bağlantısını kontrol et

**Kod**:
```javascript
// live-stream.js - Zaten kontrol var
if (!channelData.appId || channelData.appId.length !== 32) {
    throw new Error(`Geçersiz App ID: ${channelData.appId}. App ID 32 karakter olmalı.`);
}

joinedUid = await agoraClient.join(
    channelData.appId,
    channelData.channelName,
    token,
    uid || null
);
```

---

### 3.4. Client Role Set Failed
```javascript
Warning: Client role set edilemedi
```

**Sebep**:
- Client role API hatası
- Already joined
- Permission hatası

**Çözüm**:
- ✅ Warning olarak handle ediliyor
- Yayın devam eder (role olmadan da çalışabilir)

**Kod**:
```javascript
// live-stream.js - Zaten handle ediliyor
try {
    await agoraClient.setClientRole('host');
} catch (roleError) {
    console.warn('⚠️ Client role set edilemedi (devam ediliyor):', roleError);
}
```

---

## 🔴 4. Media Track Hataları

### 4.1. Video Track Oluşturulamadı
```javascript
Error: Video track yayınlanamadı: ...
```

**Sebep**:
- `AgoraRTC.createCustomVideoTrack` başarısız
- Video track dispose edilmiş
- MediaStreamTrack hatası

**Çözüm**:
- Video track'in hazır olduğundan emin ol
- Track'i tekrar oluştur
- Kamera erişimini kontrol et

**Kod**:
```javascript
// live-stream.js
try {
    agoraTracks.videoTrack = await AgoraRTC.createCustomVideoTrack({
        mediaStreamTrack: videoTrack
    });
    await agoraClient.publish([agoraTracks.videoTrack]);
} catch (videoError) {
    throw new Error(`Video track yayınlanamadı: ${videoError.message}`);
}
```

---

### 4.2. Audio Track Oluşturulamadı
```javascript
Error: Audio track yayınlanamadı: ...
```

**Sebep**:
- `AgoraRTC.createCustomAudioTrack` başarısız
- Audio track dispose edilmiş
- MediaStreamTrack hatası

**Çözüm**:
- Audio track'in hazır olduğundan emin ol
- Track'i tekrar oluştur
- Mikrofon erişimini kontrol et

**Kod**:
```javascript
// live-stream.js
try {
    agoraTracks.audioTrack = await AgoraRTC.createCustomAudioTrack({
        mediaStreamTrack: audioTrack
    });
    await agoraClient.publish([agoraTracks.audioTrack]);
} catch (audioError) {
    throw new Error(`Audio track yayınlanamadı: ${audioError.message}`);
}
```

---

### 4.3. Publish Failed
```javascript
Error: Publish failed
AgoraRTCError: PUBLISH_FAILED
```

**Sebep**:
- Network hatası
- Token yetkisi yok
- Track hazır değil
- Client role 'host' değil

**Çözüm**:
- Network bağlantısını kontrol et
- Token'ı kontrol et
- Track'in hazır olduğundan emin ol
- Client role'ü kontrol et

---

## 🔴 5. Kamera Erişim Hataları

### 5.1. WebRTC Desteklenmiyor
```javascript
Error: WebRTC desteklenmiyor. Modern bir tarayıcı kullanın.
```

**Sebep**:
- `navigator.mediaDevices` yok
- `navigator.mediaDevices.getUserMedia` yok
- Eski browser

**Çözüm**:
- Modern browser kullan (Chrome, Firefox, Safari, Edge)
- HTTPS kullan (localhost hariç)

**Kod**:
```javascript
// live-stream.js - Zaten kontrol var
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('WebRTC desteklenmiyor. Modern bir tarayıcı kullanın.');
}
```

---

### 5.2. HTTPS Gerekli
```javascript
Error: Kamera erişimi için HTTPS gereklidir. Lütfen HTTPS kullanın.
```

**Sebep**:
- HTTP üzerinden çalışıyor
- Localhost değil
- Güvenli olmayan bağlantı

**Çözüm**:
- HTTPS kullan
- Localhost için HTTP çalışır

**Kod**:
```javascript
// live-stream.js - Zaten kontrol var
const isSecure = window.location.protocol === 'https:' || 
                 window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1';

if (!isSecure) {
    throw new Error('Kamera erişimi için HTTPS gereklidir. Lütfen HTTPS kullanın.');
}
```

---

### 5.3. Kamera İzni Reddedildi
```javascript
Error: Kamera erişimi reddedildi. Lütfen tarayıcı ayarlarından kamera ve mikrofon izinlerini verin.
NotAllowedError: Permission denied
```

**Sebep**:
- Kullanıcı izni reddetti
- Tarayıcı ayarlarından izin verilmemiş
- Site için izin verilmemiş

**Çözüm**:
- ✅ Error handling var
- Kullanıcıya izin vermesi için talimat ver
- Tarayıcı ayarlarından izin ver

**Kod**:
```javascript
// live-stream.js - Zaten handle ediliyor
if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    errorMessage = 'Kamera erişimi reddedildi. Lütfen tarayıcı ayarlarından kamera ve mikrofon izinlerini verin.';
}
```

---

### 5.4. Kamera Bulunamadı
```javascript
Error: Kamera bulunamadı. Lütfen bir kamera bağlı olduğundan emin olun.
NotFoundError: No camera found
```

**Sebep**:
- Kamera bağlı değil
- Kamera driver sorunu
- Sistem tarafından tanınmıyor

**Çözüm**:
- ✅ Error handling var
- Kamerayı bağla
- Driver'ı kontrol et

**Kod**:
```javascript
// live-stream.js - Zaten handle ediliyor
if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    errorMessage = 'Kamera bulunamadı. Lütfen bir kamera bağlı olduğundan emin olun.';
}
```

---

### 5.5. Kamera Kullanımda
```javascript
Error: Kamera kullanımda. Lütfen başka bir uygulama kamerayı kullanıyorsa kapatın.
NotReadableError: Camera in use
```

**Sebep**:
- Başka bir uygulama kamerayı kullanıyor
- Kamera lock'lu
- Driver sorunu

**Çözüm**:
- ✅ Error handling var
- Diğer uygulamaları kapat
- Kamera'yı serbest bırak

**Kod**:
```javascript
// live-stream.js - Zaten handle ediliyor
if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    errorMessage = 'Kamera kullanımda. Lütfen başka bir uygulama kamerayı kullanıyorsa kapatın.';
}
```

---

## 🔴 6. Token Hataları

### 6.1. Token Yok
```javascript
Warning: Token yok, development mode deneniyor...
```

**Sebep**:
- Backend'den token gelmedi
- Token null
- Development mode

**Çözüm**:
- Backend'de token generation'ı kontrol et
- Production'da token zorunlu
- Development mode sadece test için

**Kod**:
```javascript
// live-stream.js - Zaten handle ediliyor
if (token) {
    joinedUid = await agoraClient.join(..., token, ...);
} else {
    console.warn('⚠️ Token yok, development mode deneniyor...');
    joinedUid = await agoraClient.join(..., null, ...);
}
```

---

### 6.2. Token Geçersiz
```javascript
Error: Invalid token
AgoraRTCError: INVALID_TOKEN
```

**Sebep**:
- Token formatı geçersiz
- Token signature hatası
- App ID/Certificate uyuşmazlığı

**Çözüm**:
- Token generation'ı kontrol et
- App ID ve Certificate doğru mu kontrol et
- Token formatını doğrula

---

## 🔴 7. App ID Hataları

### 7.1. App ID Geçersiz
```javascript
Error: Geçersiz App ID: xxx. App ID 32 karakter olmalı.
```

**Sebep**:
- App ID 32 karakter değil
- App ID yanlış
- App ID null/undefined

**Çözüm**:
- ✅ Validation var
- App ID'yi kontrol et (32 karakter olmalı)
- Backend'de App ID'yi kontrol et

**Kod**:
```javascript
// live-stream.js - Zaten kontrol var
if (!channelData.appId || channelData.appId.length !== 32) {
    throw new Error(`Geçersiz App ID: ${channelData.appId}. App ID 32 karakter olmalı.`);
}
```

---

## 🔴 8. Channel Hataları

### 8.1. Channel Name Geçersiz
```javascript
Error: Invalid channel name
AgoraRTCError: INVALID_CHANNEL_NAME
```

**Sebep**:
- Channel name geçersiz karakter içeriyor
- Channel name çok uzun
- Channel name boş

**Çözüm**:
- ✅ Backend'de sanitization var
- Channel name validation ekle

---

### 8.2. Channel Oluşturulamadı
```javascript
Error: Channel oluşturulamadı
Error: agora_channel_failed
```

**Sebep**:
- Backend'de Agora service hatası
- App ID/Certificate yanlış
- Agora service yüklenememiş

**Çözüm**:
- Backend'de Agora service'i kontrol et
- Environment variables'ı kontrol et
- Backend log'larını kontrol et

**Kod**:
```javascript
// backend/api/app.js
const agoraResult = agoraService.createChannel(channelName, userId);
if (!agoraResult.ok) {
    return res.status(500).json({ error: 'agora_channel_failed', detail: agoraResult.error });
}
```

---

## 🔴 9. Network Hataları

### 9.1. Network Timeout
```javascript
Error: Network timeout
TypeError: Failed to fetch
```

**Sebep**:
- Network bağlantısı yavaş
- Backend yanıt vermiyor
- Request timeout

**Çözüm**:
- Network bağlantısını kontrol et
- Backend server durumunu kontrol et
- Timeout süresini artır

---

### 9.2. CORS Hatası
```javascript
Error: CORS policy blocked
Access-Control-Allow-Origin error
```

**Sebep**:
- Backend CORS ayarları yanlış
- Origin whitelist'te değil
- CORS headers eksik

**Çözüm**:
- Backend CORS ayarlarını kontrol et
- Origin'i whitelist'e ekle
- CORS headers'ı kontrol et

---

## 🔴 10. User Data Hataları

### 10.1. User Email Yok
```javascript
Error: streamerEmail is required
```

**Sebep**:
- `currentUser.email` yok
- Request body'de email yok
- User data yüklenmemiş

**Çözüm**:
- User data'yı yükle
- Email'i kontrol et
- Login kontrolü yap

**Kod**:
```javascript
// live-stream.js - Zaten kontrol var
body: JSON.stringify({
    streamerEmail: currentUser.email, // Email kontrolü yapılmalı
    streamerName: currentUser.name || currentUser.email,
    deviceInfo: navigator.userAgent
})
```

---

### 10.2. User Not Logged In
```javascript
Error: User not logged in
```

**Sebep**:
- `currentUser` null
- User login olmamış
- LocalStorage'da user data yok

**Çözüm**:
- Login kontrolü yap
- User data'yı yükle
- Login sayfasına yönlendir

**Kod**:
```javascript
// live-stream.js - Zaten kontrol var
function loadUserData() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
    } else {
        // Test için varsayılan kullanıcı
        currentUser = {
            email: 'test@example.com',
            name: 'Test Kullanıcı',
            role: 'satici'
        };
    }
}
```

---

## 🟡 11. Uyarılar (Non-Critical)

### 11.1. Audio Track Bulunamadı
```javascript
Warning: Audio track bulunamadı
```

**Sebep**:
- Audio track yok
- Mikrofon erişimi yok
- Sadece video track var

**Durum**: Uyarı, yayın devam eder (sadece video)
**Çözüm**: Mikrofon erişimi iste

**Kod**:
```javascript
// live-stream.js - Zaten handle ediliyor
if (audioTracks.length > 0) {
    // Audio track yayınla
} else {
    console.warn('⚠️ Audio track bulunamadı');
}
```

---

### 11.2. Video Track Bulunamadı
```javascript
Warning: Video track bulunamadı
```

**Sebep**:
- Video track yok
- Kamera erişimi yok
- Sadece audio track var

**Durum**: Uyarı, yayın devam eder (sadece audio)
**Çözüm**: Kamera erişimi iste

---

## 📊 Hata Senaryoları Özeti

### Pre-Start Kontrolleri
1. ✅ Kamera erişimi yok
2. ✅ Video track bulunamadı
3. ✅ Yayın zaten aktif

### Backend İletişimi
4. ⚠️ Backend connection failed
5. ⚠️ Backend timeout
6. ✅ Backend response invalid
7. ✅ Backend provider hatası

### Agora SDK
8. ✅ Agora SDK yüklenmedi
9. ⚠️ Agora client oluşturulamadı
10. ⚠️ Agora join failed
11. ✅ Client role set failed (warning)

### Media Tracks
12. ⚠️ Video track oluşturulamadı
13. ⚠️ Audio track oluşturulamadı
14. ⚠️ Publish failed

### Kamera Erişimi
15. ✅ WebRTC desteklenmiyor
16. ✅ HTTPS gerekli
17. ✅ Kamera izni reddedildi
18. ✅ Kamera bulunamadı
19. ✅ Kamera kullanımda

### Token & App ID
20. ✅ Token yok (warning)
21. ⚠️ Token geçersiz
22. ✅ App ID geçersiz

### Channel
23. ⚠️ Channel name geçersiz
24. ⚠️ Channel oluşturulamadı

### Network & User
25. ⚠️ Network timeout
26. ⚠️ CORS hatası
27. ⚠️ User email yok
28. ⚠️ User not logged in

---

## ✅ Çözüm Durumu

### Çözülen Hatalar ✅ (12 adet)
- ✅ Kamera erişimi kontrolleri
- ✅ Video track kontrolleri
- ✅ Yayın durumu kontrolleri
- ✅ Backend response validation
- ✅ Provider kontrolü
- ✅ Agora SDK kontrolü
- ✅ App ID validation
- ✅ Client role handling
- ✅ WebRTC/HTTPS kontrolleri
- ✅ Kamera erişim hataları (user-friendly)
- ✅ Token yok handling
- ✅ User data loading

### İyileştirme Gerekli ⚠️ (16 adet)
- ⚠️ Backend connection error handling
- ⚠️ Network timeout handling
- ⚠️ CORS error handling
- ⚠️ Agora join error handling
- ⚠️ Track creation error handling
- ⚠️ Publish error handling
- ⚠️ Token validation
- ⚠️ Channel creation error handling
- ⚠️ User authentication check
- ⚠️ Retry mechanisms
- ⚠️ Better error messages
- ⚠️ Error recovery

---

## 🎯 Önerilen İyileştirmeler

### 1. **Retry Mechanisms**
- Backend connection retry
- Agora join retry
- Publish retry

### 2. **Better Error Messages**
- User-friendly messages
- Action suggestions
- Help links

### 3. **Error Recovery**
- Automatic retry
- Fallback mechanisms
- Graceful degradation

### 4. **Validation**
- Pre-flight checks
- Input validation
- State validation

---

## 📝 Notlar

- Çoğu hata zaten handle ediliyor
- User-friendly error messages var
- Bazı hatalar için retry mekanizması gerekli
- Network hataları için timeout handling gerekli

---

**Son Güncelleme**: 2024-11-06
**Toplam Hata Senaryosu**: 28 adet
**Çözülen**: 12 adet
**İyileştirme Gerekli**: 16 adet

