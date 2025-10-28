// File Upload Service - Mock AWS S3 Integration
class FileUploadService {
    constructor() {
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        this.uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    }

    // Upload file (mock S3 upload)
    async uploadFile(file, folder = 'uploads') {
        try {
            // Validate file
            const validation = this.validateFile(file);
            if (!validation.valid) {
                return { success: false, message: validation.message };
            }

            // Show progress
            console.log(`📤 Uploading ${file.name}...`);

            // Simulate S3 upload with progress
            const url = await this.simulateUpload(file, folder);

            const fileData = {
                id: this.generateId(),
                name: file.name,
                size: file.size,
                type: file.type,
                url: url,
                folder: folder,
                uploadedAt: new Date().toISOString(),
                uploadedBy: this.getCurrentUserId()
            };

            this.uploadedFiles.push(fileData);
            this.saveFiles();

            console.log('✅ File uploaded successfully');
            return { success: true, file: fileData };
        } catch (error) {
            console.error('Upload error:', error);
            return { success: false, message: error.message };
        }
    }

    // Validate file
    validateFile(file) {
        if (!file) {
            return { valid: false, message: 'No file selected' };
        }

        if (file.size > this.maxFileSize) {
            return { valid: false, message: `File size exceeds ${this.maxFileSize / 1024 / 1024}MB` };
        }

        if (!this.allowedTypes.includes(file.type)) {
            return { valid: false, message: 'File type not allowed' };
        }

        return { valid: true };
    }

    // Simulate S3 upload
    async simulateUpload(file, folder) {
        // Simulate progress
        const steps = 10;
        for (let i = 0; i < steps; i++) {
            await this.delay(100);
            const progress = ((i + 1) / steps) * 100;
            console.log(`Upload progress: ${progress.toFixed(0)}%`);
        }

        // Generate mock URL
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const fileName = `${timestamp}-${file.name}`;
        
        return `https://s3.amazonaws.com/videosat/${folder}/${fileName}`;
    }

    // Upload multiple files
    async uploadFiles(files, folder = 'uploads') {
        const results = [];
        for (const file of files) {
            const result = await this.uploadFile(file, folder);
            results.push(result);
        }
        return results;
    }

    // Delete file
    async deleteFile(fileId) {
        const fileIndex = this.uploadedFiles.findIndex(f => f.id === fileId);
        if (fileIndex === -1) {
            return { success: false, message: 'File not found' };
        }

        // In real app, would call S3 delete API
        this.uploadedFiles.splice(fileIndex, 1);
        this.saveFiles();

        console.log('✅ File deleted successfully');
        return { success: true };
    }

    // Get uploaded files
    getUploadedFiles(folder = null) {
        if (folder) {
            return this.uploadedFiles.filter(f => f.folder === folder);
        }
        return this.uploadedFiles;
    }

    // Generate file preview URL
    generatePreviewUrl(file) {
        if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file);
        }
        return null;
    }

    // Get file size in readable format
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Save files to localStorage
    saveFiles() {
        localStorage.setItem('uploadedFiles', JSON.stringify(this.uploadedFiles));
    }

    // Generate ID
    generateId() {
        return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get current user ID
    getCurrentUserId() {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return user.id || 'anonymous';
    }

    // Delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get upload statistics
    getStatistics() {
        const totalSize = this.uploadedFiles.reduce((sum, f) => sum + f.size, 0);
        const byType = this.uploadedFiles.reduce((acc, f) => {
            const type = f.type.split('/')[0];
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        return {
            total: this.uploadedFiles.length,
            totalSize: this.formatFileSize(totalSize),
            byType: byType
        };
    }
}

// Export file upload service instance
const fileUploadService = new FileUploadService();
window.fileUploadService = fileUploadService;

console.log('✅ File Upload Service initialized (S3 mock)');

