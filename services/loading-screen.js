/**
 * Loading Screen Service
 * Manages page loading screen visibility
 */

(function() {
    'use strict';

    let loadingScreen = null;
    let minimumDisplayTime = 500; // Minimum display time in ms
    let startTime = Date.now();

    /**
     * Initialize loading screen
     */
    function init() {
        loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) {
            // Create loading screen if it doesn't exist
            loadingScreen = document.createElement('div');
            loadingScreen.id = 'loadingScreen';
            loadingScreen.className = 'loading-screen';
            loadingScreen.innerHTML = '<div class="loading-spinner"></div>';
            document.body.appendChild(loadingScreen);
        }
        
        startTime = Date.now();
    }

    /**
     * Hide loading screen
     */
    function hide() {
        if (!loadingScreen) {
            init();
        }
        
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minimumDisplayTime - elapsed);
        
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transition = 'opacity 0.3s ease-out';
                
                setTimeout(() => {
                    if (loadingScreen && loadingScreen.parentNode) {
                        loadingScreen.style.display = 'none';
                    }
                }, 300);
            }
        }, remainingTime);
    }

    /**
     * Show loading screen
     */
    function show() {
        if (!loadingScreen) {
            init();
        }
        
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.style.opacity = '1';
            startTime = Date.now();
        }
    }

    /**
     * Check if page is loaded
     */
    function checkPageLoaded() {
        if (document.readyState === 'complete') {
            // Wait for all critical scripts
            if (window.scriptLoader && typeof window.scriptLoader.loadScripts === 'function') {
                // Scripts are loading, wait for them
                return;
            }
            
            // Wait a bit more for async operations
            setTimeout(hide, 300);
        } else {
            window.addEventListener('load', function() {
                setTimeout(hide, 300);
            });
        }
    }

    /**
     * Initialize when DOM is ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            init();
            checkPageLoaded();
        });
    } else {
        init();
        checkPageLoaded();
    }

    // Also hide when all scripts are loaded
    window.addEventListener('load', function() {
        setTimeout(hide, 500);
    });

    // Export
    window.loadingScreen = {
        show: show,
        hide: hide,
        init: init
    };

})();

