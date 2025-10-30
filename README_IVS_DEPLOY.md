# basvideo.com – AWS IVS backend deploy

## 1) Requirements
- Node 18+
- AWS IAM user with permissions: IVS (Create/Delete/List Channel/StreamKey, StopStream)
- Nginx + HTTPS (Let’s Encrypt önerilir)

## 2) Clone & install
```
git pull
npm ci || npm i
```

## 3) Environment
- See `ENV_EXAMPLE.md` and create `.env` at repo root.

## 4) Run locally
```
npm run start
# Health check
curl http://localhost:4000/api/health
```

## 5) Run as service (PM2)
```
npm i -g pm2
pm2 start backend/api/app.js --name basvideo-api
pm2 save && pm2 startup
```

## 6) Nginx reverse proxy
Add to your server config and reload:
```
server {
    listen 80;
    server_name basvideo.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name basvideo.com;

    ssl_certificate     /etc/letsencrypt/live/basvideo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/basvideo.com/privkey.pem;

    location /api/ {
        proxy_pass         http://127.0.0.1:4000/;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```
Reload:
```
nginx -t && systemctl reload nginx
```

## 7) Admin usage
- Admin endpoints require header: `x-admin-token: <ADMIN_TOKEN>`
- Create broadcast IVS channel + key:
```
curl -X POST https://basvideo.com/api/admin/ivs/channel \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d '{"broadcastId":"yayin-001","type":"BASIC","latencyMode":"LOW"}'
```
- Parse playback URL to Channel ID:
```
curl -X POST https://basvideo.com/api/admin/ivs/parse-playback \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d '{"playbackUrl":"https://...us-east-1....channel.gnI3jUnKmV1K.m3u8"}'
```
- Get channel by Channel ID:
```
curl https://basvideo.com/api/admin/ivs/channel-by-id/gnI3jUnKmV1K \
  -H "x-admin-token: $ADMIN_TOKEN"
```
- List stream keys:
```
curl "https://basvideo.com/api/admin/ivs/stream-keys?channelArn=arn:aws:ivs:us-east-1:ACCOUNT:channel/ID" \
  -H "x-admin-token: $ADMIN_TOKEN"
```
- Delete channel (and keys):
```
curl -X DELETE https://basvideo.com/api/admin/ivs/channel \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d '{"broadcastId":"yayin-001"}'
```

## 8) Publisher flow
- GET `/api/ivs/broadcast/:broadcastId/config` → ingest + playback URL
- POST `/api/ivs/broadcast/:broadcastId/claim-key` → stream key (POC)

Notes:
- For production, prefer short-lived tokens or signer instead of returning raw key.
- Persist broadcasts to DB if you need state after restarts.
