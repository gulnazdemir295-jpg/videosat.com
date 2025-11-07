/**
 * Toast Notification Service
 * Unified notification system with queueing and auto-dismiss
 */

(function() {
    'use strict';

    const DEFAULT_DURATION = 5000;
    const TYPE_TITLES = {
        success: 'Başarılı',
        error: 'Hata',
        warning: 'Uyarı',
        info: 'Bilgi'
    };

    class ToastService {
        constructor() {
            this.container = null;
            this.queue = [];
            this.activeToasts = new Map();
            this.maxVisible = 3;
            this.isEnabled = this.getInitialEnabledState();
            this.init();
        }

        init() {
            if (this.isEnabled) {
                this.ensureContainer();
            }
            // Override legacy showAlert if defined
            if (window.showAlert) {
                window.legacyShowAlert = window.showAlert.bind(window);
            }
            window.showAlert = this.show.bind(this);
            window.showToast = this.show.bind(this);

            window.toastService = this;
            console.log('✅ Toast Service initialized');
        }

        ensureContainer() {
            if (this.container) return;
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }

        getInitialEnabledState() {
            const bodyAttr = document.body?.dataset?.toastEnabled;
            if (typeof bodyAttr === 'string') {
                return bodyAttr.toLowerCase() === 'true';
            }
            return true;
        }

        setEnabled(enabled) {
            const shouldEnable = Boolean(enabled);
            if (shouldEnable === this.isEnabled) {
                return;
            }

            this.isEnabled = shouldEnable;
            if (this.isEnabled) {
                this.ensureContainer();
            } else {
                this.clearAll();
                if (this.container && this.container.parentNode) {
                    this.container.parentNode.removeChild(this.container);
                }
                this.container = null;
            }
        }

        show(message, type = 'info', options = {}) {
            if (!message) return;

            if (!this.isEnabled && !options.force) {
                const logMethod = type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log';
                console[logMethod](`[Toast:${type}] ${message}`);
                return;
            }

            const toastOptions = {
                type,
                duration: options.duration ?? DEFAULT_DURATION,
                title: options.title || TYPE_TITLES[type] || TYPE_TITLES.info,
                icon: options.icon || this.getIcon(type),
                pauseOnHover: options.pauseOnHover !== false,
                allowClose: options.allowClose !== false,
                progress: options.progress !== false,
                id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            };

            const toastData = { message, options: toastOptions };

            if (this.activeToasts.size >= this.maxVisible) {
                this.queue.push(toastData);
            } else {
                this.renderToast(toastData);
            }
        }

        renderToast({ message, options }) {
            this.ensureContainer();

            const toast = document.createElement('div');
            toast.className = `toast toast-${options.type}`;
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', options.type === 'error' ? 'assertive' : 'polite');
            toast.dataset.toastId = options.id;

            toast.innerHTML = `
                <span class="toast-icon"><i class="fas fa-${options.icon}"></i></span>
                <div class="toast-content">
                    <span class="toast-title">${options.title}</span>
                    <span class="toast-message">${message}</span>
                </div>
                ${options.allowClose ? '<button class="toast-close" aria-label="Kapat"><i class="fas fa-times"></i></button>' : ''}
                ${options.progress ? '<div class="toast-progress"><div class="toast-progress-bar"></div></div>' : ''}
            `;

            this.container.appendChild(toast);
            requestAnimationFrame(() => toast.classList.add('show'));

            const toastRecord = {
                element: toast,
                options,
                timeoutId: null,
                remaining: options.duration,
                startTime: Date.now(),
                paused: false
            };

            this.activeToasts.set(options.id, toastRecord);

            if (options.allowClose) {
                toast.querySelector('.toast-close').addEventListener('click', () => {
                    this.dismissToast(options.id);
                });
            }

            if (options.pauseOnHover) {
                toast.addEventListener('mouseenter', () => this.pauseToast(options.id));
                toast.addEventListener('mouseleave', () => this.resumeToast(options.id));
            }

            this.startCountdown(toastRecord);
        }

        startCountdown(toastRecord) {
            if (toastRecord.options.duration === 0) return;

            const updateProgress = () => {
                if (!toastRecord.element || toastRecord.paused) return;

                const elapsed = Date.now() - toastRecord.startTime;
                toastRecord.remaining = Math.max(0, toastRecord.options.duration - elapsed);

                const progressBar = toastRecord.element.querySelector('.toast-progress-bar');
                if (progressBar) {
                    const progress = toastRecord.remaining / toastRecord.options.duration;
                    progressBar.style.transform = `scaleX(${progress})`;
                }

                if (toastRecord.remaining <= 0) {
                    this.dismissToast(toastRecord.options.id);
                } else {
                    toastRecord.timeoutId = requestAnimationFrame(updateProgress);
                }
            };

            toastRecord.timeoutId = requestAnimationFrame(updateProgress);
        }

        pauseToast(id) {
            const toast = this.activeToasts.get(id);
            if (!toast || toast.paused) return;

            toast.paused = true;
            toast.remaining = Math.max(0, toast.options.duration - (Date.now() - toast.startTime));
            if (toast.timeoutId) {
                cancelAnimationFrame(toast.timeoutId);
                toast.timeoutId = null;
            }
        }

        resumeToast(id) {
            const toast = this.activeToasts.get(id);
            if (!toast || !toast.paused) return;

            toast.paused = false;
            toast.startTime = Date.now();
            this.startCountdown(toast);
        }

        dismissToast(id) {
            const toast = this.activeToasts.get(id);
            if (!toast) return;

            if (toast.timeoutId) {
                cancelAnimationFrame(toast.timeoutId);
            }

            const element = toast.element;
            element.classList.add('hide');
            element.addEventListener('animationend', () => {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, { once: true });

            this.activeToasts.delete(id);
            this.maybeShowNextToast();
        }

        maybeShowNextToast() {
            if (!this.isEnabled) {
                this.queue = [];
                return;
            }
            if (this.queue.length === 0 || this.activeToasts.size >= this.maxVisible) {
                return;
            }

            const next = this.queue.shift();
            if (next) {
                this.renderToast(next);
            }
        }

        clearAll() {
            this.queue = [];
            const ids = Array.from(this.activeToasts.keys());
            ids.forEach(id => this.dismissToast(id));
            this.activeToasts.clear();
        }

        getIcon(type) {
            switch (type) {
                case 'success':
                    return 'check-circle';
                case 'error':
                    return 'exclamation-circle';
                case 'warning':
                    return 'exclamation-triangle';
                default:
                    return 'info-circle';
            }
        }
    }

    new ToastService();
})();
