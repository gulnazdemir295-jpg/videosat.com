// Marketing & Advertising Management JavaScript
class MarketingManager {
    constructor() {
        this.campaigns = this.loadCampaigns();
        this.ads = this.loadAds();
        this.segments = this.loadSegments();
        this.currentTab = 'campaigns';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCampaigns();
        this.renderAds();
        this.renderSegments();
        this.updateOverview();
        this.loadDashboardData();
        this.setDefaultDates();
        this.setupModalCloseListeners();
    }

    setupModalCloseListeners() {
        const modals = ['addCampaignModal', 'addAdModal', 'addSegmentModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        closeModal(modalId);
                    }
                });
            }
        });
    }

    setupEventListeners() {
        document.getElementById('campaignSearch')?.addEventListener('input', (e) => this.filterCampaigns(e.target.value));
        document.getElementById('campaignStatusFilter')?.addEventListener('change', (e) => this.filterCampaignsByStatus(e.target.value));
        document.getElementById('campaignTypeFilter')?.addEventListener('change', (e) => this.filterCampaignsByType(e.target.value));

        document.getElementById('adSearch')?.addEventListener('input', (e) => this.filterAds(e.target.value));
        document.getElementById('adPlatformFilter')?.addEventListener('change', (e) => this.filterAdsByPlatform(e.target.value));
        document.getElementById('adStatusFilter')?.addEventListener('change', (e) => this.filterAdsByStatus(e.target.value));

        document.getElementById('addCampaignForm')?.addEventListener('submit', (e) => this.handleAddCampaign(e));
        document.getElementById('addAdForm')?.addEventListener('submit', (e) => this.handleAddAd(e));
        document.getElementById('addSegmentForm')?.addEventListener('submit', (e) => this.handleAddSegment(e));

        document.getElementById('analyticsPeriod')?.addEventListener('change', () => this.updateAnalytics());
    }

    setDefaultDates() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        document.getElementById('analyticsStartDate').value = startOfMonth.toISOString().split('T')[0];
        document.getElementById('analyticsEndDate').value = today.toISOString().split('T')[0];
    }

    // Tabs
    showTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`${tabName}-tab`)?.classList.add('active');
        document.querySelector(`[onclick="showTab('${tabName}')"]`)?.classList.add('active');
        this.currentTab = tabName;
        if (tabName === 'analytics') this.loadAnalyticsData();
    }

    // Load mock data
    loadCampaigns() {
        const saved = localStorage.getItem('marketingCampaigns');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'C-001', name: 'VideoSat Canlı Yayın Tanıtımı', type: 'social', budget: 50000, spent: 32500, status: 'active', roi: 185, startDate: '2024-10-01', endDate: '2024-11-30' },
            { id: 'C-002', name: 'Google Ads Arama Kampanyası', type: 'search', budget: 25000, spent: 18900, status: 'active', roi: 220, startDate: '2024-10-15', endDate: '2024-12-15' },
            { id: 'C-003', name: 'Instagram Story Reklamları', type: 'social', budget: 15000, spent: 12000, status: 'paused', roi: 165, startDate: '2024-09-01', endDate: '2024-10-31' },
            { id: 'C-004', name: 'YouTube Video Reklamları', type: 'video', budget: 30000, spent: 30000, status: 'completed', roi: 195, startDate: '2024-08-01', endDate: '2024-09-30' }
        ];
    }

    loadAds() {
        const saved = localStorage.getItem('marketingAds');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'A-001', name: 'VideoSat Canlı Yayın Tanıtımı', platform: 'facebook', status: 'active', impressions: 125430, clicks: 3250, ctr: 2.59, budget: 5000 },
            { id: 'A-002', name: 'Google Arama Reklamı', platform: 'google', status: 'active', impressions: 89000, clicks: 2100, ctr: 2.36, budget: 3000 },
            { id: 'A-003', name: 'Instagram Story Ad', platform: 'instagram', status: 'paused', impressions: 67000, clicks: 1800, ctr: 2.69, budget: 2000 }
        ];
    }

    loadSegments() {
        const saved = localStorage.getItem('marketingSegments');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'S-001', name: 'VIP Müşteriler', size: 1250, avgSpending: 8500, engagement: 85, loyalty: 9.2, criteria: ['Aylık harcama > ₺5,000', 'Son 6 ayda aktif', 'Canlı yayın katılımı > 10'] },
            { id: 'S-002', name: 'Yeni Müşteriler', size: 3450, avgSpending: 450, engagement: 65, loyalty: 6.8, criteria: ['Kayıt tarihi < 30 gün', 'İlk sipariş tamamlandı', 'Email doğrulandı'] },
            { id: 'S-003', name: 'Risk Altındaki Müşteriler', size: 890, avgSpending: 2100, engagement: 15, loyalty: 3.2, criteria: ['Son 60 günde aktivite yok', 'Önceki harcama > ₺1,000', 'Email açma oranı < 10%'] }
        ];
    }

    saveCampaigns() { localStorage.setItem('marketingCampaigns', JSON.stringify(this.campaigns)); }
    saveAds() { localStorage.setItem('marketingAds', JSON.stringify(this.ads)); }
    saveSegments() { localStorage.setItem('marketingSegments', JSON.stringify(this.segments)); }

    // Overview
    updateOverview() {
        const activeCampaigns = this.campaigns.filter(c => c.status === 'active').length;
        const totalBudget = this.campaigns.reduce((sum, c) => sum + c.budget, 0);
        const totalImpressions = this.ads.reduce((sum, a) => sum + a.impressions, 0);
        const totalClicks = this.ads.reduce((sum, a) => sum + a.clicks, 0);
        const avgROI = this.campaigns.reduce((sum, c) => sum + c.roi, 0) / this.campaigns.length;
        const totalLeads = Math.floor(totalClicks * 0.15); // Mock calculation

        document.getElementById('totalCampaigns').textContent = this.formatNumber(activeCampaigns);
        document.getElementById('totalBudget').textContent = this.formatCurrency(totalBudget);
        document.getElementById('totalImpressions').textContent = this.formatNumber(totalImpressions);
        document.getElementById('totalClicks').textContent = this.formatNumber(totalClicks);
        document.getElementById('avgROI').textContent = avgROI.toFixed(0) + '%';
        document.getElementById('totalLeads').textContent = this.formatNumber(totalLeads);
    }

    // Renderers
    renderCampaigns() {
        const tbody = document.getElementById('campaignsTableBody');
        if (!tbody) return;
        tbody.innerHTML = this.campaigns.map(c => `
            <tr>
                <td><strong>${c.name}</strong></td>
                <td><span class="type-badge ${c.type}">${this.getTypeName(c.type)}</span></td>
                <td>${this.formatCurrency(c.budget)}</td>
                <td>${this.formatCurrency(c.spent)}</td>
                <td><span class="status-badge ${c.status}">${this.getStatusName(c.status)}</span></td>
                <td><span class="roi-badge ${c.roi > 200 ? 'high' : c.roi > 150 ? 'medium' : 'low'}">${c.roi}%</span></td>
                <td>${this.formatDate(c.startDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="marketingManager.viewCampaign('${c.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="marketingManager.editCampaign('${c.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-xs" onclick="marketingManager.pauseCampaign('${c.id}')">
                            <i class="fas fa-pause"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderAds() {
        const grid = document.querySelector('.ads-grid');
        if (!grid) return;
        grid.innerHTML = this.ads.map(a => `
            <div class="ad-item">
                <div class="ad-preview">
                    <img src="https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=${encodeURIComponent(a.name)}" alt="Ad Preview">
                </div>
                <div class="ad-info">
                    <h4>${a.name}</h4>
                    <p>Platform: ${this.getPlatformName(a.platform)}</p>
                    <p>Durum: <span class="status-badge ${a.status}">${this.getStatusName(a.status)}</span></p>
                    <p>Görüntülenme: ${this.formatNumber(a.impressions)}</p>
                    <p>Tıklama: ${this.formatNumber(a.clicks)}</p>
                    <p>CTR: ${a.ctr}%</p>
                </div>
                <div class="ad-actions">
                    <button class="btn btn-outline btn-xs" onclick="marketingManager.viewAdDetails('${a.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-xs" onclick="marketingManager.editAd('${a.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-xs" onclick="marketingManager.pauseAd('${a.id}')">
                        <i class="fas fa-pause"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderSegments() {
        const grid = document.querySelector('.segments-grid');
        if (!grid) return;
        grid.innerHTML = this.segments.map(s => `
            <div class="segment-card">
                <div class="segment-header">
                    <h3>${s.name}</h3>
                    <span class="segment-size">${this.formatNumber(s.size)} kişi</span>
                </div>
                <div class="segment-criteria">
                    <p><strong>Kriterler:</strong></p>
                    <ul>
                        ${s.criteria.map(c => `<li>${c}</li>`).join('')}
                    </ul>
                </div>
                <div class="segment-stats">
                    <p>Ortalama Harcama: ${this.formatCurrency(s.avgSpending)}</p>
                    <p>Etkileşim Oranı: ${s.engagement}%</p>
                    <p>Sadakat Skoru: ${s.loyalty}/10</p>
                </div>
                <div class="segment-actions">
                    <button class="btn btn-outline btn-xs" onclick="marketingManager.viewSegmentDetails('${s.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-xs" onclick="marketingManager.editSegment('${s.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-primary btn-xs" onclick="marketingManager.createCampaignForSegment('${s.id}')">
                        <i class="fas fa-bullhorn"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadDashboardData() {
        this.updateSocialStats();
    }

    updateSocialStats() {
        // Mock social media stats
        document.getElementById('totalFollowers').textContent = '45,230';
        document.getElementById('monthlyEngagement').textContent = '12,450';
        document.getElementById('engagementRate').textContent = '3.2%';
        document.getElementById('totalReach').textContent = '89,120';
    }

    // Campaign actions
    viewCampaign(id) {
        const c = this.campaigns.find(x => x.id === id);
        if (!c) return;
        alert(`Kampanya: ${c.name}\nTür: ${this.getTypeName(c.type)}\nBütçe: ${this.formatCurrency(c.budget)}\nHarcama: ${this.formatCurrency(c.spent)}\nROI: ${c.roi}%`);
    }

    editCampaign(id) {
        const c = this.campaigns.find(x => x.id === id);
        if (!c) return;
        showAlert('Kampanya düzenleme özelliği yakında eklenecek', 'info');
    }

    pauseCampaign(id) {
        const c = this.campaigns.find(x => x.id === id);
        if (!c) return;
        c.status = c.status === 'active' ? 'paused' : 'active';
        this.saveCampaigns();
        this.renderCampaigns();
        this.updateOverview();
        showAlert(`Kampanya ${c.status === 'active' ? 'aktifleştirildi' : 'duraklatıldı'}`, 'success');
    }

    handleAddCampaign(e) {
        e.preventDefault();
        const newCampaign = {
            id: 'C-' + (100 + Math.floor(Math.random() * 900)),
            name: document.getElementById('campaignName').value,
            type: document.getElementById('campaignType').value,
            budget: parseInt(document.getElementById('campaignBudget').value),
            spent: 0,
            status: 'draft',
            roi: 0,
            startDate: document.getElementById('campaignStartDate').value,
            endDate: document.getElementById('campaignEndDate').value
        };
        this.campaigns.unshift(newCampaign);
        this.saveCampaigns();
        this.renderCampaigns();
        this.updateOverview();
        closeModal('addCampaignModal');
        showAlert('Kampanya oluşturuldu', 'success');
        e.target.reset();
    }

    // Ad actions
    viewAdDetails(id) {
        const a = this.ads.find(x => x.id === id);
        if (!a) return;
        alert(`Reklam: ${a.name}\nPlatform: ${this.getPlatformName(a.platform)}\nGörüntülenme: ${this.formatNumber(a.impressions)}\nTıklama: ${this.formatNumber(a.clicks)}\nCTR: ${a.ctr}%`);
    }

    editAd(id) {
        showAlert('Reklam düzenleme özelliği yakında eklenecek', 'info');
    }

    pauseAd(id) {
        const a = this.ads.find(x => x.id === id);
        if (!a) return;
        a.status = a.status === 'active' ? 'paused' : 'active';
        this.saveAds();
        this.renderAds();
        showAlert(`Reklam ${a.status === 'active' ? 'aktifleştirildi' : 'duraklatıldı'}`, 'success');
    }

    handleAddAd(e) {
        e.preventDefault();
        const newAd = {
            id: 'A-' + (100 + Math.floor(Math.random() * 900)),
            name: document.getElementById('adName').value,
            platform: document.getElementById('adPlatform').value,
            status: 'draft',
            impressions: 0,
            clicks: 0,
            ctr: 0,
            budget: parseInt(document.getElementById('adBudget').value)
        };
        this.ads.unshift(newAd);
        this.saveAds();
        this.renderAds();
        closeModal('addAdModal');
        showAlert('Reklam oluşturuldu', 'success');
        e.target.reset();
    }

    // Segment actions
    viewSegmentDetails(id) {
        const s = this.segments.find(x => x.id === id);
        if (!s) return;
        alert(`Segment: ${s.name}\nBoyut: ${this.formatNumber(s.size)} kişi\nOrtalama Harcama: ${this.formatCurrency(s.avgSpending)}\nEtkileşim: ${s.engagement}%\nSadakat: ${s.loyalty}/10`);
    }

    editSegment(id) {
        showAlert('Segment düzenleme özelliği yakında eklenecek', 'info');
    }

    createCampaignForSegment(id) {
        const s = this.segments.find(x => x.id === id);
        if (!s) return;
        showAlert(`${s.name} segmenti için kampanya oluşturma özelliği yakında eklenecek`, 'info');
    }

    handleAddSegment(e) {
        e.preventDefault();
        const newSegment = {
            id: 'S-' + (100 + Math.floor(Math.random() * 900)),
            name: document.getElementById('segmentName').value,
            size: Math.floor(Math.random() * 5000) + 500,
            avgSpending: Math.floor(Math.random() * 10000) + 500,
            engagement: Math.floor(Math.random() * 100),
            loyalty: (Math.random() * 10).toFixed(1),
            criteria: document.getElementById('segmentCriteria').value.split('\n').filter(c => c.trim())
        };
        this.segments.unshift(newSegment);
        this.saveSegments();
        this.renderSegments();
        closeModal('addSegmentModal');
        showAlert('Segment oluşturuldu', 'success');
        e.target.reset();
    }

    // Social media actions
    manageFacebook() { showAlert('Facebook yönetimi yakında eklenecek', 'info'); }
    manageInstagram() { showAlert('Instagram yönetimi yakında eklenecek', 'info'); }
    manageYouTube() { showAlert('YouTube yönetimi yakında eklenecek', 'info'); }
    connectTwitter() { showAlert('Twitter bağlantısı yakında eklenecek', 'info'); }

    // Analytics
    loadAnalyticsData() {
        this.updateAnalytics();
    }

    updateAnalytics() {
        if (typeof Chart === 'undefined') return;
        this.updateCampaignPerformanceChart();
        this.updateROITrendChart();
        this.updatePlatformDistributionChart();
        this.updateCustomerAcquisitionChart();
    }

    updateCampaignPerformanceChart() {
        const ctx = document.getElementById('campaignPerformanceChart');
        if (!ctx) return;
        if (this.campaignPerformanceChart) this.campaignPerformanceChart.destroy();
        const campaigns = this.campaigns.slice(0, 5).map(c => c.name);
        const performance = campaigns.map(() => Math.random() * 100);
        this.campaignPerformanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: campaigns,
                datasets: [{
                    label: 'Performans',
                    data: performance,
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
    }

    updateROITrendChart() {
        const ctx = document.getElementById('roiTrendChart');
        if (!ctx) return;
        if (this.roiTrendChart) this.roiTrendChart.destroy();
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
        const roi = months.map(() => 1 + Math.random() * 3);
        this.roiTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'ROI',
                    data: roi,
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true } }
            }
        });
    }

    updatePlatformDistributionChart() {
        const ctx = document.getElementById('platformDistributionChart');
        if (!ctx) return;
        if (this.platformDistributionChart) this.platformDistributionChart.destroy();
        const platforms = ['Facebook', 'Google', 'Instagram', 'YouTube'];
        const distribution = platforms.map(() => Math.random() * 30);
        this.platformDistributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: platforms,
                datasets: [{
                    data: distribution,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    updateCustomerAcquisitionChart() {
        const ctx = document.getElementById('customerAcquisitionChart');
        if (!ctx) return;
        if (this.customerAcquisitionChart) this.customerAcquisitionChart.destroy();
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
        const acquisitions = months.map(() => Math.floor(Math.random() * 500 + 100));
        this.customerAcquisitionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Müşteri Kazanımı',
                    data: acquisitions,
                    backgroundColor: 'rgba(168, 85, 247, 0.8)',
                    borderColor: 'rgba(168, 85, 247, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    // Filters
    filterCampaigns(q) {
        const filtered = this.campaigns.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
        this.renderFilteredCampaigns(filtered);
    }

    filterCampaignsByStatus(s) {
        if (!s) { this.renderCampaigns(); return; }
        this.renderFilteredCampaigns(this.campaigns.filter(c => c.status === s));
    }

    filterCampaignsByType(t) {
        if (!t) { this.renderCampaigns(); return; }
        this.renderFilteredCampaigns(this.campaigns.filter(c => c.type === t));
    }

    filterAds(q) {
        const filtered = this.ads.filter(a => a.name.toLowerCase().includes(q.toLowerCase()));
        this.renderFilteredAds(filtered);
    }

    filterAdsByPlatform(p) {
        if (!p) { this.renderAds(); return; }
        this.renderFilteredAds(this.ads.filter(a => a.platform === p));
    }

    filterAdsByStatus(s) {
        if (!s) { this.renderAds(); return; }
        this.renderFilteredAds(this.ads.filter(a => a.status === s));
    }

    renderFilteredCampaigns(rows) {
        const tbody = document.getElementById('campaignsTableBody');
        if (!tbody) return;
        tbody.innerHTML = rows.map(c => `
            <tr>
                <td><strong>${c.name}</strong></td>
                <td><span class="type-badge ${c.type}">${this.getTypeName(c.type)}</span></td>
                <td>${this.formatCurrency(c.budget)}</td>
                <td>${this.formatCurrency(c.spent)}</td>
                <td><span class="status-badge ${c.status}">${this.getStatusName(c.status)}</span></td>
                <td><span class="roi-badge ${c.roi > 200 ? 'high' : c.roi > 150 ? 'medium' : 'low'}">${c.roi}%</span></td>
                <td>${this.formatDate(c.startDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="marketingManager.viewCampaign('${c.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="marketingManager.editCampaign('${c.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-xs" onclick="marketingManager.pauseCampaign('${c.id}')">
                            <i class="fas fa-pause"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderFilteredAds(rows) {
        const grid = document.querySelector('.ads-grid');
        if (!grid) return;
        grid.innerHTML = rows.map(a => `
            <div class="ad-item">
                <div class="ad-preview">
                    <img src="https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=${encodeURIComponent(a.name)}" alt="Ad Preview">
                </div>
                <div class="ad-info">
                    <h4>${a.name}</h4>
                    <p>Platform: ${this.getPlatformName(a.platform)}</p>
                    <p>Durum: <span class="status-badge ${a.status}">${this.getStatusName(a.status)}</span></p>
                    <p>Görüntülenme: ${this.formatNumber(a.impressions)}</p>
                    <p>Tıklama: ${this.formatNumber(a.clicks)}</p>
                    <p>CTR: ${a.ctr}%</p>
                </div>
                <div class="ad-actions">
                    <button class="btn btn-outline btn-xs" onclick="marketingManager.viewAdDetails('${a.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-xs" onclick="marketingManager.editAd('${a.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-xs" onclick="marketingManager.pauseAd('${a.id}')">
                        <i class="fas fa-pause"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Export
    exportMarketingData() {
        const data = {
            campaigns: this.campaigns,
            ads: this.ads,
            segments: this.segments,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marketing-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showAlert('Pazarlama verileri dışa aktarıldı', 'success');
    }

    // Utils
    formatNumber(n) { return new Intl.NumberFormat('tr-TR').format(n); }
    formatCurrency(n) { return '₺' + new Intl.NumberFormat('tr-TR').format(n); }
    formatDate(d) { return new Date(d).toLocaleDateString('tr-TR'); }

    getTypeName(t) { return ({ social: 'Sosyal Medya', search: 'Arama', display: 'Display', video: 'Video', email: 'Email' })[t] || t; }
    getPlatformName(p) { return ({ facebook: 'Facebook', google: 'Google', instagram: 'Instagram', youtube: 'YouTube', twitter: 'Twitter' })[p] || p; }
    getStatusName(s) { return ({ active: 'Aktif', paused: 'Duraklatıldı', completed: 'Tamamlandı', draft: 'Taslak', rejected: 'Reddedildi' })[s] || s; }
}

// Global functions
function showTab(t) { marketingManager.showTab(t); }
function showAddCampaignModal() { marketingManager ? document.getElementById('addCampaignModal').style.display = 'block' : null; }
function showAddAdModal() { marketingManager ? document.getElementById('addAdModal').style.display = 'block' : null; }
function showAddSegmentModal() { marketingManager ? document.getElementById('addSegmentModal').style.display = 'block' : null; }
function exportMarketingData() { marketingManager.exportMarketingData(); }
function downloadAnalytics(type) { showAlert(`${type} raporu yakında`, 'info'); }
function viewAdDetails(id) { marketingManager.viewAdDetails(id); }
function editAd(id) { marketingManager.editAd(id); }
function pauseAd(id) { marketingManager.pauseAd(id); }
function viewSegmentDetails(id) { marketingManager.viewSegmentDetails(id); }
function editSegment(id) { marketingManager.editSegment(id); }
function createCampaignForSegment(id) { marketingManager.createCampaignForSegment(id); }
function createRetentionCampaign(id) { showAlert('Sadakat kampanyası oluşturma özelliği yakında eklenecek', 'info'); }
function manageFacebook() { marketingManager.manageFacebook(); }
function manageInstagram() { marketingManager.manageInstagram(); }
function manageYouTube() { marketingManager.manageYouTube(); }
function connectTwitter() { marketingManager.connectTwitter(); }

let marketingManager;
document.addEventListener('DOMContentLoaded', () => {
    marketingManager = new MarketingManager();
});

console.log('✅ Marketing & Advertising System Loaded');
