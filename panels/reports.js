// Reports Management JavaScript
class ReportsManager {
    constructor() {
        this.reports = this.loadReports();
        this.scheduledReports = this.loadScheduledReports();
        this.customReports = this.loadCustomReports();
        this.currentTab = 'financial';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderReports();
        this.updateOverview();
        this.loadDashboardData();
    }

    setupEventListeners() {
        // Financial filters
        document.getElementById('financialSearch')?.addEventListener('input', (e) => this.filterReports('financial', e.target.value));
        document.getElementById('financialPeriodFilter')?.addEventListener('change', (e) => this.filterReportsByPeriod('financial', e.target.value));
        document.getElementById('financialTypeFilter')?.addEventListener('change', (e) => this.filterReportsByType('financial', e.target.value));

        // Operational filters
        document.getElementById('operationalSearch')?.addEventListener('input', (e) => this.filterReports('operational', e.target.value));
        document.getElementById('operationalPeriodFilter')?.addEventListener('change', (e) => this.filterReportsByPeriod('operational', e.target.value));
        document.getElementById('operationalTypeFilter')?.addEventListener('change', (e) => this.filterReportsByType('operational', e.target.value));

        // Sales filters
        document.getElementById('salesSearch')?.addEventListener('input', (e) => this.filterReports('sales', e.target.value));
        document.getElementById('salesPeriodFilter')?.addEventListener('change', (e) => this.filterReportsByPeriod('sales', e.target.value));
        document.getElementById('salesTypeFilter')?.addEventListener('change', (e) => this.filterReportsByType('sales', e.target.value));

        // Customer filters
        document.getElementById('customerSearch')?.addEventListener('input', (e) => this.filterReports('customer', e.target.value));
        document.getElementById('customerPeriodFilter')?.addEventListener('change', (e) => this.filterReportsByPeriod('customer', e.target.value));
        document.getElementById('customerTypeFilter')?.addEventListener('change', (e) => this.filterReportsByType('customer', e.target.value));

        // Security filters
        document.getElementById('securitySearch')?.addEventListener('input', (e) => this.filterReports('security', e.target.value));
        document.getElementById('securityPeriodFilter')?.addEventListener('change', (e) => this.filterReportsByPeriod('security', e.target.value));
        document.getElementById('securityTypeFilter')?.addEventListener('change', (e) => this.filterReportsByType('security', e.target.value));

        // R&D filters
        document.getElementById('rdSearch')?.addEventListener('input', (e) => this.filterReports('rd', e.target.value));
        document.getElementById('rdPeriodFilter')?.addEventListener('change', (e) => this.filterReportsByPeriod('rd', e.target.value));
        document.getElementById('rdTypeFilter')?.addEventListener('change', (e) => this.filterReportsByType('rd', e.target.value));

        // Form submissions
        document.getElementById('createReportForm')?.addEventListener('submit', (e) => this.handleCreateReport(e));
        document.getElementById('scheduleReportForm')?.addEventListener('submit', (e) => this.handleScheduleReport(e));
    }

    // Tabs
    showTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`${tabName}-tab`)?.classList.add('active');
        document.querySelector(`[onclick="showTab('${tabName}')"]`)?.classList.add('active');
        this.currentTab = tabName;
    }

    // Load mock data
    loadReports() {
        const saved = localStorage.getItem('ceoReports');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'RPT-001', name: 'Aylık Gelir Raporu', category: 'financial', type: 'income', period: 'monthly', lastUpdate: '2024-10-29', status: 'active', stats: { totalRevenue: 2450000, growth: 12.5 } },
            { id: 'RPT-002', name: 'Çeyreklik Kar Raporu', category: 'financial', type: 'profit', period: 'quarterly', lastUpdate: '2024-10-15', status: 'active', stats: { netProfit: 580000, margin: 23.7 } },
            { id: 'RPT-003', name: 'Nakit Akışı Raporu', category: 'financial', type: 'cashflow', period: 'monthly', lastUpdate: '2024-10-28', status: 'active', stats: { netCash: 1200000, growth: 8.3 } },
            { id: 'RPT-004', name: 'Operasyonel Performans Raporu', category: 'operational', type: 'performance', period: 'monthly', lastUpdate: '2024-10-29', status: 'active', stats: { efficiency: 87.5, uptime: 99.2 } },
            { id: 'RPT-005', name: 'Kapasite Kullanım Raporu', category: 'operational', type: 'capacity', period: 'weekly', lastUpdate: '2024-10-28', status: 'active', stats: { utilization: 78.3, optimization: 5.2 } },
            { id: 'RPT-006', name: 'Günlük Satış Raporu', category: 'sales', type: 'revenue', period: 'daily', lastUpdate: '2024-10-29', status: 'active', stats: { dailyRevenue: 85000, growth: 15.3 } },
            { id: 'RPT-007', name: 'Ürün Satış Analizi', category: 'sales', type: 'products', period: 'monthly', lastUpdate: '2024-10-28', status: 'active', stats: { topProduct: 'Video Kameralar', growth: 22.1 } },
            { id: 'RPT-008', name: 'Müşteri Segmentasyon Raporu', category: 'customer', type: 'segmentation', period: 'monthly', lastUpdate: '2024-10-29', status: 'active', stats: { totalCustomers: 12450, activeSegment: 'Premium' } },
            { id: 'RPT-009', name: 'Müşteri Memnuniyet Raporu', category: 'customer', type: 'satisfaction', period: 'weekly', lastUpdate: '2024-10-28', status: 'active', stats: { satisfaction: 4.7, improvement: 0.3 } },
            { id: 'RPT-010', name: 'Güvenlik Tehdit Raporu', category: 'security', type: 'threats', period: 'daily', lastUpdate: '2024-10-29', status: 'active', stats: { activeThreats: 3, securityScore: 85 } },
            { id: 'RPT-011', name: 'Uyumluluk Raporu', category: 'security', type: 'compliance', period: 'monthly', lastUpdate: '2024-10-28', status: 'active', stats: { complianceScore: 91, gdpr: 95 } },
            { id: 'RPT-012', name: 'Ar-Ge Proje Raporu', category: 'rd', type: 'projects', period: 'monthly', lastUpdate: '2024-10-29', status: 'active', stats: { activeProjects: 8, avgProgress: 67 } },
            { id: 'RPT-013', name: 'İnovasyon Raporu', category: 'rd', type: 'innovation', period: 'quarterly', lastUpdate: '2024-10-15', status: 'active', stats: { newInnovations: 5, patents: 3 } }
        ];
    }

    loadScheduledReports() {
        const saved = localStorage.getItem('scheduledReports');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'SCH-001', name: 'Günlük CEO Özeti', frequency: 'daily', time: '08:00', recipients: 'ceo@videosat.com', status: 'active' },
            { id: 'SCH-002', name: 'Haftalık Finansal Rapor', frequency: 'weekly', time: '09:00', recipients: 'finance@videosat.com', status: 'active' },
            { id: 'SCH-003', name: 'Aylık Güvenlik Raporu', frequency: 'monthly', time: '10:00', recipients: 'security@videosat.com', status: 'active' }
        ];
    }

    loadCustomReports() {
        const saved = localStorage.getItem('customReports');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'CUS-001', name: 'CEO Özet Raporu', category: 'mixed', description: 'Finansal, operasyonel ve güvenlik metriklerinin özeti', metrics: ['revenue', 'profit', 'performance', 'security'], status: 'active' },
            { id: 'CUS-002', name: 'Haftalık Performans Raporu', category: 'operational', description: 'Tüm departmanların haftalık performans analizi', metrics: ['performance', 'efficiency', 'capacity'], status: 'active' }
        ];
    }

    saveReports() { localStorage.setItem('ceoReports', JSON.stringify(this.reports)); }
    saveScheduledReports() { localStorage.setItem('scheduledReports', JSON.stringify(this.scheduledReports)); }
    saveCustomReports() { localStorage.setItem('customReports', JSON.stringify(this.customReports)); }

    // Overview
    updateOverview() {
        const totalReports = this.reports.length;
        const activeReports = this.reports.filter(r => r.status === 'active').length;
        const scheduledReports = this.scheduledReports.length;
        const sharedReports = this.reports.filter(r => r.shared).length;
        const exportedReports = this.reports.filter(r => r.exported).length;
        const favoriteReports = this.reports.filter(r => r.favorite).length;

        document.getElementById('totalReports').textContent = this.formatNumber(totalReports);
        document.getElementById('activeReports').textContent = this.formatNumber(activeReports);
        document.getElementById('scheduledReports').textContent = this.formatNumber(scheduledReports);
        document.getElementById('sharedReports').textContent = this.formatNumber(sharedReports);
        document.getElementById('exportedReports').textContent = this.formatNumber(exportedReports);
        document.getElementById('favoriteReports').textContent = this.formatNumber(favoriteReports);
    }

    // Renderers
    renderReports() {
        this.renderFinancialReports();
        this.renderOperationalReports();
        this.renderSalesReports();
        this.renderCustomerReports();
        this.renderSecurityReports();
        this.renderRDReports();
        this.renderCustomReports();
    }

    renderFinancialReports() {
        const grid = document.querySelector('#financial-tab .reports-grid');
        if (!grid) return;
        const financialReports = this.reports.filter(r => r.category === 'financial');
        grid.innerHTML = financialReports.map(r => this.createReportCard(r)).join('');
    }

    renderOperationalReports() {
        const grid = document.querySelector('#operational-tab .reports-grid');
        if (!grid) return;
        const operationalReports = this.reports.filter(r => r.category === 'operational');
        grid.innerHTML = operationalReports.map(r => this.createReportCard(r)).join('');
    }

    renderSalesReports() {
        const grid = document.querySelector('#sales-tab .reports-grid');
        if (!grid) return;
        const salesReports = this.reports.filter(r => r.category === 'sales');
        grid.innerHTML = salesReports.map(r => this.createReportCard(r)).join('');
    }

    renderCustomerReports() {
        const grid = document.querySelector('#customer-tab .reports-grid');
        if (!grid) return;
        const customerReports = this.reports.filter(r => r.category === 'customer');
        grid.innerHTML = customerReports.map(r => this.createReportCard(r)).join('');
    }

    renderSecurityReports() {
        const grid = document.querySelector('#security-tab .reports-grid');
        if (!grid) return;
        const securityReports = this.reports.filter(r => r.category === 'security');
        grid.innerHTML = securityReports.map(r => this.createReportCard(r)).join('');
    }

    renderRDReports() {
        const grid = document.querySelector('#rd-tab .reports-grid');
        if (!grid) return;
        const rdReports = this.reports.filter(r => r.category === 'rd');
        grid.innerHTML = rdReports.map(r => this.createReportCard(r)).join('');
    }

    renderCustomReports() {
        const list = document.querySelector('.custom-reports-list');
        if (!list) return;
        list.innerHTML = this.customReports.map(r => `
            <div class="custom-report-item">
                <div class="report-info">
                    <h4>${r.name}</h4>
                    <p>${r.description}</p>
                </div>
                <div class="report-actions">
                    <button class="btn btn-outline btn-xs" onclick="reportsManager.viewReport('${r.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-xs" onclick="reportsManager.editReport('${r.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-primary btn-xs" onclick="reportsManager.exportReport('${r.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    createReportCard(report) {
        return `
            <div class="report-card">
                <div class="report-header">
                    <h3>${report.name}</h3>
                    <div class="report-actions">
                        <button class="btn btn-outline btn-xs" onclick="reportsManager.viewReport('${report.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="reportsManager.editReport('${report.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-primary btn-xs" onclick="reportsManager.exportReport('${report.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
                <div class="report-meta">
                    <p><strong>Tür:</strong> ${this.getTypeName(report.type)}</p>
                    <p><strong>Dönem:</strong> ${this.getPeriodName(report.period)}</p>
                    <p><strong>Son Güncelleme:</strong> ${this.formatDate(report.lastUpdate)}</p>
                    <p><strong>Durum:</strong> <span class="status-badge ${report.status}">${this.getStatusName(report.status)}</span></p>
                </div>
                <div class="report-description">
                    <p>${this.getReportDescription(report.type)}</p>
                </div>
                <div class="report-stats">
                    ${this.createReportStats(report.stats, report.type)}
                </div>
            </div>
        `;
    }

    createReportStats(stats, type) {
        const statItems = [];
        for (const [key, value] of Object.entries(stats)) {
            const label = this.getStatLabel(key);
            const formattedValue = this.formatStatValue(value, key);
            const isPositive = this.isPositiveStat(key, value);
            statItems.push(`
                <div class="stat-item">
                    <span class="stat-label">${label}:</span>
                    <span class="stat-value ${isPositive ? 'positive' : ''}">${formattedValue}</span>
                </div>
            `);
        }
        return statItems.join('');
    }

    loadDashboardData() {
        this.updateOverview();
    }

    // Report actions
    viewReport(id) {
        const r = this.reports.find(x => x.id === id) || this.customReports.find(x => x.id === id);
        if (!r) return;
        showAlert(`Rapor görüntüleniyor: ${r.name}`, 'info');
    }

    editReport(id) {
        const r = this.reports.find(x => x.id === id) || this.customReports.find(x => x.id === id);
        if (!r) return;
        showAlert(`Rapor düzenleniyor: ${r.name}`, 'info');
    }

    exportReport(id) {
        const r = this.reports.find(x => x.id === id) || this.customReports.find(x => x.id === id);
        if (!r) return;
        r.exported = true;
        this.saveReports();
        this.saveCustomReports();
        this.updateOverview();
        showAlert(`Rapor dışa aktarıldı: ${r.name}`, 'success');
    }

    handleCreateReport(e) {
        e.preventDefault();
        const newReport = {
            id: 'RPT-' + (100 + Math.floor(Math.random() * 900)),
            name: document.getElementById('newReportName').value,
            category: document.getElementById('newReportCategory').value,
            type: 'custom',
            period: document.getElementById('newReportPeriod').value,
            lastUpdate: new Date().toISOString().split('T')[0],
            status: 'active',
            description: document.getElementById('newReportDescription').value,
            stats: {}
        };
        this.reports.unshift(newReport);
        this.saveReports();
        this.renderReports();
        this.updateOverview();
        closeModal('createReportModal');
        showAlert('Rapor oluşturuldu', 'success');
        e.target.reset();
    }

    handleScheduleReport(e) {
        e.preventDefault();
        const newScheduledReport = {
            id: 'SCH-' + (100 + Math.floor(Math.random() * 900)),
            name: document.getElementById('scheduleReportName').value,
            frequency: document.getElementById('scheduleFrequency').value,
            time: document.getElementById('scheduleTime').value,
            recipients: document.getElementById('scheduleRecipients').value,
            status: 'active'
        };
        this.scheduledReports.unshift(newScheduledReport);
        this.saveScheduledReports();
        this.updateOverview();
        closeModal('scheduleReportModal');
        showAlert('Zamanlanmış rapor oluşturuldu', 'success');
        e.target.reset();
    }

    createCustomReport() {
        const name = document.getElementById('reportName').value;
        const category = document.getElementById('reportCategory').value;
        const period = document.getElementById('reportPeriod').value;
        const selectedMetrics = Array.from(document.querySelectorAll('.metrics-selector input:checked')).map(cb => cb.value);
        
        if (!name) {
            showAlert('Rapor adı gerekli', 'error');
            return;
        }

        const newCustomReport = {
            id: 'CUS-' + (100 + Math.floor(Math.random() * 900)),
            name: name,
            category: category,
            description: `${category} kategorisinde ${period} dönemli özel rapor`,
            metrics: selectedMetrics,
            period: period,
            status: 'active'
        };

        this.customReports.unshift(newCustomReport);
        this.saveCustomReports();
        this.renderCustomReports();
        this.updateOverview();
        showAlert('Özel rapor oluşturuldu', 'success');
        
        // Reset form
        document.getElementById('reportName').value = '';
        document.querySelectorAll('.metrics-selector input:checked').forEach(cb => cb.checked = false);
    }

    // Filters
    filterReports(category, query) {
        const filtered = this.reports.filter(r => r.category === category && r.name.toLowerCase().includes(query.toLowerCase()));
        this.renderFilteredReports(category, filtered);
    }

    filterReportsByPeriod(category, period) {
        if (!period) { this.renderReports(); return; }
        const filtered = this.reports.filter(r => r.category === category && r.period === period);
        this.renderFilteredReports(category, filtered);
    }

    filterReportsByType(category, type) {
        if (!type) { this.renderReports(); return; }
        const filtered = this.reports.filter(r => r.category === category && r.type === type);
        this.renderFilteredReports(category, filtered);
    }

    renderFilteredReports(category, reports) {
        const grid = document.querySelector(`#${category}-tab .reports-grid`);
        if (!grid) return;
        grid.innerHTML = reports.map(r => this.createReportCard(r)).join('');
    }

    // Export
    exportAllReports() {
        const data = {
            reports: this.reports,
            scheduledReports: this.scheduledReports,
            customReports: this.customReports,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ceo-reports-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showAlert('Tüm raporlar dışa aktarıldı', 'success');
    }

    // Utils
    formatNumber(n) { return new Intl.NumberFormat('tr-TR').format(n); }
    formatCurrency(n) { return '₺' + new Intl.NumberFormat('tr-TR').format(n); }
    formatDate(d) { return new Date(d).toLocaleDateString('tr-TR'); }

    getTypeName(t) {
        const types = {
            income: 'Gelir Raporu',
            expense: 'Gider Raporu',
            profit: 'Kar Raporu',
            cashflow: 'Nakit Akışı',
            budget: 'Bütçe Raporu',
            performance: 'Performans',
            efficiency: 'Verimlilik',
            capacity: 'Kapasite',
            quality: 'Kalite',
            revenue: 'Gelir',
            orders: 'Sipariş',
            products: 'Ürün',
            customers: 'Müşteri',
            segmentation: 'Segmentasyon',
            behavior: 'Davranış',
            satisfaction: 'Memnuniyet',
            retention: 'Sadakat',
            threats: 'Tehditler',
            incidents: 'Olaylar',
            compliance: 'Uyumluluk',
            audit: 'Denetim',
            projects: 'Projeler',
            research: 'Araştırma',
            innovation: 'İnovasyon',
            patents: 'Patentler',
            custom: 'Özel'
        };
        return types[t] || t;
    }

    getPeriodName(p) {
        const periods = {
            daily: 'Günlük',
            weekly: 'Haftalık',
            monthly: 'Aylık',
            quarterly: 'Çeyreklik',
            yearly: 'Yıllık'
        };
        return periods[p] || p;
    }

    getStatusName(s) {
        const statuses = {
            active: 'Aktif',
            inactive: 'Pasif',
            draft: 'Taslak',
            archived: 'Arşivlenmiş'
        };
        return statuses[s] || s;
    }

    getReportDescription(type) {
        const descriptions = {
            income: 'Platform gelirlerinin analizi ve trend değerlendirmesi.',
            profit: 'Net kar analizi ve karlılık oranlarının değerlendirmesi.',
            cashflow: 'Giriş ve çıkış nakit akışlarının detaylı analizi.',
            performance: 'Genel operasyonel performans metrikleri ve KPI analizi.',
            capacity: 'Kaynak kapasitesi kullanım oranları ve optimizasyon önerileri.',
            revenue: 'Günlük satış performansı ve trend analizi.',
            products: 'Ürün bazlı satış performansı ve kategori analizi.',
            segmentation: 'Müşteri segmentleri ve demografik analiz.',
            satisfaction: 'Müşteri memnuniyet skorları ve geri bildirim analizi.',
            threats: 'Güvenlik tehditleri ve risk analizi raporu.',
            compliance: 'GDPR, KVKK ve diğer uyumluluk standartları raporu.',
            projects: 'Ar-Ge projelerinin ilerleme durumu ve performans analizi.',
            innovation: 'İnovasyon projeleri ve patent başvuruları analizi.'
        };
        return descriptions[type] || 'Detaylı analiz ve raporlama.';
    }

    getStatLabel(key) {
        const labels = {
            totalRevenue: 'Toplam Gelir',
            growth: 'Büyüme',
            netProfit: 'Net Kar',
            margin: 'Kar Marjı',
            netCash: 'Net Nakit',
            efficiency: 'Genel Verimlilik',
            uptime: 'Sistem Uptime',
            utilization: 'Kapasite Kullanımı',
            optimization: 'Optimizasyon',
            dailyRevenue: 'Günlük Gelir',
            topProduct: 'En Çok Satan',
            totalCustomers: 'Toplam Müşteri',
            activeSegment: 'Aktif Segment',
            satisfaction: 'Memnuniyet Skoru',
            improvement: 'İyileşme',
            activeThreats: 'Aktif Tehdit',
            securityScore: 'Güvenlik Skoru',
            complianceScore: 'Uyumluluk Skoru',
            gdpr: 'GDPR',
            activeProjects: 'Aktif Proje',
            avgProgress: 'Ortalama İlerleme',
            newInnovations: 'Yeni İnovasyon',
            patents: 'Patent Başvurusu'
        };
        return labels[key] || key;
    }

    formatStatValue(value, key) {
        if (typeof value === 'number') {
            if (key.includes('Revenue') || key.includes('Profit') || key.includes('Cash')) {
                return this.formatCurrency(value);
            }
            if (key.includes('Score') || key.includes('Margin') || key.includes('Efficiency') || key.includes('Uptime') || key.includes('Utilization') || key.includes('Optimization') || key.includes('Progress') || key.includes('Satisfaction')) {
                return value + '%';
            }
            if (key.includes('Growth') || key.includes('Improvement')) {
                return '+' + value + '%';
            }
            return this.formatNumber(value);
        }
        return value;
    }

    isPositiveStat(key, value) {
        const positiveKeys = ['growth', 'improvement', 'optimization', 'efficiency', 'uptime', 'utilization', 'satisfaction', 'securityScore', 'complianceScore', 'gdpr', 'avgProgress'];
        return positiveKeys.includes(key) || (typeof value === 'number' && value > 0);
    }
}

// Global functions
function showTab(t) { reportsManager.showTab(t); }
function showCreateReportModal() { reportsManager ? document.getElementById('createReportModal').style.display = 'block' : null; }
function showScheduleReportModal() { reportsManager ? document.getElementById('scheduleReportModal').style.display = 'block' : null; }
function exportAllReports() { reportsManager.exportAllReports(); }
function viewReport(id) { reportsManager.viewReport(id); }
function editReport(id) { reportsManager.editReport(id); }
function exportReport(id) { reportsManager.exportReport(id); }
function createCustomReport() { reportsManager.createCustomReport(); }

let reportsManager;
document.addEventListener('DOMContentLoaded', () => {
    reportsManager = new ReportsManager();
});

console.log('✅ CEO Reports System Loaded');
