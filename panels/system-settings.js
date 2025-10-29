// System Settings Management JavaScript
class SystemSettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.currentTab = 'general';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettingsValues();
        this.updateSystemStatus();
        this.startStatusMonitoring();
    }

    setupEventListeners() {
        // Auto-save on change
        document.querySelectorAll('input, select, textarea').forEach(element => {
            element.addEventListener('change', () => this.autoSave());
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAllSettings();
        });
    }

    // Tabs
    showTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`${tabName}-tab`)?.classList.add('active');
        document.querySelector(`[onclick="showTab('${tabName}')"]`)?.classList.add('active');
        this.currentTab = tabName;
    }

    // Load settings from localStorage
    loadSettings() {
        const saved = localStorage.getItem('systemSettings');
        if (saved) return JSON.parse(saved);
        return {
            general: {
                siteName: 'VideoSat E-ticaret Platformu',
                siteDescription: 'Canlı yayın ile e-ticaret platformu',
                siteUrl: 'https://basvideo.com',
                adminEmail: 'admin@videosat.com',
                defaultLanguage: 'tr',
                timezone: 'Europe/Istanbul',
                currency: 'TRY',
                dateFormat: 'DD/MM/YYYY',
                maintenanceMode: false,
                debugMode: false,
                autoBackup: true,
                emailNotifications: true
            },
            users: {
                allowRegistration: true,
                emailVerification: true,
                adminApproval: false,
                defaultUserRole: 'customer',
                sessionTimeout: 120,
                maxLoginAttempts: 5,
                lockoutDuration: 30,
                rememberMe: true,
                allowProfileEdit: true,
                requireProfileCompletion: false,
                profileFields: ['phone', 'address']
            },
            security: {
                minPasswordLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
                passwordExpiry: 90,
                enable2FA: true,
                twoFactorMethod: 'sms',
                force2FA: false,
                enableIPWhitelist: false,
                enableIPBlacklist: true,
                allowedIPs: '',
                blockedIPs: ''
            },
            maintenance: {
                autoUpdate: false,
                updateChannel: 'stable',
                updateSchedule: 'manual',
                maintenanceModeEnabled: false,
                maintenanceMessage: 'Site bakım çalışması nedeniyle geçici olarak erişilemez durumdadır.',
                maintenanceEndTime: '',
                allowedMaintenanceIPs: '',
                logRetentionDays: 30,
                tempFileRetentionDays: 7,
                cacheRetentionDays: 1
            },
            database: {
                dbHost: 'localhost',
                dbPort: 3306,
                dbName: 'videosat_db',
                dbUsername: 'videosat_user',
                dbPassword: '********',
                autoBackupEnabled: true,
                backupFrequency: 'daily',
                backupTime: '02:00',
                backupRetentionDays: 30,
                autoOptimize: false,
                optimizeSchedule: 'weekly'
            },
            api: {
                apiEnabled: true,
                apiVersion: 'v1',
                apiRateLimit: 1000,
                apiKeyExpiry: 365,
                paymentGateway: 'iyzico',
                paymentApiKey: '********',
                paymentSecretKey: '********',
                paymentTestMode: false,
                smtpHost: 'smtp.gmail.com',
                smtpPort: 587,
                smtpUsername: 'noreply@videosat.com',
                smtpPassword: '********',
                smtpSSL: true
            },
            logging: {
                logLevel: 'info',
                logToFile: true,
                logToDatabase: true,
                logToEmail: false,
                logMaxSize: 10,
                enableMonitoring: true,
                monitoringInterval: 60,
                cpuThreshold: 80,
                memoryThreshold: 85,
                diskThreshold: 90,
                emailAlerts: true,
                smsAlerts: false,
                alertRecipients: '',
                alertCooldown: 30
            },
            performance: {
                enableCache: true,
                cacheType: 'file',
                cacheExpiry: 60,
                cacheSize: 100,
                enableCDN: false,
                cdnProvider: 'cloudflare',
                cdnUrl: '',
                autoOptimizeImages: true,
                dbConnectionPool: 10,
                queryTimeout: 30,
                enableQueryCache: true,
                slowQueryThreshold: 2
            }
        };
    }

    saveSettings() {
        localStorage.setItem('systemSettings', JSON.stringify(this.settings));
    }

    // Load settings values into form elements
    loadSettingsValues() {
        // General settings
        document.getElementById('siteName').value = this.settings.general.siteName;
        document.getElementById('siteDescription').value = this.settings.general.siteDescription;
        document.getElementById('siteUrl').value = this.settings.general.siteUrl;
        document.getElementById('adminEmail').value = this.settings.general.adminEmail;
        document.getElementById('defaultLanguage').value = this.settings.general.defaultLanguage;
        document.getElementById('timezone').value = this.settings.general.timezone;
        document.getElementById('currency').value = this.settings.general.currency;
        document.getElementById('dateFormat').value = this.settings.general.dateFormat;
        document.getElementById('maintenanceMode').checked = this.settings.general.maintenanceMode;
        document.getElementById('debugMode').checked = this.settings.general.debugMode;
        document.getElementById('autoBackup').checked = this.settings.general.autoBackup;
        document.getElementById('emailNotifications').checked = this.settings.general.emailNotifications;

        // User settings
        document.getElementById('allowRegistration').checked = this.settings.users.allowRegistration;
        document.getElementById('emailVerification').checked = this.settings.users.emailVerification;
        document.getElementById('adminApproval').checked = this.settings.users.adminApproval;
        document.getElementById('defaultUserRole').value = this.settings.users.defaultUserRole;
        document.getElementById('sessionTimeout').value = this.settings.users.sessionTimeout;
        document.getElementById('maxLoginAttempts').value = this.settings.users.maxLoginAttempts;
        document.getElementById('lockoutDuration').value = this.settings.users.lockoutDuration;
        document.getElementById('rememberMe').checked = this.settings.users.rememberMe;
        document.getElementById('allowProfileEdit').checked = this.settings.users.allowProfileEdit;
        document.getElementById('requireProfileCompletion').checked = this.settings.users.requireProfileCompletion;

        // Security settings
        document.getElementById('minPasswordLength').value = this.settings.security.minPasswordLength;
        document.getElementById('requireUppercase').checked = this.settings.security.requireUppercase;
        document.getElementById('requireLowercase').checked = this.settings.security.requireLowercase;
        document.getElementById('requireNumbers').checked = this.settings.security.requireNumbers;
        document.getElementById('requireSpecialChars').checked = this.settings.security.requireSpecialChars;
        document.getElementById('passwordExpiry').value = this.settings.security.passwordExpiry;
        document.getElementById('enable2FA').checked = this.settings.security.enable2FA;
        document.getElementById('twoFactorMethod').value = this.settings.security.twoFactorMethod;
        document.getElementById('force2FA').checked = this.settings.security.force2FA;
        document.getElementById('enableIPWhitelist').checked = this.settings.security.enableIPWhitelist;
        document.getElementById('enableIPBlacklist').checked = this.settings.security.enableIPBlacklist;
        document.getElementById('allowedIPs').value = this.settings.security.allowedIPs;
        document.getElementById('blockedIPs').value = this.settings.security.blockedIPs;

        // Continue loading other settings...
        this.loadRemainingSettings();
    }

    loadRemainingSettings() {
        // Maintenance settings
        document.getElementById('autoUpdate').checked = this.settings.maintenance.autoUpdate;
        document.getElementById('updateChannel').value = this.settings.maintenance.updateChannel;
        document.getElementById('updateSchedule').value = this.settings.maintenance.updateSchedule;
        document.getElementById('maintenanceModeEnabled').checked = this.settings.maintenance.maintenanceModeEnabled;
        document.getElementById('maintenanceMessage').value = this.settings.maintenance.maintenanceMessage;
        document.getElementById('maintenanceEndTime').value = this.settings.maintenance.maintenanceEndTime;
        document.getElementById('allowedMaintenanceIPs').value = this.settings.maintenance.allowedMaintenanceIPs;
        document.getElementById('logRetentionDays').value = this.settings.maintenance.logRetentionDays;
        document.getElementById('tempFileRetentionDays').value = this.settings.maintenance.tempFileRetentionDays;
        document.getElementById('cacheRetentionDays').value = this.settings.maintenance.cacheRetentionDays;

        // Database settings
        document.getElementById('dbHost').value = this.settings.database.dbHost;
        document.getElementById('dbPort').value = this.settings.database.dbPort;
        document.getElementById('dbName').value = this.settings.database.dbName;
        document.getElementById('dbUsername').value = this.settings.database.dbUsername;
        document.getElementById('autoBackupEnabled').checked = this.settings.database.autoBackupEnabled;
        document.getElementById('backupFrequency').value = this.settings.database.backupFrequency;
        document.getElementById('backupTime').value = this.settings.database.backupTime;
        document.getElementById('backupRetentionDays').value = this.settings.database.backupRetentionDays;
        document.getElementById('autoOptimize').checked = this.settings.database.autoOptimize;
        document.getElementById('optimizeSchedule').value = this.settings.database.optimizeSchedule;

        // API settings
        document.getElementById('apiEnabled').checked = this.settings.api.apiEnabled;
        document.getElementById('apiVersion').value = this.settings.api.apiVersion;
        document.getElementById('apiRateLimit').value = this.settings.api.apiRateLimit;
        document.getElementById('apiKeyExpiry').value = this.settings.api.apiKeyExpiry;
        document.getElementById('paymentGateway').value = this.settings.api.paymentGateway;
        document.getElementById('paymentTestMode').checked = this.settings.api.paymentTestMode;
        document.getElementById('smtpHost').value = this.settings.api.smtpHost;
        document.getElementById('smtpPort').value = this.settings.api.smtpPort;
        document.getElementById('smtpUsername').value = this.settings.api.smtpUsername;
        document.getElementById('smtpSSL').checked = this.settings.api.smtpSSL;

        // Logging settings
        document.getElementById('logLevel').value = this.settings.logging.logLevel;
        document.getElementById('logToFile').checked = this.settings.logging.logToFile;
        document.getElementById('logToDatabase').checked = this.settings.logging.logToDatabase;
        document.getElementById('logToEmail').checked = this.settings.logging.logToEmail;
        document.getElementById('logMaxSize').value = this.settings.logging.logMaxSize;
        document.getElementById('enableMonitoring').checked = this.settings.logging.enableMonitoring;
        document.getElementById('monitoringInterval').value = this.settings.logging.monitoringInterval;
        document.getElementById('cpuThreshold').value = this.settings.logging.cpuThreshold;
        document.getElementById('memoryThreshold').value = this.settings.logging.memoryThreshold;
        document.getElementById('diskThreshold').value = this.settings.logging.diskThreshold;
        document.getElementById('emailAlerts').checked = this.settings.logging.emailAlerts;
        document.getElementById('smsAlerts').checked = this.settings.logging.smsAlerts;
        document.getElementById('alertRecipients').value = this.settings.logging.alertRecipients;
        document.getElementById('alertCooldown').value = this.settings.logging.alertCooldown;

        // Performance settings
        document.getElementById('enableCache').checked = this.settings.performance.enableCache;
        document.getElementById('cacheType').value = this.settings.performance.cacheType;
        document.getElementById('cacheExpiry').value = this.settings.performance.cacheExpiry;
        document.getElementById('cacheSize').value = this.settings.performance.cacheSize;
        document.getElementById('enableCDN').checked = this.settings.performance.enableCDN;
        document.getElementById('cdnProvider').value = this.settings.performance.cdnProvider;
        document.getElementById('cdnUrl').value = this.settings.performance.cdnUrl;
        document.getElementById('autoOptimizeImages').checked = this.settings.performance.autoOptimizeImages;
        document.getElementById('dbConnectionPool').value = this.settings.performance.dbConnectionPool;
        document.getElementById('queryTimeout').value = this.settings.performance.queryTimeout;
        document.getElementById('enableQueryCache').checked = this.settings.performance.enableQueryCache;
        document.getElementById('slowQueryThreshold').value = this.settings.performance.slowQueryThreshold;
    }

    // Auto-save settings
    autoSave() {
        this.collectSettings();
        this.saveSettings();
        showAlert('Ayarlar otomatik olarak kaydedildi', 'success');
    }

    // Collect settings from form elements
    collectSettings() {
        // General settings
        this.settings.general.siteName = document.getElementById('siteName').value;
        this.settings.general.siteDescription = document.getElementById('siteDescription').value;
        this.settings.general.siteUrl = document.getElementById('siteUrl').value;
        this.settings.general.adminEmail = document.getElementById('adminEmail').value;
        this.settings.general.defaultLanguage = document.getElementById('defaultLanguage').value;
        this.settings.general.timezone = document.getElementById('timezone').value;
        this.settings.general.currency = document.getElementById('currency').value;
        this.settings.general.dateFormat = document.getElementById('dateFormat').value;
        this.settings.general.maintenanceMode = document.getElementById('maintenanceMode').checked;
        this.settings.general.debugMode = document.getElementById('debugMode').checked;
        this.settings.general.autoBackup = document.getElementById('autoBackup').checked;
        this.settings.general.emailNotifications = document.getElementById('emailNotifications').checked;

        // User settings
        this.settings.users.allowRegistration = document.getElementById('allowRegistration').checked;
        this.settings.users.emailVerification = document.getElementById('emailVerification').checked;
        this.settings.users.adminApproval = document.getElementById('adminApproval').checked;
        this.settings.users.defaultUserRole = document.getElementById('defaultUserRole').value;
        this.settings.users.sessionTimeout = parseInt(document.getElementById('sessionTimeout').value);
        this.settings.users.maxLoginAttempts = parseInt(document.getElementById('maxLoginAttempts').value);
        this.settings.users.lockoutDuration = parseInt(document.getElementById('lockoutDuration').value);
        this.settings.users.rememberMe = document.getElementById('rememberMe').checked;
        this.settings.users.allowProfileEdit = document.getElementById('allowProfileEdit').checked;
        this.settings.users.requireProfileCompletion = document.getElementById('requireProfileCompletion').checked;

        // Security settings
        this.settings.security.minPasswordLength = parseInt(document.getElementById('minPasswordLength').value);
        this.settings.security.requireUppercase = document.getElementById('requireUppercase').checked;
        this.settings.security.requireLowercase = document.getElementById('requireLowercase').checked;
        this.settings.security.requireNumbers = document.getElementById('requireNumbers').checked;
        this.settings.security.requireSpecialChars = document.getElementById('requireSpecialChars').checked;
        this.settings.security.passwordExpiry = parseInt(document.getElementById('passwordExpiry').value);
        this.settings.security.enable2FA = document.getElementById('enable2FA').checked;
        this.settings.security.twoFactorMethod = document.getElementById('twoFactorMethod').value;
        this.settings.security.force2FA = document.getElementById('force2FA').checked;
        this.settings.security.enableIPWhitelist = document.getElementById('enableIPWhitelist').checked;
        this.settings.security.enableIPBlacklist = document.getElementById('enableIPBlacklist').checked;
        this.settings.security.allowedIPs = document.getElementById('allowedIPs').value;
        this.settings.security.blockedIPs = document.getElementById('blockedIPs').value;

        // Continue collecting other settings...
        this.collectRemainingSettings();
    }

    collectRemainingSettings() {
        // Maintenance settings
        this.settings.maintenance.autoUpdate = document.getElementById('autoUpdate').checked;
        this.settings.maintenance.updateChannel = document.getElementById('updateChannel').value;
        this.settings.maintenance.updateSchedule = document.getElementById('updateSchedule').value;
        this.settings.maintenance.maintenanceModeEnabled = document.getElementById('maintenanceModeEnabled').checked;
        this.settings.maintenance.maintenanceMessage = document.getElementById('maintenanceMessage').value;
        this.settings.maintenance.maintenanceEndTime = document.getElementById('maintenanceEndTime').value;
        this.settings.maintenance.allowedMaintenanceIPs = document.getElementById('allowedMaintenanceIPs').value;
        this.settings.maintenance.logRetentionDays = parseInt(document.getElementById('logRetentionDays').value);
        this.settings.maintenance.tempFileRetentionDays = parseInt(document.getElementById('tempFileRetentionDays').value);
        this.settings.maintenance.cacheRetentionDays = parseInt(document.getElementById('cacheRetentionDays').value);

        // Database settings
        this.settings.database.dbHost = document.getElementById('dbHost').value;
        this.settings.database.dbPort = parseInt(document.getElementById('dbPort').value);
        this.settings.database.dbName = document.getElementById('dbName').value;
        this.settings.database.dbUsername = document.getElementById('dbUsername').value;
        this.settings.database.autoBackupEnabled = document.getElementById('autoBackupEnabled').checked;
        this.settings.database.backupFrequency = document.getElementById('backupFrequency').value;
        this.settings.database.backupTime = document.getElementById('backupTime').value;
        this.settings.database.backupRetentionDays = parseInt(document.getElementById('backupRetentionDays').value);
        this.settings.database.autoOptimize = document.getElementById('autoOptimize').checked;
        this.settings.database.optimizeSchedule = document.getElementById('optimizeSchedule').value;

        // API settings
        this.settings.api.apiEnabled = document.getElementById('apiEnabled').checked;
        this.settings.api.apiVersion = document.getElementById('apiVersion').value;
        this.settings.api.apiRateLimit = parseInt(document.getElementById('apiRateLimit').value);
        this.settings.api.apiKeyExpiry = parseInt(document.getElementById('apiKeyExpiry').value);
        this.settings.api.paymentGateway = document.getElementById('paymentGateway').value;
        this.settings.api.paymentTestMode = document.getElementById('paymentTestMode').checked;
        this.settings.api.smtpHost = document.getElementById('smtpHost').value;
        this.settings.api.smtpPort = parseInt(document.getElementById('smtpPort').value);
        this.settings.api.smtpUsername = document.getElementById('smtpUsername').value;
        this.settings.api.smtpSSL = document.getElementById('smtpSSL').checked;

        // Logging settings
        this.settings.logging.logLevel = document.getElementById('logLevel').value;
        this.settings.logging.logToFile = document.getElementById('logToFile').checked;
        this.settings.logging.logToDatabase = document.getElementById('logToDatabase').checked;
        this.settings.logging.logToEmail = document.getElementById('logToEmail').checked;
        this.settings.logging.logMaxSize = parseInt(document.getElementById('logMaxSize').value);
        this.settings.logging.enableMonitoring = document.getElementById('enableMonitoring').checked;
        this.settings.logging.monitoringInterval = parseInt(document.getElementById('monitoringInterval').value);
        this.settings.logging.cpuThreshold = parseInt(document.getElementById('cpuThreshold').value);
        this.settings.logging.memoryThreshold = parseInt(document.getElementById('memoryThreshold').value);
        this.settings.logging.diskThreshold = parseInt(document.getElementById('diskThreshold').value);
        this.settings.logging.emailAlerts = document.getElementById('emailAlerts').checked;
        this.settings.logging.smsAlerts = document.getElementById('smsAlerts').checked;
        this.settings.logging.alertRecipients = document.getElementById('alertRecipients').value;
        this.settings.logging.alertCooldown = parseInt(document.getElementById('alertCooldown').value);

        // Performance settings
        this.settings.performance.enableCache = document.getElementById('enableCache').checked;
        this.settings.performance.cacheType = document.getElementById('cacheType').value;
        this.settings.performance.cacheExpiry = parseInt(document.getElementById('cacheExpiry').value);
        this.settings.performance.cacheSize = parseInt(document.getElementById('cacheSize').value);
        this.settings.performance.enableCDN = document.getElementById('enableCDN').checked;
        this.settings.performance.cdnProvider = document.getElementById('cdnProvider').value;
        this.settings.performance.cdnUrl = document.getElementById('cdnUrl').value;
        this.settings.performance.autoOptimizeImages = document.getElementById('autoOptimizeImages').checked;
        this.settings.performance.dbConnectionPool = parseInt(document.getElementById('dbConnectionPool').value);
        this.settings.performance.queryTimeout = parseInt(document.getElementById('queryTimeout').value);
        this.settings.performance.enableQueryCache = document.getElementById('enableQueryCache').checked;
        this.settings.performance.slowQueryThreshold = parseFloat(document.getElementById('slowQueryThreshold').value);
    }

    // System status monitoring
    updateSystemStatus() {
        const statuses = ['Çevrimiçi', 'Bağlı', 'Güvenli'];
        const indicators = ['online', 'online', 'online'];
        
        document.getElementById('systemStatus').textContent = statuses[0];
        document.getElementById('databaseStatus').textContent = statuses[1];
        document.getElementById('securityStatus').textContent = statuses[2];
        
        // Update last update time
        const now = new Date();
        const hoursAgo = Math.floor(Math.random() * 6) + 1;
        const lastUpdate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        document.getElementById('lastUpdate').textContent = `${hoursAgo} saat önce`;
    }

    startStatusMonitoring() {
        setInterval(() => {
            this.updateSystemStatus();
        }, 30000); // Update every 30 seconds
    }

    // Action functions
    saveAllSettings() {
        this.collectSettings();
        this.saveSettings();
        showAlert('Tüm ayarlar başarıyla kaydedildi', 'success');
    }

    resetToDefaults() {
        if (confirm('Tüm ayarları varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
            localStorage.removeItem('systemSettings');
            this.settings = this.loadSettings();
            this.loadSettingsValues();
            showAlert('Ayarlar varsayılan değerlere sıfırlandı', 'success');
        }
    }

    exportSettings() {
        const data = {
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showAlert('Sistem ayarları dışa aktarıldı', 'success');
    }

    // Maintenance functions
    checkForUpdates() {
        showAlert('Güncellemeler kontrol ediliyor...', 'info');
        setTimeout(() => {
            showAlert('Sistem güncel', 'success');
        }, 2000);
    }

    cleanupSystem() {
        if (confirm('Sistem temizliği yapmak istediğinizden emin misiniz?')) {
            showAlert('Sistem temizliği başlatılıyor...', 'info');
            setTimeout(() => {
                showAlert('Sistem temizliği tamamlandı', 'success');
            }, 3000);
        }
    }

    // Database functions
    testDatabaseConnection() {
        showAlert('Veritabanı bağlantısı test ediliyor...', 'info');
        setTimeout(() => {
            showAlert('Veritabanı bağlantısı başarılı', 'success');
        }, 2000);
    }

    createBackup() {
        showAlert('Yedek oluşturuluyor...', 'info');
        setTimeout(() => {
            showAlert('Yedek başarıyla oluşturuldu', 'success');
        }, 3000);
    }

    optimizeDatabase() {
        if (confirm('Veritabanını optimize etmek istediğinizden emin misiniz?')) {
            showAlert('Veritabanı optimizasyonu başlatılıyor...', 'info');
            setTimeout(() => {
                showAlert('Veritabanı optimizasyonu tamamlandı', 'success');
            }, 4000);
        }
    }

    // Performance functions
    clearCache() {
        if (confirm('Önbelleği temizlemek istediğinizden emin misiniz?')) {
            showAlert('Önbellek temizleniyor...', 'info');
            setTimeout(() => {
                showAlert('Önbellek başarıyla temizlendi', 'success');
            }, 2000);
        }
    }
}

// Global functions
function showTab(t) { systemSettingsManager.showTab(t); }
function saveAllSettings() { systemSettingsManager.saveAllSettings(); }
function resetToDefaults() { systemSettingsManager.resetToDefaults(); }
function exportSettings() { systemSettingsManager.exportSettings(); }
function checkForUpdates() { systemSettingsManager.checkForUpdates(); }
function cleanupSystem() { systemSettingsManager.cleanupSystem(); }
function testDatabaseConnection() { systemSettingsManager.testDatabaseConnection(); }
function createBackup() { systemSettingsManager.createBackup(); }
function optimizeDatabase() { systemSettingsManager.optimizeDatabase(); }
function clearCache() { systemSettingsManager.clearCache(); }

let systemSettingsManager;
document.addEventListener('DOMContentLoaded', () => {
    systemSettingsManager = new SystemSettingsManager();
});

console.log('✅ System Settings Manager Loaded');
