// Central Payment System JavaScript
class CentralPaymentManager {
    constructor() {
        this.paymentGateways = this.loadPaymentGateways();
        this.transactions = this.loadTransactions();
        this.securitySettings = this.loadSecuritySettings();
        this.paymentSettings = this.loadPaymentSettings();
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTransactions();
        this.renderPaymentGateways();
        this.updatePaymentOverview();
        this.loadDashboardData();
        this.setDefaultDates();
    }

    setupEventListeners() {
        // Search and filter events
        document.getElementById('transactionSearch')?.addEventListener('input', (e) => {
            this.filterTransactions(e.target.value);
        });

        document.getElementById('transactionFilter')?.addEventListener('change', (e) => {
            this.filterTransactionsByStatus(e.target.value);
        });

        document.getElementById('transactionMethod')?.addEventListener('change', (e) => {
            this.filterTransactionsByMethod(e.target.value);
        });

        document.getElementById('transactionPeriod')?.addEventListener('change', (e) => {
            this.filterTransactionsByPeriod(e.target.value);
        });

        // Form submissions
        document.getElementById('addPaymentMethodForm')?.addEventListener('submit', (e) => {
            this.handleAddPaymentMethod(e);
        });

        document.getElementById('paymentSettingsForm')?.addEventListener('submit', (e) => {
            this.handlePaymentSettings(e);
        });

        document.getElementById('securitySettingsForm')?.addEventListener('submit', (e) => {
            this.handleSecuritySettings(e);
        });

        // Chart period changes
        document.getElementById('volumePeriod')?.addEventListener('change', (e) => {
            this.updatePaymentVolumeChart(e.target.value);
        });

        document.getElementById('methodPeriod')?.addEventListener('change', (e) => {
            this.updatePaymentMethodsChart(e.target.value);
        });
    }

    setDefaultDates() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        document.getElementById('analyticsStartDate').value = startOfMonth.toISOString().split('T')[0];
        document.getElementById('analyticsEndDate').value = today.toISOString().split('T')[0];
    }

    // Tab Management
    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(`${tabName}-tab`).classList.add('active');
        document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        if (tabName === 'dashboard') {
            this.loadDashboardData();
        } else if (tabName === 'analytics') {
            this.loadAnalyticsData();
        } else if (tabName === 'security') {
            this.loadSecurityData();
        }
    }

    // Data Loading
    loadPaymentGateways() {
        const saved = localStorage.getItem('paymentGateways');
        if (saved) {
            return JSON.parse(saved);
        }

        // Default payment gateways
        return [
            {
                id: 1,
                name: 'PayPal',
                type: 'digital_wallet',
                commissionRate: 2.9,
                minAmount: 0,
                maxAmount: 10000,
                status: 'active',
                apiCredentials: 'API Key: pk_live_***',
                description: 'PayPal dijital cüzdan entegrasyonu',
                transactionCount: 3247,
                totalVolume: 1250000,
                successRate: 98.5,
                createdAt: '2024-01-15'
            },
            {
                id: 2,
                name: 'Stripe',
                type: 'credit_card',
                commissionRate: 2.9,
                minAmount: 0,
                maxAmount: 50000,
                status: 'active',
                apiCredentials: 'API Key: sk_live_***',
                description: 'Stripe kredi kartı işlemleri',
                transactionCount: 4567,
                totalVolume: 2100000,
                successRate: 99.1,
                createdAt: '2024-01-20'
            },
            {
                id: 3,
                name: 'İyzico',
                type: 'credit_card',
                commissionRate: 2.95,
                minAmount: 0,
                maxAmount: 25000,
                status: 'active',
                apiCredentials: 'API Key: iyz_***',
                description: 'İyzico Türkiye kredi kartı',
                transactionCount: 2890,
                totalVolume: 1800000,
                successRate: 97.8,
                createdAt: '2024-02-01'
            },
            {
                id: 4,
                name: 'PayU',
                type: 'credit_card',
                commissionRate: 3.2,
                minAmount: 0,
                maxAmount: 30000,
                status: 'active',
                apiCredentials: 'API Key: payu_***',
                description: 'PayU çoklu ödeme yöntemleri',
                transactionCount: 2156,
                totalVolume: 1450000,
                successRate: 98.2,
                createdAt: '2024-02-10'
            },
            {
                id: 5,
                name: 'Binance Pay',
                type: 'crypto',
                commissionRate: 0.5,
                minAmount: 10,
                maxAmount: 100000,
                status: 'active',
                apiCredentials: 'API Key: binance_***',
                description: 'Binance kripto para ödemeleri',
                transactionCount: 987,
                totalVolume: 1900000,
                successRate: 99.5,
                createdAt: '2024-02-15'
            }
        ];
    }

    loadTransactions() {
        const saved = localStorage.getItem('paymentTransactions');
        if (saved) {
            return JSON.parse(saved);
        }

        // Default transactions
        return [
            {
                id: 'TXN001',
                date: '2024-10-29 14:30:25',
                customer: 'Ahmet Yılmaz',
                amount: 1250.00,
                method: 'credit_card',
                status: 'successful',
                gateway: 'Stripe',
                processingTime: 2.1,
                commission: 36.25
            },
            {
                id: 'TXN002',
                date: '2024-10-29 14:25:18',
                customer: 'Ayşe Demir',
                amount: 850.00,
                method: 'digital_wallet',
                status: 'successful',
                gateway: 'PayPal',
                processingTime: 1.8,
                commission: 24.65
            },
            {
                id: 'TXN003',
                date: '2024-10-29 14:20:45',
                customer: 'Mehmet Kaya',
                amount: 2100.00,
                method: 'bank_transfer',
                status: 'pending',
                gateway: 'İyzico',
                processingTime: null,
                commission: 61.95
            },
            {
                id: 'TXN004',
                date: '2024-10-29 14:15:32',
                customer: 'Zeynep Özkan',
                amount: 750.00,
                method: 'crypto',
                status: 'successful',
                gateway: 'Binance Pay',
                processingTime: 3.2,
                commission: 3.75
            },
            {
                id: 'TXN005',
                date: '2024-10-29 14:10:15',
                customer: 'Ali Çelik',
                amount: 3200.00,
                method: 'credit_card',
                status: 'failed',
                gateway: 'PayU',
                processingTime: 5.8,
                commission: 0
            }
        ];
    }

    loadSecuritySettings() {
        return {
            encryptionLevel: 'high',
            sessionTimeout: 30,
            maxAttempts: 5,
            ipRestrictions: '',
            enableSSL: true,
            enablePCI: true,
            enableTokenization: true,
            enableFraudDetection: true,
            enable3DSecure: true,
            enableIPWhitelist: false
        };
    }

    loadPaymentSettings() {
        return {
            defaultCurrency: 'TRY',
            autoRefundDays: 7,
            transactionTimeout: 30,
            enableFraudDetection: true,
            enable3DSecure: true,
            enableIPWhitelist: false,
            emailNotifications: true,
            smsNotifications: false,
            webhookNotifications: true
        };
    }

    savePaymentGateways() {
        localStorage.setItem('paymentGateways', JSON.stringify(this.paymentGateways));
    }

    saveTransactions() {
        localStorage.setItem('paymentTransactions', JSON.stringify(this.transactions));
    }

    saveSecuritySettings() {
        localStorage.setItem('securitySettings', JSON.stringify(this.securitySettings));
    }

    savePaymentSettings() {
        localStorage.setItem('paymentSettings', JSON.stringify(this.paymentSettings));
    }

    // Render Functions
    renderTransactions() {
        const tbody = document.getElementById('transactionsTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.transactions.map(transaction => `
            <tr>
                <td><code>${transaction.id}</code></td>
                <td>${this.formatDateTime(transaction.date)}</td>
                <td>${transaction.customer}</td>
                <td class="amount">₺${this.formatNumber(transaction.amount)}</td>
                <td>
                    <span class="method-badge ${transaction.method}">
                        ${this.getMethodName(transaction.method)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${transaction.status}">
                        ${this.getStatusName(transaction.status)}
                    </span>
                </td>
                <td>${transaction.gateway}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="paymentManager.viewTransaction('${transaction.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="paymentManager.refundTransaction('${transaction.id}')">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="paymentManager.downloadReceipt('${transaction.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderPaymentGateways() {
        const grid = document.getElementById('gatewaysGrid');
        if (!grid) return;

        grid.innerHTML = this.paymentGateways.map(gateway => `
            <div class="gateway-card">
                <div class="gateway-header">
                    <h3>${gateway.name}</h3>
                    <span class="gateway-status ${gateway.status}">${this.getStatusName(gateway.status)}</span>
                </div>
                <div class="gateway-content">
                    <div class="gateway-info">
                        <div class="info-item">
                            <i class="fas fa-tag"></i>
                            <span>${this.getTypeName(gateway.type)}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-percentage"></i>
                            <span>%${gateway.commissionRate} komisyon</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-chart-line"></i>
                            <span>%${gateway.successRate} başarı</span>
                        </div>
                    </div>
                    <p class="gateway-description">${gateway.description}</p>
                    <div class="gateway-metrics">
                        <div class="metric">
                            <span class="metric-label">İşlem Sayısı:</span>
                            <span class="metric-value">${this.formatNumber(gateway.transactionCount)}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Toplam Hacim:</span>
                            <span class="metric-value">₺${this.formatNumber(gateway.totalVolume)}</span>
                        </div>
                    </div>
                    <div class="gateway-limits">
                        <span class="limit">Min: ₺${gateway.minAmount}</span>
                        <span class="limit">Max: ₺${gateway.maxAmount}</span>
                    </div>
                </div>
                <div class="gateway-actions">
                    <button class="btn btn-outline btn-sm" onclick="paymentManager.editGateway(${gateway.id})">
                        <i class="fas fa-edit"></i>
                        Düzenle
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="paymentManager.testGateway(${gateway.id})">
                        <i class="fas fa-vial"></i>
                        Test Et
                    </button>
                </div>
            </div>
        `).join('');

        this.updateGatewaySummary();
    }

    loadDashboardData() {
        this.updateRecentTransactions();
        this.updatePaymentAlerts();
        this.updatePaymentVolumeChart();
        this.updatePaymentMethodsChart();
    }

    updateRecentTransactions() {
        const container = document.getElementById('recentTransactionsList');
        if (!container) return;

        const recentTransactions = this.transactions.slice(0, 5);
        container.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-id">${transaction.id}</div>
                    <div class="transaction-customer">${transaction.customer}</div>
                </div>
                <div class="transaction-details">
                    <div class="transaction-amount">₺${this.formatNumber(transaction.amount)}</div>
                    <div class="transaction-method">${this.getMethodName(transaction.method)}</div>
                </div>
                <div class="transaction-status">
                    <span class="status-badge ${transaction.status}">${this.getStatusName(transaction.status)}</span>
                </div>
            </div>
        `).join('');
    }

    updatePaymentAlerts() {
        const container = document.getElementById('paymentAlertsList');
        if (!container) return;

        const alerts = [
            {
                id: 1,
                type: 'warning',
                message: 'PayU gateway\'inde yüksek başarısızlık oranı tespit edildi',
                gateway: 'PayU',
                timestamp: '2 dakika önce'
            },
            {
                id: 2,
                type: 'info',
                message: 'Binance Pay komisyon oranı güncellendi',
                gateway: 'Binance Pay',
                timestamp: '15 dakika önce'
            },
            {
                id: 3,
                type: 'success',
                message: 'Tüm gateway\'ler normal çalışıyor',
                gateway: 'Sistem',
                timestamp: '1 saat önce'
            }
        ];

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">
                    <i class="fas fa-${this.getAlertIcon(alert.type)}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-details">
                        <span class="alert-gateway">${alert.gateway}</span>
                        <span class="alert-time">${alert.timestamp}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updatePaymentOverview() {
        const totalVolume = this.transactions
            .filter(t => t.status === 'successful')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalTransactions = this.transactions.length;
        const successfulTransactions = this.transactions.filter(t => t.status === 'successful').length;
        const successRate = (successfulTransactions / totalTransactions) * 100;
        const avgProcessingTime = this.transactions
            .filter(t => t.processingTime)
            .reduce((sum, t) => sum + t.processingTime, 0) / this.transactions.filter(t => t.processingTime).length;

        document.getElementById('totalPaymentVolume').textContent = '₺' + this.formatNumber(totalVolume);
        document.getElementById('totalTransactions').textContent = this.formatNumber(totalTransactions);
        document.getElementById('successRate').textContent = successRate.toFixed(1) + '%';
        document.getElementById('avgProcessingTime').textContent = avgProcessingTime.toFixed(1) + 's';
    }

    updateGatewaySummary() {
        const activeGateways = this.paymentGateways.filter(g => g.status === 'active').length;
        const totalVolume = this.paymentGateways.reduce((sum, g) => sum + g.totalVolume, 0);
        const avgCommission = this.paymentGateways.reduce((sum, g) => sum + g.commissionRate, 0) / this.paymentGateways.length;

        document.getElementById('activeGateways').textContent = activeGateways;
        document.getElementById('totalGatewayVolume').textContent = '₺' + this.formatNumber(totalVolume);
        document.getElementById('avgCommission').textContent = avgCommission.toFixed(1) + '%';
        document.getElementById('systemUptime').textContent = '99.9%';
    }

    // Chart Functions (Mock implementations)
    updatePaymentVolumeChart() {
        console.log('Payment volume chart updated');
    }

    updatePaymentMethodsChart() {
        console.log('Payment methods chart updated');
    }

    loadAnalyticsData() {
        console.log('Analytics data loaded');
    }

    loadSecurityData() {
        this.updateSecurityStatus();
        this.updateFraudDetection();
        this.updateComplianceStatus();
        this.updateSecurityAlerts();
    }

    updateSecurityStatus() {
        const container = document.getElementById('securityStatus');
        if (!container) return;

        const securityItems = [
            {
                name: 'SSL/TLS Şifreleme',
                status: 'active',
                level: 'Yüksek'
            },
            {
                name: 'PCI DSS Uyumluluğu',
                status: 'active',
                level: 'Tam Uyumlu'
            },
            {
                name: 'Tokenizasyon',
                status: 'active',
                level: 'Aktif'
            },
            {
                name: 'Fraud Detection',
                status: 'active',
                level: 'Çalışıyor'
            }
        ];

        container.innerHTML = securityItems.map(item => `
            <div class="security-item">
                <div class="security-name">${item.name}</div>
                <div class="security-level">${item.level}</div>
                <div class="security-indicator ${item.status}"></div>
            </div>
        `).join('');
    }

    updateFraudDetection() {
        const container = document.getElementById('fraudDetection');
        if (!container) return;

        const fraudItems = [
            {
                type: 'Suspicious Activity',
                count: 3,
                severity: 'medium'
            },
            {
                type: 'High Risk Transaction',
                count: 1,
                severity: 'high'
            },
            {
                type: 'Blocked IP',
                count: 7,
                severity: 'low'
            }
        ];

        container.innerHTML = fraudItems.map(item => `
            <div class="fraud-item ${item.severity}">
                <div class="fraud-type">${item.type}</div>
                <div class="fraud-count">${item.count} olay</div>
            </div>
        `).join('');
    }

    updateComplianceStatus() {
        const container = document.getElementById('complianceStatus');
        if (!container) return;

        const complianceItems = [
            {
                standard: 'PCI DSS',
                status: 'compliant',
                lastAudit: '2024-09-15'
            },
            {
                standard: 'GDPR',
                status: 'compliant',
                lastAudit: '2024-08-20'
            },
            {
                standard: 'ISO 27001',
                status: 'compliant',
                lastAudit: '2024-07-10'
            }
        ];

        container.innerHTML = complianceItems.map(item => `
            <div class="compliance-item">
                <div class="compliance-standard">${item.standard}</div>
                <div class="compliance-status ${item.status}">Uyumlu</div>
                <div class="compliance-date">Son denetim: ${item.lastAudit}</div>
            </div>
        `).join('');
    }

    updateSecurityAlerts() {
        const container = document.getElementById('securityAlerts');
        if (!container) return;

        const alerts = [
            {
                type: 'info',
                message: 'Güvenlik güncellemesi mevcut',
                time: '2 saat önce'
            },
            {
                type: 'warning',
                message: 'Şüpheli IP adresinden giriş denemesi',
                time: '4 saat önce'
            }
        ];

        container.innerHTML = alerts.map(alert => `
            <div class="security-alert ${alert.type}">
                <div class="alert-message">${alert.message}</div>
                <div class="alert-time">${alert.time}</div>
            </div>
        `).join('');
    }

    // Modal Functions
    showAddPaymentMethodModal() {
        document.getElementById('addPaymentMethodModal').style.display = 'block';
    }

    showPaymentSettingsModal() {
        document.getElementById('paymentSettingsModal').style.display = 'block';
    }

    showSecuritySettingsModal() {
        document.getElementById('securitySettingsModal').style.display = 'block';
    }

    // Form Handlers
    handleAddPaymentMethod(e) {
        e.preventDefault();
        
        const newGateway = {
            id: Date.now(),
            name: document.getElementById('gatewayName').value,
            type: document.getElementById('gatewayType').value,
            commissionRate: parseFloat(document.getElementById('commissionRate').value),
            minAmount: parseFloat(document.getElementById('minAmount').value) || 0,
            maxAmount: parseFloat(document.getElementById('maxAmount').value) || 100000,
            status: document.getElementById('gatewayStatus').value,
            apiCredentials: document.getElementById('apiCredentials').value,
            description: document.getElementById('gatewayDescription').value,
            transactionCount: 0,
            totalVolume: 0,
            successRate: 100,
            createdAt: new Date().toISOString()
        };

        this.paymentGateways.push(newGateway);
        this.savePaymentGateways();
        this.renderPaymentGateways();
        
        closeModal('addPaymentMethodModal');
        showAlert('Ödeme gateway\'i başarıyla eklendi!', 'success');
        e.target.reset();
    }

    handlePaymentSettings(e) {
        e.preventDefault();
        
        this.paymentSettings = {
            defaultCurrency: document.getElementById('defaultCurrency').value,
            autoRefundDays: parseInt(document.getElementById('autoRefundDays').value),
            transactionTimeout: parseInt(document.getElementById('transactionTimeout').value),
            enableFraudDetection: document.getElementById('enableFraudDetection').checked,
            enable3DSecure: document.getElementById('enable3DSecure').checked,
            enableIPWhitelist: document.getElementById('enableIPWhitelist').checked,
            emailNotifications: document.getElementById('emailNotifications').checked,
            smsNotifications: document.getElementById('smsNotifications').checked,
            webhookNotifications: document.getElementById('webhookNotifications').checked
        };

        this.savePaymentSettings();
        closeModal('paymentSettingsModal');
        showAlert('Ödeme ayarları başarıyla kaydedildi!', 'success');
    }

    handleSecuritySettings(e) {
        e.preventDefault();
        
        this.securitySettings = {
            encryptionLevel: document.getElementById('encryptionLevel').value,
            sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
            maxAttempts: parseInt(document.getElementById('maxAttempts').value),
            ipRestrictions: document.getElementById('ipRestrictions').value,
            enableSSL: document.getElementById('enableSSL').checked,
            enablePCI: document.getElementById('enablePCI').checked,
            enableTokenization: document.getElementById('enableTokenization').checked
        };

        this.saveSecuritySettings();
        closeModal('securitySettingsModal');
        showAlert('Güvenlik ayarları başarıyla kaydedildi!', 'success');
    }

    // Transaction Actions
    viewTransaction(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        const details = `
            İşlem ID: ${transaction.id}
            Tarih: ${transaction.date}
            Müşteri: ${transaction.customer}
            Tutar: ₺${this.formatNumber(transaction.amount)}
            Yöntem: ${this.getMethodName(transaction.method)}
            Durum: ${this.getStatusName(transaction.status)}
            Gateway: ${transaction.gateway}
            İşlem Süresi: ${transaction.processingTime ? transaction.processingTime + 's' : 'N/A'}
            Komisyon: ₺${transaction.commission}
        `;
        
        alert(details);
    }

    refundTransaction(transactionId) {
        if (confirm('Bu işlemi iade etmek istediğinizden emin misiniz?')) {
            const transaction = this.transactions.find(t => t.id === transactionId);
            if (transaction) {
                transaction.status = 'refunded';
                this.saveTransactions();
                this.renderTransactions();
                this.updatePaymentOverview();
                showAlert('İşlem başarıyla iade edildi!', 'success');
            }
        }
    }

    downloadReceipt(transactionId) {
        showAlert('Makbuz indirme özelliği yakında eklenecek!', 'info');
    }

    // Gateway Actions
    editGateway(gatewayId) {
        showAlert('Gateway düzenleme özelliği yakında eklenecek!', 'info');
    }

    testGateway(gatewayId) {
        showAlert('Gateway test işlemi başlatıldı!', 'info');
    }

    // Filter Functions
    filterTransactions(searchTerm) {
        const filtered = this.transactions.filter(transaction => 
            transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.gateway.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredTransactions(filtered);
    }

    filterTransactionsByStatus(status) {
        if (!status) {
            this.renderTransactions();
            return;
        }

        const filtered = this.transactions.filter(transaction => transaction.status === status);
        this.renderFilteredTransactions(filtered);
    }

    filterTransactionsByMethod(method) {
        if (!method) {
            this.renderTransactions();
            return;
        }

        const filtered = this.transactions.filter(transaction => transaction.method === method);
        this.renderFilteredTransactions(filtered);
    }

    filterTransactionsByPeriod(period) {
        if (!period || period === 'all') {
            this.renderTransactions();
            return;
        }

        const now = new Date();
        let startDate;

        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                break;
        }

        const filtered = this.transactions.filter(transaction => 
            new Date(transaction.date) >= startDate
        );
        this.renderFilteredTransactions(filtered);
    }

    renderFilteredTransactions(transactions) {
        const tbody = document.getElementById('transactionsTableBody');
        if (!tbody) return;

        tbody.innerHTML = transactions.map(transaction => `
            <tr>
                <td><code>${transaction.id}</code></td>
                <td>${this.formatDateTime(transaction.date)}</td>
                <td>${transaction.customer}</td>
                <td class="amount">₺${this.formatNumber(transaction.amount)}</td>
                <td>
                    <span class="method-badge ${transaction.method}">
                        ${this.getMethodName(transaction.method)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${transaction.status}">
                        ${this.getStatusName(transaction.status)}
                    </span>
                </td>
                <td>${transaction.gateway}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="paymentManager.viewTransaction('${transaction.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="paymentManager.refundTransaction('${transaction.id}')">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="paymentManager.downloadReceipt('${transaction.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Export Functions
    exportPaymentData() {
        const data = {
            paymentGateways: this.paymentGateways,
            transactions: this.transactions,
            securitySettings: this.securitySettings,
            paymentSettings: this.paymentSettings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showAlert('Ödeme verileri başarıyla dışa aktarıldı!', 'success');
    }

    generateAnalyticsReport() {
        showAlert('Analitik raporu oluşturuluyor...', 'info');
    }

    downloadAnalytics(reportType) {
        showAlert(`${reportType} raporu indirme özelliği yakında eklenecek!`, 'info');
    }

    runSecurityAudit() {
        showAlert('Güvenlik denetimi başlatıldı!', 'info');
    }

    // Utility Functions
    formatNumber(num) {
        return new Intl.NumberFormat('tr-TR').format(num);
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('tr-TR');
    }

    getMethodName(method) {
        const methods = {
            'credit_card': 'Kredi Kartı',
            'bank_transfer': 'Banka Havalesi',
            'digital_wallet': 'Dijital Cüzdan',
            'crypto': 'Kripto Para',
            'mobile_payment': 'Mobil Ödeme'
        };
        return methods[method] || method;
    }

    getTypeName(type) {
        const types = {
            'credit_card': 'Kredi Kartı',
            'bank_transfer': 'Banka Havalesi',
            'digital_wallet': 'Dijital Cüzdan',
            'crypto': 'Kripto Para',
            'mobile_payment': 'Mobil Ödeme'
        };
        return types[type] || type;
    }

    getStatusName(status) {
        const statuses = {
            'successful': 'Başarılı',
            'failed': 'Başarısız',
            'pending': 'Beklemede',
            'refunded': 'İade Edildi',
            'active': 'Aktif',
            'inactive': 'Pasif',
            'maintenance': 'Bakımda'
        };
        return statuses[status] || status;
    }

    getAlertIcon(type) {
        const icons = {
            'warning': 'exclamation-triangle',
            'info': 'info-circle',
            'success': 'check-circle',
            'error': 'times-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Global Functions
function showTab(tabName) {
    paymentManager.showTab(tabName);
}

function showAddPaymentMethodModal() {
    paymentManager.showAddPaymentMethodModal();
}

function showPaymentSettingsModal() {
    paymentManager.showPaymentSettingsModal();
}

function showSecuritySettingsModal() {
    paymentManager.showSecuritySettingsModal();
}

function exportPaymentData() {
    paymentManager.exportPaymentData();
}

function generateAnalyticsReport() {
    paymentManager.generateAnalyticsReport();
}

function downloadAnalytics(reportType) {
    paymentManager.downloadAnalytics(reportType);
}

function runSecurityAudit() {
    paymentManager.runSecurityAudit();
}

// Initialize Payment Manager
let paymentManager;
document.addEventListener('DOMContentLoaded', function() {
    paymentManager = new CentralPaymentManager();
});

console.log('✅ Central Payment System Loaded');
