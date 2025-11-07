/**
 * Mobile Form Handler
 * Handles mobile-specific form optimizations:
 * - Keyboard handling
 * - Input focus management
 * - Scroll optimization
 * - Auto-complete enhancements
 */

(function() {
    'use strict';

    // Initialize mobile form handlers
    function initMobileFormHandlers() {
        // Handle input focus for mobile
        setupInputFocusHandlers();
        
        // Handle keyboard show/hide
        setupKeyboardHandlers();
        
        // Handle form submission on mobile
        setupFormSubmissionHandlers();
        
        // Handle input type optimizations
        optimizeInputTypes();
    }

    // Setup input focus handlers
    function setupInputFocusHandlers() {
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Focus event - scroll into view on mobile
            input.addEventListener('focus', function(e) {
                if (isMobileDevice()) {
                    // Small delay to allow keyboard to appear
                    setTimeout(() => {
                        scrollInputIntoView(e.target);
                    }, 300);
                }
            });
            
            // Blur event - reset scroll if needed
            input.addEventListener('blur', function(e) {
                // Optional: Reset scroll position if needed
                // This can be customized based on requirements
            });
        });
    }

    // Scroll input into view on mobile
    function scrollInputIntoView(input) {
        const inputRect = input.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const inputBottom = inputRect.bottom;
        const keyboardHeight = viewportHeight * 0.4; // Estimate keyboard height
        
        // If input is covered by keyboard, scroll it into view
        if (inputBottom > viewportHeight - keyboardHeight) {
            input.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }
    }

    // Setup keyboard handlers
    function setupKeyboardHandlers() {
        // Detect virtual keyboard visibility
        let viewportHeight = window.innerHeight;
        
        window.addEventListener('resize', function() {
            const newHeight = window.innerHeight;
            const heightDiff = viewportHeight - newHeight;
            
            // If height decreased significantly, keyboard is likely open
            if (heightDiff > 150 && isMobileDevice()) {
                handleKeyboardOpen();
            } else if (heightDiff < -50) {
                handleKeyboardClose();
            }
            
            viewportHeight = newHeight;
        });
    }

    // Handle keyboard open
    function handleKeyboardOpen() {
        const activeInput = document.activeElement;
        if (activeInput && (activeInput.tagName === 'INPUT' || activeInput.tagName === 'TEXTAREA')) {
            // Adjust modal position if input is in modal
            const modal = activeInput.closest('.modal');
            if (modal) {
                adjustModalForKeyboard(modal, activeInput);
            }
        }
    }

    // Handle keyboard close
    function handleKeyboardClose() {
        // Reset any modal adjustments
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.transform = '';
            modal.style.marginTop = '';
        });
    }

    // Adjust modal position when keyboard is open
    function adjustModalForKeyboard(modal, input) {
        const inputRect = input.getBoundingClientRect();
        const modalRect = modal.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const keyboardHeight = viewportHeight * 0.4;
        
        // Calculate if input is covered by keyboard
        if (inputRect.bottom > viewportHeight - keyboardHeight) {
            const scrollOffset = inputRect.bottom - (viewportHeight - keyboardHeight) + 20;
            const currentTransform = modal.style.transform || 'translateY(0)';
            
            // Adjust modal scroll or transform
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.scrollTop += scrollOffset;
            }
        }
    }

    // Setup form submission handlers
    function setupFormSubmissionHandlers() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                // Hide keyboard on mobile after form submission
                if (isMobileDevice()) {
                    const activeInput = document.activeElement;
                    if (activeInput && (activeInput.tagName === 'INPUT' || activeInput.tagName === 'TEXTAREA')) {
                        activeInput.blur();
                    }
                }
            });
        });
    }

    // Optimize input types for mobile
    function optimizeInputTypes() {
        // Add inputmode attributes if not present
        const telInputs = document.querySelectorAll('input[type="tel"]');
        telInputs.forEach(input => {
            if (!input.hasAttribute('inputmode')) {
                input.setAttribute('inputmode', 'numeric');
            }
            if (!input.hasAttribute('pattern')) {
                input.setAttribute('pattern', '[0-9]*');
            }
        });

        // Ensure email inputs have proper inputmode
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            if (!input.hasAttribute('inputmode')) {
                input.setAttribute('inputmode', 'email');
            }
        });

        // Ensure text inputs have proper autocomplete
        const textInputs = document.querySelectorAll('input[type="text"]');
        textInputs.forEach(input => {
            const name = input.name || input.id || '';
            if (name.toLowerCase().includes('name') && !input.hasAttribute('autocomplete')) {
                input.setAttribute('autocomplete', 'name');
            }
        });
    }

    // Check if device is mobile
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768 && 'ontouchstart' in window);
    }

    // Handle Enter key in forms (next input focus)
    function setupEnterKeyNavigation() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                const activeElement = document.activeElement;
                
                // Skip if it's a textarea (Enter should create new line)
                if (activeElement.tagName === 'TEXTAREA') {
                    return;
                }
                
                // Skip if it's a submit button
                if (activeElement.type === 'submit' || activeElement.tagName === 'BUTTON') {
                    return;
                }
                
                // Find next input
                if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT') {
                    const form = activeElement.closest('form');
                    if (form) {
                        const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
                        const currentIndex = inputs.indexOf(activeElement);
                        const nextInput = inputs[currentIndex + 1];
                        
                        if (nextInput && !nextInput.disabled) {
                            e.preventDefault();
                            nextInput.focus();
                            
                            // Scroll into view on mobile
                            if (isMobileDevice()) {
                                setTimeout(() => {
                                    scrollInputIntoView(nextInput);
                                }, 100);
                            }
                        }
                    }
                }
            }
        });
    }

    // Prevent form zoom on iOS (double-tap zoom prevention)
    function preventDoubleTapZoom() {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initMobileFormHandlers();
            setupEnterKeyNavigation();
            preventDoubleTapZoom();
        });
    } else {
        initMobileFormHandlers();
        setupEnterKeyNavigation();
        preventDoubleTapZoom();
    }

    // Export functions for global use
    window.mobileFormHandler = {
        scrollInputIntoView: scrollInputIntoView,
        isMobileDevice: isMobileDevice
    };

})();

