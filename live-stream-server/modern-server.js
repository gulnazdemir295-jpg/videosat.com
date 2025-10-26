const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static('.'));
app.use(express.json());

// Store active broadcasts with categories
let activeBroadcasts = new Map();
let broadcastId = 1;

// Broadcast categories
const CATEGORIES = {
    'teknoloji': 'Teknoloji',
    'moda': 'Moda & Giyim',
    'ev-yasam': 'Ev & Yaşam',
    'spor': 'Spor & Fitness',
    'sanat': 'Sanat & El Sanatları',
    'yemek': 'Yemek & Tarifler',
    'egitim': 'Eğitim',
    'saglik': 'Sağlık & Güzellik',
    'otomotiv': 'Otomotiv',
    'oyuncak': 'Oyuncak & Çocuk',
    'diger': 'Diğer'
};

// Root route handler
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Modern Canlı Yayın Sistemi</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
                .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; }
                .header { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
                .header p { margin: 10px 0 0 0; opacity: 0.9; }
                .content { padding: 30px; }
                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
                .card { background: #f8f9fa; border-radius: 10px; padding: 20px; text-align: center; transition: transform 0.3s ease; border: 2px solid transparent; }
                .card:hover { transform: translateY(-5px); border-color: #4ecdc4; }
                .card h3 { color: #333; margin: 0 0 10px 0; }
                .card p { color: #666; margin: 0 0 15px 0; }
                .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; text-decoration: none; border-radius: 25px; font-weight: 500; transition: all 0.3s ease; }
                .btn:hover { transform: scale(1.05); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
                .status { background: #e8f5e8; border: 1px solid #4caf50; color: #2e7d32; padding: 10px; border-radius: 5px; margin: 20px 0; }
                .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                .stat { text-align: center; }
                .stat-number { font-size: 2em; font-weight: bold; color: #4ecdc4; }
                .stat-label { color: #666; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎥 Modern Canlı Yayın Sistemi</h1>
                    <p>Gerçek zamanlı, kategorize edilmiş canlı yayın platformu</p>
                </div>
                <div class="content">
                    <div class="status">
                        ✅ <strong>Sunucu Aktif</strong> - Port: ${PORT} | Socket.IO: Bağlı | Aktif Yayınlar: ${activeBroadcasts.size}
                    </div>
                    
                    <div class="stats">
                        <div class="stat">
                            <div class="stat-number">${activeBroadcasts.size}</div>
                            <div class="stat-label">Aktif Yayın</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${Object.keys(CATEGORIES).length}</div>
                            <div class="stat-label">Kategori</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">∞</div>
                            <div class="stat-label">Eş Zamanlı İzleyici</div>
                        </div>
                    </div>

                    <div class="grid">
                        <div class="card">
                            <h3>🎬 Yayın Başlat</h3>
                            <p>Kategorize edilmiş canlı yayın başlatın</p>
                            <a href="../canli-yayin-yap-modern.html" class="btn">Yayın Başlat</a>
                        </div>
                        <div class="card">
                            <h3>👀 Yayınları İzle</h3>
                            <p>Kategorilere göre canlı yayınları keşfedin</p>
                            <a href="../canli-yayin-izle-modern.html" class="btn">Yayınları İzle</a>
                        </div>
                        <div class="card">
                            <h3>📊 Yayın Yönetimi</h3>
                            <p>Yayınlarınızı yönetin ve analiz edin</p>
                            <a href="../canli-yayin-yonetim-modern.html" class="btn">Yönetim Paneli</a>
                        </div>
                        <div class="card">
                            <h3>🧪 Test Sayfası</h3>
                            <p>Gelişmiş test ve geliştirme araçları</p>
                            <a href="/test.html" class="btn">Test Et</a>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
});

// API Routes
app.get('/api/broadcasts', (req, res) => {
    const broadcasts = Array.from(activeBroadcasts.values());
    res.json(broadcasts);
});

app.get('/api/categories', (req, res) => {
    res.json(CATEGORIES);
});

app.get('/api/broadcasts/:category', (req, res) => {
    const category = req.params.category;
    const broadcasts = Array.from(activeBroadcasts.values())
        .filter(broadcast => broadcast.category === category);
    res.json(broadcasts);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Clean up any broadcasts from this socket
        for (let [id, broadcast] of activeBroadcasts) {
            if (broadcast.socketId === socket.id) {
                activeBroadcasts.delete(id);
                io.emit('broadcastEnded', { broadcastId: id });
                console.log('Broadcast ended due to disconnect:', id);
            }
        }
    });

    // Start a new broadcast
    socket.on('startBroadcast', (data) => {
        const broadcast = {
            id: broadcastId++,
            socketId: socket.id,
            title: data.title || 'Canlı Yayın',
            seller: data.seller || 'Bilinmeyen',
            category: data.category || 'diger',
            categoryName: CATEGORIES[data.category] || 'Diğer',
            products: data.products || [],
            slogan: data.slogan || '',
            description: data.description || '',
            startTime: new Date().toISOString(),
            viewers: 0,
            maxViewers: 0,
            status: 'live',
            thumbnail: data.thumbnail || null,
            tags: data.tags || []
        };
        
        activeBroadcasts.set(broadcast.id, broadcast);
        socket.emit('broadcastStarted', { broadcastId: broadcast.id });
        io.emit('newBroadcast', broadcast);
        console.log('Broadcast started:', broadcast);
    });

    // Join a broadcast as viewer
    socket.on('joinBroadcast', (data) => {
        const broadcast = activeBroadcasts.get(data.broadcastId);
        if (broadcast) {
            broadcast.viewers++;
            if (broadcast.viewers > broadcast.maxViewers) {
                broadcast.maxViewers = broadcast.viewers;
            }
            socket.join(`broadcast-${data.broadcastId}`);
            
            // Send current broadcast data to the viewer
            socket.emit('joinedBroadcast', broadcast);
            
            // Notify all viewers in the broadcast room
            io.to(`broadcast-${data.broadcastId}`).emit('viewerJoined', { 
                broadcastId: data.broadcastId, 
                viewers: broadcast.viewers,
                maxViewers: broadcast.maxViewers
            });
            
            // Send updated broadcast info to all viewers
            io.to(`broadcast-${data.broadcastId}`).emit('broadcastUpdated', broadcast);
            
            console.log(`Viewer joined broadcast ${data.broadcastId}, total viewers: ${broadcast.viewers}`);
        } else {
            socket.emit('broadcastNotFound', { broadcastId: data.broadcastId });
            console.log(`Broadcast ${data.broadcastId} not found`);
        }
    });

    // Leave a broadcast
    socket.on('leaveBroadcast', (data) => {
        const broadcast = activeBroadcasts.get(data.broadcastId);
        if (broadcast) {
            broadcast.viewers = Math.max(0, broadcast.viewers - 1);
            socket.leave(`broadcast-${data.broadcastId}`);
            io.to(`broadcast-${data.broadcastId}`).emit('viewerLeft', { 
                broadcastId: data.broadcastId, 
                viewers: broadcast.viewers
            });
            console.log(`Viewer left broadcast ${data.broadcastId}, remaining viewers: ${broadcast.viewers}`);
        }
    });

    // End a broadcast
    socket.on('endBroadcast', (data) => {
        const broadcast = activeBroadcasts.get(data.broadcastId);
        if (broadcast && broadcast.socketId === socket.id) {
            activeBroadcasts.delete(data.broadcastId);
            io.emit('broadcastEnded', { broadcastId: data.broadcastId });
            console.log('Broadcast ended:', data.broadcastId);
        }
    });

    // Get list of active broadcasts
    socket.on('getActiveBroadcasts', () => {
        const broadcasts = Array.from(activeBroadcasts.values());
        socket.emit('activeBroadcasts', broadcasts);
    });

    // Get broadcasts by category
    socket.on('getBroadcastsByCategory', (category) => {
        const broadcasts = Array.from(activeBroadcasts.values())
            .filter(broadcast => broadcast.category === category);
        socket.emit('broadcastsByCategory', { category, broadcasts });
    });

    // Send message to broadcast viewers
    socket.on('broadcastMessage', (data) => {
        const broadcast = activeBroadcasts.get(data.broadcastId);
        if (broadcast) {
            console.log('Broadcasting message:', data.message, 'to broadcast:', data.broadcastId);
            io.to(`broadcast-${data.broadcastId}`).emit('broadcastMessage', {
                broadcastId: data.broadcastId,
                message: data.message,
                timestamp: new Date().toISOString(),
                sender: data.sender || 'Yayıncı'
            });
        }
    });

    // WebRTC Signaling
    socket.on('offer', (data) => {
        console.log('Relaying offer for broadcast:', data.broadcastId);
        socket.to(`broadcast-${data.broadcastId}`).emit('offer', {
            broadcastId: data.broadcastId,
            offer: data.offer
        });
    });

    socket.on('answer', (data) => {
        console.log('Relaying answer for broadcast:', data.broadcastId);
        socket.to(`broadcast-${data.broadcastId}`).emit('answer', {
            broadcastId: data.broadcastId,
            answer: data.answer
        });
    });

    socket.on('iceCandidate', (data) => {
        console.log('Relaying ICE candidate for broadcast:', data.broadcastId);
        socket.to(`broadcast-${data.broadcastId}`).emit('iceCandidate', {
            broadcastId: data.broadcastId,
            candidate: data.candidate
        });
    });

    // Update broadcast info
    socket.on('updateBroadcast', (data) => {
        const broadcast = activeBroadcasts.get(data.broadcastId);
        if (broadcast && broadcast.socketId === socket.id) {
            Object.assign(broadcast, data.updates);
            io.emit('broadcastUpdated', broadcast);
            console.log('Broadcast updated:', broadcast.id);
        }
    });

    // Ping/Pong for latency measurement
    socket.on('ping', (callback) => {
        if (typeof callback === 'function') {
            callback();
        }
        socket.emit('pong');
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Modern Live Stream Server running on port ${PORT}`);
    console.log(`📱 Dashboard: http://localhost:${PORT}/`);
    console.log(`🧪 Test Page: http://localhost:${PORT}/test.html`);
    console.log(`📊 API: http://localhost:${PORT}/api/broadcasts`);
});
