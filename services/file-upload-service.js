/**
 * File Upload Service
 * Dosya yükleme, görsel optimizasyon, compression
 */

class FileUploadService {
    constructor() {
        this.apiUrl = window.getAPIBaseURL ? window.getAPIBaseURL() : '/api';
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        this.allowedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        this.maxImageWidth = 1920;
        this.maxImageHeight = 1080;
        this.imageQuality = 0.85;
        
        console.log('✅ File Upload Service initialized');
    }

    /**
     * Upload file
     */
    async uploadFile(file, options = {}) {
        const {
            type = 'image',
            folder = 'uploads',
            compress = true,
            resize = true,
            onProgress = null
        } = options;

        // Validate file
        const validation = this.validateFile(file, type);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // Process image if needed
        let processedFile = file;
        if (type === 'image' && (compress || resize)) {
            processedFile = await this.processImage(file, { compress, resize });
        }

        // Upload to backend
        return await this.uploadToBackend(processedFile, {
            type,
            folder,
            onProgress
        });
    }

    /**
     * Validate file
     */
    validateFile(file, type = 'image') {
        // Check file exists
        if (!file) {
            return { valid: false, error: 'Dosya seçilmedi' };
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            return { 
                valid: false, 
                error: `Dosya boyutu çok büyük. Maksimum: ${this.formatFileSize(this.maxFileSize)}` 
            };
        }

        // Check file type
        const allowedTypes = type === 'image' ? this.allowedImageTypes : this.allowedFileTypes;
        if (!allowedTypes.includes(file.type)) {
            return { 
                valid: false, 
                error: `Geçersiz dosya tipi. İzin verilen: ${allowedTypes.join(', ')}` 
            };
        }

        return { valid: true };
    }

    /**
     * Process image (compress and resize)
     */
    async processImage(file, options = {}) {
        const { compress = true, resize = true } = options;

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if needed
                    if (resize && (width > this.maxImageWidth || height > this.maxImageHeight)) {
                        const ratio = Math.min(
                            this.maxImageWidth / width,
                            this.maxImageHeight / height
                        );
                        width = width * ratio;
                        height = height * ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to blob
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Görsel işleme hatası'));
                                return;
                            }

                            // Create new file with same name
                            const processedFile = new File(
                                [blob],
                                file.name,
                                { type: file.type, lastModified: Date.now() }
                            );

                            resolve(processedFile);
                        },
                        file.type,
                        compress ? this.imageQuality : 1.0
                    );
                };

                img.onerror = () => {
                    reject(new Error('Görsel yüklenemedi'));
                };

                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error('Dosya okunamadı'));
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Upload to backend
     */
    async uploadToBackend(file, options = {}) {
        const { type, folder, onProgress } = options;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('folder', folder);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Progress tracking
            if (onProgress) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percent = (e.loaded / e.total) * 100;
                        onProgress(percent);
                    }
                });
            }

            // Success
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (err) {
                        resolve({ url: xhr.responseText });
                    }
                } else {
                    reject(new Error(`Upload failed: ${xhr.status}`));
                }
            });

            // Error
            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed: Network error'));
            });

            // Abort
            xhr.addEventListener('abort', () => {
                reject(new Error('Upload cancelled'));
            });

            xhr.open('POST', `${this.apiUrl}/upload`);
            xhr.send(formData);
        });
    }

    /**
     * Upload multiple files
     */
    async uploadMultiple(files, options = {}) {
        const results = [];
        const errors = [];

        for (let i = 0; i < files.length; i++) {
            try {
                const result = await this.uploadFile(files[i], {
                    ...options,
                    onProgress: (percent) => {
                        if (options.onProgress) {
                            options.onProgress(i, files.length, percent);
                        }
                    }
                });
                results.push(result);
            } catch (error) {
                errors.push({ file: files[i].name, error: error.message });
            }
        }

        return { results, errors };
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Get image dimensions
     */
    async getImageDimensions(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    resolve({
                        width: img.width,
                        height: img.height
                    });
                };

                img.onerror = () => {
                    reject(new Error('Görsel yüklenemedi'));
                };

                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error('Dosya okunamadı'));
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Create thumbnail
     */
    async createThumbnail(file, maxWidth = 200, maxHeight = 200) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate thumbnail dimensions
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to blob
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Thumbnail oluşturulamadı'));
                                return;
                            }

                            const thumbnailFile = new File(
                                [blob],
                                `thumb_${file.name}`,
                                { type: file.type, lastModified: Date.now() }
                            );

                            resolve(thumbnailFile);
                        },
                        file.type,
                        0.8
                    );
                };

                img.onerror = () => {
                    reject(new Error('Görsel yüklenemedi'));
                };

                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error('Dosya okunamadı'));
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Preview image
     */
    async previewImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };

            reader.onerror = () => {
                reject(new Error('Dosya okunamadı'));
            };

            reader.readAsDataURL(file);
        });
    }
}

// Export
const fileUploadService = new FileUploadService();
window.fileUploadService = fileUploadService;

console.log('✅ File Upload Service initialized');
