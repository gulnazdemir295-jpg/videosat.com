/**
 * Agora Live Streaming Enhancements
 * 
 * Kritik eksikliklerin çözümü:
 * 1. Network Quality Monitoring
 * 2. Stream Quality Adaptation
 * 3. Stream Interruption Recovery
 * 4. Enhanced Error Handling
 * 5. Stream Health Monitoring
 */

// Network Quality Monitoring
let networkQualityStats = {
    uplinkNetworkQuality: 0, // 0-6 (0=unknown, 1=excellent, 6=down)
    downlinkNetworkQuality: 0,
    rtt: 0, // Round-trip time (ms)
    packetLoss: 0, // Packet loss rate (%)
    bandwidth: 0 // Available bandwidth (kbps)
};

// Stream Quality Settings
let streamQualitySettings = {
    currentQuality: 'auto', // 'high', 'medium', 'low', 'auto'
    videoResolution: { width: 1280, height: 720 },
    videoFrameRate: 30,
    videoBitrate: 2000, // kbps
    audioBitrate: 48 // kbps
};

// Stream Health Metrics
let streamHealthMetrics = {
    fps: 0,
    bitrate: 0,
    resolution: { width: 0, height: 0 },
    audioLevel: 0,
    videoLevel: 0,
    connectionState: 'disconnected', // 'connecting', 'connected', 'reconnecting', 'failed'
    lastError: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
};

// Connection Retry Configuration
const retryConfig = {
    maxRetries: 5,
    initialDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2
};

/**
 * Network Quality Monitoring
 */
function setupNetworkQualityMonitoring(agoraClient) {
    if (!agoraClient) return;

    // Network quality event listener
    agoraClient.on('network-quality', (stats) => {
        try {
            networkQualityStats = {
                uplinkNetworkQuality: stats.uplinkNetworkQuality || 0,
                downlinkNetworkQuality: stats.downlinkNetworkQuality || 0,
                rtt: stats.rtt || 0,
                packetLoss: stats.packetLoss || 0,
                bandwidth: stats.bandwidth || 0
            };

            // Update UI
            updateNetworkQualityUI(networkQualityStats);

            // Log network quality
            console.log('📊 Network Quality:', {
                uplink: getNetworkQualityLabel(networkQualityStats.uplinkNetworkQuality),
                downlink: getNetworkQualityLabel(networkQualityStats.downlinkNetworkQuality),
                rtt: `${networkQualityStats.rtt}ms`,
                packetLoss: `${networkQualityStats.packetLoss}%`
            });

            // Auto quality adaptation
            if (streamQualitySettings.currentQuality === 'auto') {
                adaptStreamQuality(networkQualityStats);
            }

            // Warn if network quality is poor
            if (networkQualityStats.uplinkNetworkQuality >= 4) {
                showNetworkWarning(networkQualityStats);
            }
        } catch (error) {
            console.error('Network quality monitoring error:', error);
        }
    });

    console.log('✅ Network quality monitoring aktif');
}

/**
 * Get Network Quality Label
 */
function getNetworkQualityLabel(quality) {
    const labels = {
        0: 'Unknown',
        1: 'Excellent',
        2: 'Good',
        3: 'Poor',
        4: 'Bad',
        5: 'Very Bad',
        6: 'Down'
    };
    return labels[quality] || 'Unknown';
}

/**
 * Update Network Quality UI
 */
function updateNetworkQualityUI(stats) {
    const networkQualityEl = document.getElementById('networkQuality');
    if (!networkQualityEl) return;

    const uplinkLabel = getNetworkQualityLabel(stats.uplinkNetworkQuality);
    const qualityClass = stats.uplinkNetworkQuality <= 2 ? 'good' : 
                        stats.uplinkNetworkQuality <= 4 ? 'warning' : 'bad';

    networkQualityEl.innerHTML = `
        <div class="network-quality ${qualityClass}">
            <i class="fas fa-signal"></i>
            <span>${uplinkLabel}</span>
            ${stats.rtt > 0 ? `<span class="rtt">${stats.rtt}ms</span>` : ''}
            ${stats.packetLoss > 0 ? `<span class="packet-loss">${stats.packetLoss}% loss</span>` : ''}
        </div>
    `;
    networkQualityEl.className = `network-quality-indicator ${qualityClass}`;
}

/**
 * Show Network Warning
 */
function showNetworkWarning(stats) {
    const warningMessage = `⚠️ Ağ kalitesi düşük: ${getNetworkQualityLabel(stats.uplinkNetworkQuality)}. Yayın kalitesi düşürülebilir.`;
    updateStatus(warningMessage);
    
    // Show notification (non-blocking)
    showNotification(warningMessage, 'warning', 5000);
}

/**
 * Stream Quality Adaptation
 */
function adaptStreamQuality(networkStats) {
    if (!agoraTracks.videoTrack) return;

    const uplinkQuality = networkStats.uplinkNetworkQuality;
    let newQuality = streamQualitySettings.currentQuality;

    // Quality adaptation based on network quality
    if (uplinkQuality <= 1) {
        // Excellent - High quality
        newQuality = 'high';
        streamQualitySettings.videoResolution = { width: 1280, height: 720 };
        streamQualitySettings.videoFrameRate = 30;
        streamQualitySettings.videoBitrate = 2000;
    } else if (uplinkQuality <= 2) {
        // Good - Medium quality
        newQuality = 'medium';
        streamQualitySettings.videoResolution = { width: 854, height: 480 };
        streamQualitySettings.videoFrameRate = 25;
        streamQualitySettings.videoBitrate = 1200;
    } else if (uplinkQuality <= 4) {
        // Poor - Low quality
        newQuality = 'low';
        streamQualitySettings.videoResolution = { width: 640, height: 360 };
        streamQualitySettings.videoFrameRate = 20;
        streamQualitySettings.videoBitrate = 600;
    } else {
        // Very Bad - Minimum quality
        newQuality = 'low';
        streamQualitySettings.videoResolution = { width: 426, height: 240 };
        streamQualitySettings.videoFrameRate = 15;
        streamQualitySettings.videoBitrate = 400;
    }

    // Apply quality if changed
    if (newQuality !== streamQualitySettings.currentQuality) {
        console.log(`🔄 Stream quality değiştiriliyor: ${streamQualitySettings.currentQuality} -> ${newQuality}`);
        applyStreamQuality(newQuality);
    }
}

/**
 * Apply Stream Quality
 */
async function applyStreamQuality(quality) {
    try {
        if (!agoraTracks.videoTrack) return;

        streamQualitySettings.currentQuality = quality;

        // Update video track settings
        if (agoraTracks.videoTrack.setEncoderConfiguration) {
            await agoraTracks.videoTrack.setEncoderConfiguration({
                width: streamQualitySettings.videoResolution.width,
                height: streamQualitySettings.videoResolution.height,
                frameRate: streamQualitySettings.videoFrameRate,
                bitrateMax: streamQualitySettings.videoBitrate * 1000 // kbps to bps
            });
            console.log('✅ Stream quality uygulandı:', quality);
        }

        // Update UI
        updateQualityIndicator(quality);
    } catch (error) {
        console.error('Stream quality uygulama hatası:', error);
    }
}

/**
 * Update Quality Indicator
 */
function updateQualityIndicator(quality) {
    const qualityEl = document.getElementById('streamQuality');
    if (!qualityEl) return;

    const qualityLabels = {
        high: 'HD',
        medium: 'SD',
        low: 'Low',
        auto: 'Auto'
    };

    qualityEl.textContent = qualityLabels[quality] || quality;
    qualityEl.className = `stream-quality ${quality}`;
}

/**
 * Stream Interruption Recovery
 */
function setupStreamInterruptionRecovery(agoraClient) {
    if (!agoraClient) return;

    // Connection state change
    agoraClient.on('connection-state-change', async (curState, revState) => {
        console.log(`🔌 Connection state: ${revState} -> ${curState}`);
        streamHealthMetrics.connectionState = curState;

        updateConnectionStateUI(curState);

        // Handle reconnection
        if (curState === 'RECONNECTING') {
            await handleReconnection();
        } else if (curState === 'FAILED') {
            await handleConnectionFailure();
        } else if (curState === 'CONNECTED') {
            streamHealthMetrics.reconnectAttempts = 0;
            updateStatus('✅ Bağlantı başarılı');
        }
    });

    // Token privilege will expire
    agoraClient.on('token-privilege-will-expire', async () => {
        console.log('⚠️ Token süresi dolmak üzere, yenileniyor...');
        try {
            await renewAgoraToken();
            console.log('✅ Token başarıyla yenilendi');
        } catch (error) {
            console.error('❌ Token yenileme hatası:', error);
            await handleTokenRenewalFailure();
        }
    });

    // Token privilege did expire
    agoraClient.on('token-privilege-did-expire', async () => {
        console.error('❌ Token süresi doldu! Yenileniyor...');
        try {
            await renewAgoraToken();
            console.log('✅ Token başarıyla yenilendi (expire sonrası)');
        } catch (error) {
            console.error('❌ Token yenileme hatası:', error);
            await handleTokenRenewalFailure();
        }
    });

    console.log('✅ Stream interruption recovery aktif');
}

/**
 * Handle Reconnection
 */
async function handleReconnection() {
    streamHealthMetrics.reconnectAttempts++;
    updateStatus(`🔄 Yeniden bağlanılıyor... (${streamHealthMetrics.reconnectAttempts}/${streamHealthMetrics.maxReconnectAttempts})`);

    if (streamHealthMetrics.reconnectAttempts > streamHealthMetrics.maxReconnectAttempts) {
        await handleConnectionFailure();
        return;
    }

    // Show reconnection UI
    showReconnectionUI(true);
}

/**
 * Handle Connection Failure
 */
async function handleConnectionFailure() {
    streamHealthMetrics.connectionState = 'failed';
    streamHealthMetrics.lastError = 'Connection failed';

    updateStatus('❌ Bağlantı başarısız. Yeniden denemek için butona tıklayın.');

    // Show reconnection button
    showReconnectionUI(false);
    showReconnectButton();
}

/**
 * Handle Token Renewal Failure
 */
async function handleTokenRenewalFailure() {
    updateStatus('⚠️ Token yenilenemedi. Yayın kesilebilir.');

    // Try to reconnect
    if (agoraClient && streamHealthMetrics.connectionState !== 'failed') {
        try {
            await agoraClient.renewToken(await getNewToken());
            console.log('✅ Token yenileme başarılı (reconnect sonrası)');
        } catch (error) {
            console.error('❌ Token yenileme hatası (reconnect sonrası):', error);
            await handleConnectionFailure();
        }
    }
}

/**
 * Get New Token (helper)
 */
async function getNewToken() {
    // This should call renewAgoraToken or fetch from backend
    if (typeof renewAgoraToken === 'function') {
        return await renewAgoraToken();
    }
    throw new Error('Token renewal function not available');
}

/**
 * Show Reconnection UI
 */
function showReconnectionUI(isReconnecting) {
    const reconnectUI = document.getElementById('reconnectionUI');
    if (!reconnectUI) return;

    if (isReconnecting) {
        reconnectUI.style.display = 'block';
        reconnectUI.innerHTML = `
            <div class="reconnection-status">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Yeniden bağlanılıyor...</span>
            </div>
        `;
    } else {
        reconnectUI.style.display = 'none';
    }
}

/**
 * Show Reconnect Button
 */
function showReconnectButton() {
    const reconnectBtn = document.getElementById('reconnectBtn');
    if (!reconnectBtn) return;

    reconnectBtn.style.display = 'block';
    reconnectBtn.onclick = async () => {
        reconnectBtn.disabled = true;
        reconnectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yeniden bağlanılıyor...';
        
        try {
            // Reset reconnect attempts
            streamHealthMetrics.reconnectAttempts = 0;
            
            // Try to reconnect
            if (agoraClient && currentChannelData) {
                await agoraClient.leave();
                await startAgoraStream(currentChannelData);
                updateStatus('✅ Yeniden bağlantı başarılı');
            } else {
                // Full restart
                await startStream();
            }
            
            reconnectBtn.style.display = 'none';
        } catch (error) {
            console.error('Reconnection error:', error);
            updateStatus('❌ Yeniden bağlantı başarısız: ' + error.message);
            reconnectBtn.disabled = false;
            reconnectBtn.innerHTML = '<i class="fas fa-redo"></i> Yeniden Dene';
        }
    };
}

/**
 * Update Connection State UI
 */
function updateConnectionStateUI(state) {
    const connectionStateEl = document.getElementById('connectionState');
    if (!connectionStateEl) return;

    const stateLabels = {
        'DISCONNECTED': 'Bağlantı Yok',
        'CONNECTING': 'Bağlanıyor...',
        'CONNECTED': 'Bağlı',
        'RECONNECTING': 'Yeniden Bağlanıyor...',
        'FAILED': 'Bağlantı Başarısız'
    };

    connectionStateEl.textContent = stateLabels[state] || state;
    connectionStateEl.className = `connection-state ${state.toLowerCase()}`;
}

/**
 * Stream Health Monitoring
 */
function setupStreamHealthMonitoring(agoraClient, videoTrack, audioTrack) {
    if (!agoraClient) return;

    // Stream statistics (periodic)
    const healthCheckInterval = setInterval(() => {
        if (!isStreaming) {
            clearInterval(healthCheckInterval);
            return;
        }

        try {
            // Get stream statistics
            agoraClient.getLocalVideoStats().then(stats => {
                if (stats && stats.length > 0) {
                    const stat = stats[0];
                    streamHealthMetrics.fps = stat.frameRate || 0;
                    streamHealthMetrics.bitrate = stat.sendBitrate || 0;
                    streamHealthMetrics.resolution = {
                        width: stat.sendResolutionWidth || 0,
                        height: stat.sendResolutionHeight || 0
                    };

                    // Update UI
                    updateStreamHealthUI(streamHealthMetrics);
                }
            }).catch(err => console.warn('Video stats error:', err));

            agoraClient.getLocalAudioStats().then(stats => {
                if (stats && stats.length > 0) {
                    const stat = stats[0];
                    streamHealthMetrics.audioLevel = stat.sendVolumeLevel || 0;
                }
            }).catch(err => console.warn('Audio stats error:', err));
        } catch (error) {
            console.error('Stream health monitoring error:', error);
        }
    }, 2000); // Every 2 seconds

    console.log('✅ Stream health monitoring aktif');
}

/**
 * Update Stream Health UI
 */
function updateStreamHealthUI(metrics) {
    const healthEl = document.getElementById('streamHealth');
    if (!healthEl) return;

    healthEl.innerHTML = `
        <div class="stream-health-metrics">
            <div class="metric">
                <span class="label">FPS:</span>
                <span class="value">${metrics.fps}</span>
            </div>
            <div class="metric">
                <span class="label">Bitrate:</span>
                <span class="value">${Math.round(metrics.bitrate / 1000)}kbps</span>
            </div>
            <div class="metric">
                <span class="label">Resolution:</span>
                <span class="value">${metrics.resolution.width}x${metrics.resolution.height}</span>
            </div>
        </div>
    `;
}

/**
 * Enhanced Error Handling
 */
function setupEnhancedErrorHandling(agoraClient) {
    if (!agoraClient) return;

    // Exception handler
    agoraClient.on('exception', (evt) => {
        console.error('❌ Agora exception:', evt);
        
        const errorMessage = getErrorMessage(evt);
        streamHealthMetrics.lastError = errorMessage;

        // Show user-friendly error
        showErrorToUser(errorMessage, evt);

        // Log error
        logError('AgoraException', evt);
    });

    // Stream fallback
    agoraClient.on('stream-fallback', (evt) => {
        console.warn('⚠️ Stream fallback:', evt);
        updateStatus('⚠️ Yayın kalitesi düşürüldü (ağ sorunu)');
    });

    // Stream type changed
    agoraClient.on('stream-type-changed', (evt) => {
        console.log('📡 Stream type changed:', evt);
    });

    console.log('✅ Enhanced error handling aktif');
}

/**
 * Get Error Message (User-Friendly)
 */
function getErrorMessage(error) {
    if (!error) return 'Bilinmeyen hata';

    const errorCode = error.code || error.errCode;
    const errorMsg = error.msg || error.message || '';

    const errorMessages = {
        'CAN_NOT_GET_GATEWAY_SERVER': 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.',
        'DYNAMIC_KEY_EXPIRED': 'Güvenlik anahtarı süresi doldu. Sayfayı yenileyin.',
        'INVALID_APP_ID': 'Geçersiz uygulama kimliği. Lütfen destek ile iletişime geçin.',
        'INVALID_CHANNEL_NAME': 'Geçersiz kanal adı.',
        'INVALID_TOKEN': 'Geçersiz güvenlik anahtarı. Sayfayı yenileyin.',
        'TOKEN_EXPIRED': 'Güvenlik anahtarı süresi doldu. Yenileniyor...',
        'CONNECTION_LOST': 'Bağlantı kesildi. Yeniden bağlanılıyor...',
        'NETWORK_ERROR': 'Ağ hatası. İnternet bağlantınızı kontrol edin.'
    };

    // Try to find specific error message
    for (const [key, message] of Object.entries(errorMessages)) {
        if (errorMsg.includes(key) || errorCode === key) {
            return message;
        }
    }

    // Generic error message
    return errorMsg || 'Yayın hatası oluştu. Lütfen tekrar deneyin.';
}

/**
 * Show Error to User
 */
function showErrorToUser(errorMessage, error) {
    // Update status
    updateStatus(`❌ ${errorMessage}`);

    // Show notification
    showNotification(errorMessage, 'error', 10000);

    // Show error details (if needed)
    if (error && error.code) {
        console.error('Error details:', {
            code: error.code,
            message: error.msg || error.message,
            error: error
        });
    }
}

/**
 * Show Notification
 */
function showNotification(message, type = 'info', duration = 5000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    // Add to page
    let notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    notificationContainer.appendChild(notification);

    // Auto remove
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

/**
 * Log Error
 */
function logError(type, error) {
    // Log to console
    console.error(`[${type}]`, error);

    // Send to backend (if available)
    if (typeof getAPIBaseURL === 'function') {
        try {
            fetch(`${getAPIBaseURL()}/errors/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: type,
                    error: error,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                })
            }).catch(err => console.warn('Error logging failed:', err));
        } catch (err) {
            console.warn('Error logging error:', err);
        }
    }
}

/**
 * Export functions for use in live-stream.js
 */
if (typeof window !== 'undefined') {
    window.agoraEnhancements = {
        setupNetworkQualityMonitoring,
        setupStreamInterruptionRecovery,
        setupStreamHealthMonitoring,
        setupEnhancedErrorHandling,
        adaptStreamQuality,
        applyStreamQuality,
        getNetworkQualityLabel,
        getErrorMessage,
        showNotification,
        networkQualityStats: () => networkQualityStats,
        streamHealthMetrics: () => streamHealthMetrics,
        streamQualitySettings: () => streamQualitySettings
    };
}

console.log('✅ Agora Live Streaming Enhancements yüklendi');

