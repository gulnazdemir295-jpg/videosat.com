/**
 * Platform Detection Service
 * Detects iOS, Android, and other platforms for platform-specific optimizations
 */

(function() {
    'use strict';

    // Platform detection
    const platform = {
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
        isAndroid: /Android/.test(navigator.userAgent),
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isTablet: /iPad|Android/.test(navigator.userAgent) && window.innerWidth >= 768,
        isDesktop: !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)),
        isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
        isChrome: /Chrome/.test(navigator.userAgent),
        isFirefox: /Firefox/.test(navigator.userAgent),
        isEdge: /Edge/.test(navigator.userAgent)
    };

    // Add platform classes to body
    function addPlatformClasses() {
        const body = document.body;
        
        if (platform.isIOS) {
            body.classList.add('ios', 'mobile');
        }
        if (platform.isAndroid) {
            body.classList.add('android', 'mobile');
        }
        if (platform.isTablet) {
            body.classList.add('tablet');
        }
        if (platform.isDesktop) {
            body.classList.add('desktop');
        }
        if (platform.isSafari) {
            body.classList.add('safari');
        }
        if (platform.isChrome) {
            body.classList.add('chrome');
        }
        if (platform.isFirefox) {
            body.classList.add('firefox');
        }
        if (platform.isEdge) {
            body.classList.add('edge');
        }
    }

    // iOS Specific Features
    function initIOSFeatures() {
        if (!platform.isIOS) return;

        // Fix viewport height on iOS
        function setViewportHeight() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }

        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', setViewportHeight);

        // Prevent bounce scroll
        document.body.style.overscrollBehaviorY = 'none';

        // Handle status bar
        if (window.navigator.standalone) {
            document.body.classList.add('standalone');
        }
    }

    // Android Specific Features
    function initAndroidFeatures() {
        if (!platform.isAndroid) return;

        // Handle back button
        window.addEventListener('popstate', function(event) {
            const modals = document.querySelectorAll('.modal[style*="display: block"]');
            if (modals.length > 0) {
                event.preventDefault();
                modals.forEach(modal => {
                    modal.style.display = 'none';
                });
                window.history.pushState(null, null, window.location.href);
            }
        });

        // Push state for back button
        window.history.pushState(null, null, window.location.href);

        // Handle Android share
        if (navigator.share) {
            // Share API is available
            document.body.classList.add('share-api-available');
        }
    }

    // Screen Wake Lock (for video playback)
    let wakeLock = null;
    async function requestWakeLock() {
        if ('wakeLock' in navigator && platform.isMobile) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log('✅ Screen wake lock activated');
                
                wakeLock.addEventListener('release', () => {
                    console.log('Screen wake lock released');
                });
            } catch (err) {
                console.warn('Wake lock error:', err);
            }
        }
    }

    async function releaseWakeLock() {
        if (wakeLock) {
            await wakeLock.release();
            wakeLock = null;
            console.log('Screen wake lock released');
        }
    }

    // Vibration API (for haptic feedback)
    function vibrate(pattern) {
        if ('vibrate' in navigator && platform.isMobile) {
            navigator.vibrate(pattern);
        }
    }

    // Network Status
    function initNetworkStatus() {
        function updateNetworkStatus() {
            const isOnline = navigator.onLine;
            document.body.classList.toggle('online', isOnline);
            document.body.classList.toggle('offline', !isOnline);
            
            if (!isOnline) {
                console.log('📴 Offline mode');
                // Show offline indicator
                showOfflineIndicator();
            } else {
                console.log('📶 Online mode');
                hideOfflineIndicator();
            }
        }

        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
        updateNetworkStatus();
    }

    function showOfflineIndicator() {
        let indicator = document.getElementById('offline-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.innerHTML = '<i class="fas fa-wifi"></i> Offline Modu';
            indicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #f59e0b;
                color: white;
                padding: 0.75rem;
                text-align: center;
                z-index: 10000;
                font-weight: 600;
            `;
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'block';
    }

    function hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    // Battery API
    function initBatteryStatus() {
        if ('getBattery' in navigator && platform.isMobile) {
            navigator.getBattery().then(battery => {
                function updateBatteryStatus() {
                    const level = battery.level * 100;
                    const charging = battery.charging;
                    
                    document.body.classList.toggle('low-battery', level < 20 && !charging);
                    document.body.classList.toggle('charging', charging);
                    
                    // Reduce video quality on low battery
                    if (level < 20 && !charging) {
                        document.body.classList.add('battery-saver-mode');
                    }
                }

                battery.addEventListener('chargingchange', updateBatteryStatus);
                battery.addEventListener('levelchange', updateBatteryStatus);
                updateBatteryStatus();
            });
        }
    }

    // Device Orientation
    function initDeviceOrientation() {
        if (window.DeviceOrientationEvent && platform.isMobile) {
            window.addEventListener('deviceorientation', function(event) {
                // Handle orientation changes
                const orientation = window.orientation;
                document.body.classList.toggle('portrait', Math.abs(orientation) === 0 || Math.abs(orientation) === 180);
                document.body.classList.toggle('landscape', Math.abs(orientation) === 90 || Math.abs(orientation) === -90);
            });
        }

        // Orientation change
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        });
    }

    // Initialize all features
    function init() {
        addPlatformClasses();
        initIOSFeatures();
        initAndroidFeatures();
        initNetworkStatus();
        initBatteryStatus();
        initDeviceOrientation();

        console.log('✅ Platform Detection initialized:', platform);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export platform detection
    window.platformDetection = {
        platform: platform,
        requestWakeLock: requestWakeLock,
        releaseWakeLock: releaseWakeLock,
        vibrate: vibrate
    };

    // Global platform variable
    window.isIOS = platform.isIOS;
    window.isAndroid = platform.isAndroid;
    window.isMobile = platform.isMobile;

})();

