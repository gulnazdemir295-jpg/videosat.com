# 🔧 Agora Token Yenileme Çözümü

## ❌ Sorun
```
AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: flag: 4096, message: AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: dynamic key expired
```

**Neden**: Agora token'larının süresi 1 saat (3600 saniye). Token süresi dolduğunda yayın kesiliyor.

## ✅ Çözüm

### 1. **Frontend Token Yenileme Event Handler'ları**

`live-stream.js` dosyasına token expire event handler'ları eklendi:

```javascript
// Token expire olmadan önce yenile (Agora SDK event)
agoraClient.on('token-privilege-will-expire', async () => {
    console.log('⚠️ Token süresi dolmak üzere, yenileniyor...');
    try {
        await renewAgoraToken();
        console.log('✅ Token başarıyla yenilendi');
    } catch (error) {
        console.error('❌ Token yenileme hatası:', error);
        updateStatus('Token yenilenemedi. Yayın kesilebilir.');
    }
});

// Token expire olduğunda (fallback)
agoraClient.on('token-privilege-did-expire', async () => {
    console.error('❌ Token süresi doldu! Yenileniyor...');
    try {
        await renewAgoraToken();
        console.log('✅ Token başarıyla yenilendi (expire sonrası)');
    } catch (error) {
        console.error('❌ Token yenileme hatası:', error);
        updateStatus('Token yenilenemedi. Yayın kesildi. Lütfen sayfayı yenileyin.');
        // Yayını durdur
        if (isStreaming) {
            await stopStream();
        }
    }
});
```

### 2. **Token Yenileme Fonksiyonu**

```javascript
async function renewAgoraToken() {
    if (!currentChannelData || !agoraClient) {
        throw new Error('Channel data veya Agora client bulunamadı');
    }
    
    try {
        console.log('🔄 Token yenileniyor...');
        
        // Backend'den yeni token al
        const roomId = 'main-room';
        const response = await fetch(`${getAPIBaseURL()}/rooms/${roomId}/channels/${currentChannelId}/renew-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Token yenileme hatası: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.ok || !data.token) {
            throw new Error('Yeni token alınamadı');
        }
        
        // Yeni token'ı Agora client'a set et
        const newToken = data.token;
        await agoraClient.renewToken(newToken);
        
        // Channel data'yı güncelle
        currentChannelData.webrtc.token = newToken;
        currentChannelData.publisherToken = newToken;
        
        console.log('✅ Token başarıyla yenilendi');
        return newToken;
    } catch (error) {
        console.error('❌ Token yenileme hatası:', error);
        throw error;
    }
}
```

### 3. **Backend Token Yenileme Endpoint'i**

`backend/api/app.js` dosyasına yeni endpoint eklendi:

```javascript
// Token yenileme endpoint'i
app.post('/api/rooms/:roomId/channels/:channelId/renew-token', async (req, res) => {
  try {
    const { roomId, channelId } = req.params;
    const room = rooms.get(roomId);
    
    if (!room) {
      return res.status(404).json({ ok: false, error: 'Room not found' });
    }
    
    const channelData = room.channels.get(channelId);
    if (!channelData) {
      return res.status(404).json({ ok: false, error: 'Channel not found' });
    }
    
    // Agora token yenile
    if (channelData.provider === 'AGORA' && agoraService) {
      const userId = channelData.webrtc?.uid || '0';
      const role = 1; // Publisher role
      
      const newToken = agoraService.refreshToken(
        channelData.channelName,
        userId,
        role
      );
      
      // Channel data'yı güncelle
      channelData.publisherToken = newToken;
      channelData.webrtc.token = newToken;
      channelData.lastActiveAt = new Date().toISOString();
      
      return res.json({
        ok: true,
        token: newToken,
        channelName: channelData.channelName
      });
    }
    
    return res.status(400).json({ ok: false, error: 'Token yenileme desteklenmiyor' });
  } catch (err) {
    console.error('Token yenileme hatası:', err);
    return res.status(500).json({ ok: false, error: String(err && err.message || err) });
  }
});
```

## 🔄 Nasıl Çalışıyor?

1. **Token Expire Öncesi**: Agora SDK `token-privilege-will-expire` event'ini tetikler (genellikle token süresinin %80'i dolduğunda)
2. **Otomatik Yenileme**: Frontend bu event'i yakalar ve `renewAgoraToken()` fonksiyonunu çağırır
3. **Backend İsteği**: Frontend backend'e yeni token isteği gönderir
4. **Yeni Token**: Backend Agora service'i kullanarak yeni token oluşturur
5. **Token Güncelleme**: Frontend yeni token'ı Agora client'a set eder (`agoraClient.renewToken()`)
6. **Fallback**: Eğer `token-privilege-will-expire` çalışmazsa, `token-privilege-did-expire` event'i devreye girer

## ✅ Sonuç

- ✅ Token otomatik olarak yenileniyor
- ✅ Yayın kesintisiz devam ediyor
- ✅ Kullanıcı müdahalesi gerekmiyor
- ✅ Hata durumunda kullanıcı bilgilendiriliyor

## 🧪 Test

1. Yayını başlatın
2. 1 saat bekleyin (veya token expire olana kadar)
3. Console'da token yenileme loglarını kontrol edin:
   - `⚠️ Token süresi dolmak üzere, yenileniyor...`
   - `✅ Token başarıyla yenilendi`
4. Yayının kesintisiz devam ettiğini doğrulayın

## 📝 Notlar

- Token süresi: 1 saat (3600 saniye)
- Yenileme zamanı: Token süresinin %80'i dolduğunda (yaklaşık 48 dakika)
- Fallback: Token expire olduktan sonra da yenileme yapılabilir

