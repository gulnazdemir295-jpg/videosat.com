// AWS IVS Service - Tarayıcıdan Canlı Yayın (env güvenlik için!)
// LÜTFEN KESİNLİKLE AWS Anahtarlarınızı kodda plaintext bırakmayın!
// Anahtarlarınızı .env dosyasına ekleyin ve repo/production'a .env eklemeyin
// .env.example aşağıdaki gibi olmalı:
//
//   IVS_STREAM_KEY=sk_us-east-1_eAWtBjlj56zE_yYXjvk2F9Ji7AgmLSqXI0R1ZOnOFSw
//   IVS_PLAYBACK_URL=https://390d27dc4a33.us-east-1.playback.live-video.net/api/video/v1/us-east-1.328185871955.channel.gnI3jUnKmV1K.m3u8
//   IVS_CHANNEL_ID=gnI3jUnKmV1K

const IVS_CONFIG = {
  streamKey: process.env.IVS_STREAM_KEY || '',
  playbackUrl: process.env.IVS_PLAYBACK_URL || '',
  channelId: process.env.IVS_CHANNEL_ID || ''
};
// Gerçek kodda burada IVS yayın başlatma/publish fonksiyonunu ivsConfig ile çalıştıracaksın!
// Bu dosya github'da push edilmeli, ama .env ve plaintext key asla commit edilmemeli!

module.exports = IVS_CONFIG;

