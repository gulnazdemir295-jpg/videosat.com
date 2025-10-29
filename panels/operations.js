// Operations Management JavaScript
class OperationsManager {
    constructor() {
        this.processes = this.loadProcesses();
        this.resources = this.loadResources();
        this.performanceData = this.loadPerformanceData();
        this.optimizationData = this.loadOptimizationData();
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderProcesses();
        this.renderResources();
        this.updateOperationsOverview();
        this.loadDashboardData();
        this.setDefaultDates();
        this.setupModalCloseListeners();
        this.renderOptimizationData();
    }

    setupModalCloseListeners() {
        // Close modals when clicking outside
        const modals = ['addProcessModal', 'resourceModal'];
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
        // Search and filter events
        document.getElementById('processSearch')?.addEventListener('input', (e) => {
            this.filterProcesses(e.target.value);
        });

        document.getElementById('processFilter')?.addEventListener('change', (e) => {
            this.filterProcessesByStatus(e.target.value);
        });

        document.getElementById('processCategory')?.addEventListener('change', (e) => {
            this.filterProcessesByCategory(e.target.value);
        });

        // Form submissions
        document.getElementById('addProcessForm')?.addEventListener('submit', (e) => {
            this.handleAddProcess(e);
        });

        document.getElementById('resourceForm')?.addEventListener('submit', (e) => {
            this.handleResourceSubmit(e);
        });

        // Chart period changes
        document.getElementById('performancePeriod')?.addEventListener('change', (e) => {
            this.updateSystemPerformanceChart(e.target.value);
        });

        document.getElementById('resourcePeriod')?.addEventListener('change', (e) => {
            this.updateResourceUtilizationChart(e.target.value);
        });
    }

    setDefaultDates() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        document.getElementById('performanceStartDate').value = startOfMonth.toISOString().split('T')[0];
        document.getElementById('performanceEndDate').value = today.toISOString().split('T')[0];
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
        } else if (tabName === 'performance') {
            this.loadPerformanceCharts();
        } else if (tabName === 'optimization') {
            this.renderOptimizationData();
        }
    }

    // Data Loading
    loadProcesses() {
        const saved = localStorage.getItem('operationalProcesses');
        if (saved) {
            return JSON.parse(saved);
        }

        // Default processes
        return [
            {
                id: 1,
                name: 'Ürün Üretim Süreci',
                category: 'production',
                description: 'E-ticaret ürünlerinin üretim süreci',
                priority: 'high',
                duration: 8,
                resources: 'Üretim ekibi, Makineler, Hammadde',
                status: 'active',
                efficiency: 92.5,
                createdAt: '2024-01-15'
            },
            {
                id: 2,
                name: 'Kalite Kontrol Süreci',
                category: 'quality',
                description: 'Ürün kalite kontrolü ve test süreci',
                priority: 'critical',
                duration: 4,
                resources: 'Kalite kontrol ekibi, Test ekipmanları',
                status: 'active',
                efficiency: 96.8,
                createdAt: '2024-01-20'
            },
            {
                id: 3,
                name: 'Lojistik ve Sevkiyat',
                category: 'logistics',
                description: 'Ürün sevkiyatı ve lojistik süreci',
                priority: 'high',
                duration: 6,
                resources: 'Lojistik ekibi, Araçlar, Depo',
                status: 'active',
                efficiency: 89.2,
                createdAt: '2024-02-01'
            },
            {
                id: 4,
                name: 'Sistem Bakım Süreci',
                category: 'maintenance',
                description: 'Sistem ve ekipman bakım süreci',
                priority: 'medium',
                duration: 12,
                resources: 'Teknik ekip, Bakım araçları',
                status: 'active',
                efficiency: 94.1,
                createdAt: '2024-02-10'
            },
            {
                id: 5,
                name: 'Müşteri Destek Süreci',
                category: 'support',
                description: 'Müşteri hizmetleri ve destek süreci',
                priority: 'high',
                duration: 2,
                resources: 'Destek ekibi, İletişim araçları',
                status: 'active',
                efficiency: 91.7,
                createdAt: '2024-02-15'
            }
        ];
    }

    loadResources() {
        const saved = localStorage.getItem('operationalResources');
        if (saved) {
            return JSON.parse(saved);
        }

        return [
            {
                id: 1,
                name: 'Üretim Ekibi',
                type: 'human',
                capacity: 25,
                cost: 150,
                description: 'Ana üretim ekibi',
                availability: 'business',
                utilization: 87.5,
                status: 'active'
            },
            {
                id: 2,
                name: 'Sunucu Altyapısı',
                type: 'technical',
                capacity: 100,
                cost: 500,
                description: 'Ana sunucu altyapısı',
                availability: '24/7',
                utilization: 76.2,
                status: 'active'
            },
            {
                id: 3,
                name: 'Üretim Makineleri',
                type: 'equipment',
                capacity: 15,
                cost: 200,
                description: 'Üretim makineleri',
                availability: 'business',
                utilization: 92.8,
                status: 'active'
            },
            {
                id: 4,
                name: 'Kalite Kontrol Ekipmanları',
                type: 'equipment',
                capacity: 8,
                cost: 300,
                description: 'Kalite kontrol ekipmanları',
                availability: 'business',
                utilization: 85.4,
                status: 'active'
            },
            {
                id: 5,
                name: 'Lojistik Araçları',
                type: 'equipment',
                capacity: 12,
                cost: 250,
                description: 'Sevkiyat araçları',
                availability: 'business',
                utilization: 78.9,
                status: 'active'
            }
        ];
    }

    loadPerformanceData() {
        return {
            operationalEfficiency: 94.2,
            resourceUtilization: 87.5,
            processQuality: 96.8,
            customerSatisfaction: 92.4,
            systemUptime: 99.7,
            avgPerformance: 91.8
        };
    }

    loadOptimizationData() {
        return {
            recommendations: [
                {
                    id: 1,
                    title: 'Üretim Hattı Optimizasyonu',
                    description: 'Üretim hattında %15 verimlilik artışı sağlanabilir',
                    impact: 'high',
                    effort: 'medium',
                    savings: '₺50,000/ay'
                },
                {
                    id: 2,
                    title: 'Otomatik Kalite Kontrol',
                    description: 'AI destekli kalite kontrol sistemi entegrasyonu',
                    impact: 'high',
                    effort: 'high',
                    savings: '₺30,000/ay'
                },
                {
                    id: 3,
                    title: 'Lojistik Rota Optimizasyonu',
                    description: 'Yapay zeka ile rota optimizasyonu',
                    impact: 'medium',
                    effort: 'low',
                    savings: '₺15,000/ay'
                }
            ],
            bottlenecks: [
                {
                    id: 1,
                    process: 'Kalite Kontrol',
                    severity: 'high',
                    description: 'Kalite kontrol süreci darboğaz oluşturuyor',
                    solution: 'Ek ekipman ve personel gerekli'
                },
                {
                    id: 2,
                    process: 'Lojistik',
                    severity: 'medium',
                    description: 'Sevkiyat süreçlerinde gecikmeler',
                    solution: 'Rota optimizasyonu ve araç artırımı'
                }
            ],
            improvements: [
                {
                    id: 1,
                    area: 'Üretim',
                    improvement: 'Makine verimliliği',
                    currentValue: '87%',
                    targetValue: '95%',
                    timeline: '3 ay'
                },
                {
                    id: 2,
                    area: 'Kalite',
                    improvement: 'Hata oranı azaltma',
                    currentValue: '2.1%',
                    targetValue: '1.0%',
                    timeline: '6 ay'
                }
            ],
            costOptimizations: [
                {
                    id: 1,
                    area: 'Enerji Tasarrufu',
                    currentCost: '₺25,000/ay',
                    potentialSavings: '₺5,000/ay',
                    implementation: 'LED aydınlatma ve akıllı sistemler'
                },
                {
                    id: 2,
                    area: 'Malzeme Optimizasyonu',
                    currentCost: '₺100,000/ay',
                    potentialSavings: '₺12,000/ay',
                    implementation: 'Tedarikçi değişimi ve toplu alım'
                }
            ]
        };
    }

    saveProcesses() {
        localStorage.setItem('operationalProcesses', JSON.stringify(this.processes));
    }

    saveResources() {
        localStorage.setItem('operationalResources', JSON.stringify(this.resources));
    }

    // Render Functions
    renderProcesses() {
        const grid = document.getElementById('processesGrid');
        if (!grid) return;

        grid.innerHTML = this.processes.map(process => `
            <div class="process-card">
                <div class="process-header">
                    <h3>${process.name}</h3>
                    <span class="process-priority ${process.priority}">${this.getPriorityName(process.priority)}</span>
                </div>
                <div class="process-content">
                    <div class="process-info">
                        <div class="info-item">
                            <i class="fas fa-tag"></i>
                            <span>${this.getCategoryName(process.category)}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span>${process.duration} saat</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-chart-line"></i>
                            <span>%${process.efficiency} verimlilik</span>
                        </div>
                    </div>
                    <p class="process-description">${process.description}</p>
                    <div class="process-resources">
                        <strong>Kaynaklar:</strong> ${process.resources}
                    </div>
                    <div class="process-status">
                        <span class="status-badge ${process.status}">${this.getStatusName(process.status)}</span>
                    </div>
                </div>
                <div class="process-actions">
                    <button class="btn btn-outline btn-sm" onclick="operationsManager.editProcess(${process.id})">
                        <i class="fas fa-edit"></i>
                        Düzenle
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="operationsManager.viewProcessDetails(${process.id})">
                        <i class="fas fa-eye"></i>
                        Detaylar
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderResources() {
        this.renderHumanResources();
        this.renderTechnicalResources();
        this.renderEquipmentResources();
    }

    renderHumanResources() {
        const container = document.getElementById('humanResourcesCards');
        if (!container) return;

        const humanResources = this.resources.filter(r => r.type === 'human');
        container.innerHTML = humanResources.map(resource => `
            <div class="resource-card">
                <div class="resource-header">
                    <h4>${resource.name}</h4>
                    <span class="resource-type">İnsan Kaynağı</span>
                </div>
                <div class="resource-content">
                    <div class="resource-metrics">
                        <div class="metric">
                            <span class="metric-label">Kapasite:</span>
                            <span class="metric-value">${resource.capacity}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Kullanım:</span>
                            <span class="metric-value">%${resource.utilization}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Maliyet:</span>
                            <span class="metric-value">₺${resource.cost}/saat</span>
                        </div>
                    </div>
                    <p class="resource-description">${resource.description}</p>
                    <div class="resource-availability">
                        <i class="fas fa-clock"></i>
                        <span>${resource.availability}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderTechnicalResources() {
        const container = document.getElementById('technicalResourcesCards');
        if (!container) return;

        const technicalResources = this.resources.filter(r => r.type === 'technical');
        container.innerHTML = technicalResources.map(resource => `
            <div class="resource-card">
                <div class="resource-header">
                    <h4>${resource.name}</h4>
                    <span class="resource-type">Teknik Kaynak</span>
                </div>
                <div class="resource-content">
                    <div class="resource-metrics">
                        <div class="metric">
                            <span class="metric-label">Kapasite:</span>
                            <span class="metric-value">${resource.capacity}%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Kullanım:</span>
                            <span class="metric-value">%${resource.utilization}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Maliyet:</span>
                            <span class="metric-value">₺${resource.cost}/saat</span>
                        </div>
                    </div>
                    <p class="resource-description">${resource.description}</p>
                    <div class="resource-availability">
                        <i class="fas fa-clock"></i>
                        <span>${resource.availability}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderEquipmentResources() {
        const container = document.getElementById('equipmentResourcesCards');
        if (!container) return;

        const equipmentResources = this.resources.filter(r => r.type === 'equipment');
        container.innerHTML = equipmentResources.map(resource => `
            <div class="resource-card">
                <div class="resource-header">
                    <h4>${resource.name}</h4>
                    <span class="resource-type">Ekipman</span>
                </div>
                <div class="resource-content">
                    <div class="resource-metrics">
                        <div class="metric">
                            <span class="metric-label">Kapasite:</span>
                            <span class="metric-value">${resource.capacity}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Kullanım:</span>
                            <span class="metric-value">%${resource.utilization}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Maliyet:</span>
                            <span class="metric-value">₺${resource.cost}/saat</span>
                        </div>
                    </div>
                    <p class="resource-description">${resource.description}</p>
                    <div class="resource-availability">
                        <i class="fas fa-clock"></i>
                        <span>${resource.availability}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadDashboardData() {
        this.updateProcessStatus();
        this.updateResourceAlerts();
        this.updateSystemPerformanceChart();
        this.updateResourceUtilizationChart();
    }

    updateProcessStatus() {
        const container = document.getElementById('processStatusList');
        if (!container) return;

        container.innerHTML = this.processes.map(process => `
            <div class="process-status-item">
                <div class="process-info">
                    <span class="process-name">${process.name}</span>
                    <span class="process-efficiency">%${process.efficiency}</span>
                </div>
                <div class="process-bar">
                    <div class="process-fill" style="width: ${process.efficiency}%"></div>
                </div>
                <div class="process-status">
                    <span class="status-indicator ${process.status}"></span>
                    <span class="status-text">${this.getStatusName(process.status)}</span>
                </div>
            </div>
        `).join('');
    }

    updateResourceAlerts() {
        const container = document.getElementById('resourceAlertsList');
        if (!container) return;

        const alerts = [
            {
                id: 1,
                type: 'warning',
                message: 'Üretim makineleri %92 kapasitede çalışıyor',
                resource: 'Üretim Makineleri'
            },
            {
                id: 2,
                type: 'info',
                message: 'Kalite kontrol ekipmanları bakım gerektiriyor',
                resource: 'Kalite Kontrol Ekipmanları'
            },
            {
                id: 3,
                type: 'success',
                message: 'Tüm sistemler normal çalışıyor',
                resource: 'Sistem Durumu'
            }
        ];

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">
                    <i class="fas fa-${this.getAlertIcon(alert.type)}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-resource">${alert.resource}</div>
                </div>
            </div>
        `).join('');
    }

    updateOperationsOverview() {
        const data = this.loadPerformanceData();
        
        document.getElementById('overallEfficiency').textContent = data.operationalEfficiency + '%';
        document.getElementById('capacityUtilization').textContent = data.resourceUtilization + '%';
        document.getElementById('avgPerformance').textContent = data.avgPerformance + '%';
        document.getElementById('systemUptime').textContent = data.systemUptime + '%';
    }

    // Chart Functions
    updateSystemPerformanceChart(period = 'daily') {
        const ctx = document.getElementById('systemPerformanceChart');
        if (!ctx || typeof Chart === 'undefined') return;

        // Destroy existing chart if it exists
        if (this.systemPerformanceChart) {
            this.systemPerformanceChart.destroy();
        }

        const periods = {
            daily: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
            weekly: ['Hafta 1', 'Hafta 2', 'Hafta 3', 'Hafta 4'],
            monthly: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran']
        };

        const labels = periods[period] || periods.daily;
        const baseValue = 85;
        const data = labels.map(() => baseValue + (Math.random() * 15 - 5));

        this.systemPerformanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sistem Performansı (%)',
                    data: data,
                    borderColor: 'rgba(99, 102, 241, 1)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Performans: %' + context.parsed.y.toFixed(1);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 70,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    updateResourceUtilizationChart(period = 'realtime') {
        const ctx = document.getElementById('resourceUtilizationChart');
        if (!ctx || typeof Chart === 'undefined') return;

        // Destroy existing chart if it exists
        if (this.resourceUtilizationChart) {
            this.resourceUtilizationChart.destroy();
        }

        const resourceTypes = ['İnsan', 'Teknik', 'Ekipman', 'Yazılım'];
        const utilizationData = this.resources.reduce((acc, resource) => {
            const type = this.getResourceTypeName(resource.type);
            if (!acc[type]) acc[type] = [];
            acc[type].push(resource.utilization);
            return acc;
        }, {});

        const datasets = Object.keys(utilizationData).map((type, index) => {
            const colors = [
                'rgba(34, 197, 94, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(168, 85, 247, 0.8)'
            ];
            return {
                label: type,
                data: utilizationData[type],
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length].replace('0.8', '1'),
                borderWidth: 1
            };
        });

        this.resourceUtilizationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.resources.map(r => r.name),
                datasets: datasets.length > 0 ? datasets : [{
                    label: 'Kaynak Kullanımı (%)',
                    data: this.resources.map(r => r.utilization),
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: datasets.length > 1,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Kullanım: %' + context.parsed.y.toFixed(1);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    loadPerformanceCharts() {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }

        // Performance Trend Chart
        const trendCtx = document.getElementById('performanceTrendChart');
        if (trendCtx) {
            const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
            const efficiencyData = months.map(() => 85 + Math.random() * 15 - 5);

            if (this.performanceTrendChart) {
                this.performanceTrendChart.destroy();
            }

            this.performanceTrendChart = new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Operasyonel Verimlilik (%)',
                        data: efficiencyData,
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
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 70,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            });
        }

        // KPI Comparison Chart
        const kpiCtx = document.getElementById('kpiComparisonChart');
        if (kpiCtx) {
            const performanceData = this.loadPerformanceData();
            const kpis = ['Verimlilik', 'Kaynak Kullanımı', 'Süreç Kalitesi', 'Müşteri Memnuniyeti'];
            const values = [
                performanceData.operationalEfficiency,
                performanceData.resourceUtilization,
                performanceData.processQuality,
                performanceData.customerSatisfaction
            ];

            if (this.kpiComparisonChart) {
                this.kpiComparisonChart.destroy();
            }

            this.kpiComparisonChart = new Chart(kpiCtx, {
                type: 'radar',
                data: {
                    labels: kpis,
                    datasets: [{
                        label: 'KPI Değerleri',
                        data: values,
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(99, 102, 241, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: false,
                            min: 70,
                            max: 100,
                            ticks: {
                                stepSize: 10
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    }
                }
            });
        }
    }

    // Modal Functions
    showAddProcessModal() {
        const modal = document.getElementById('addProcessModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    showResourceModal() {
        const modal = document.getElementById('resourceModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    // Form Handlers
    handleAddProcess(e) {
        e.preventDefault();
        
        const newProcess = {
            id: Date.now(),
            name: document.getElementById('processName').value,
            category: document.getElementById('processCategory').value,
            description: document.getElementById('processDescription').value,
            priority: document.getElementById('processPriority').value,
            duration: parseFloat(document.getElementById('processDuration').value),
            resources: document.getElementById('processResources').value,
            status: 'active',
            efficiency: Math.floor(Math.random() * 20) + 80, // Mock efficiency
            createdAt: new Date().toISOString()
        };

        this.processes.push(newProcess);
        this.saveProcesses();
        this.renderProcesses();
        this.updateProcessStatus();
        
        closeModal('addProcessModal');
        showAlert('Süreç başarıyla eklendi!', 'success');
        e.target.reset();
    }

    handleResourceSubmit(e) {
        e.preventDefault();
        
        const newResource = {
            id: Date.now(),
            name: document.getElementById('resourceName').value,
            type: document.getElementById('resourceType').value,
            capacity: parseInt(document.getElementById('resourceCapacity').value),
            cost: parseFloat(document.getElementById('resourceCost').value) || 0,
            description: document.getElementById('resourceDescription').value,
            availability: document.getElementById('resourceAvailability').value,
            utilization: Math.floor(Math.random() * 30) + 70, // Mock utilization
            status: 'active'
        };

        this.resources.push(newResource);
        this.saveResources();
        this.renderResources();
        
        closeModal('resourceModal');
        showAlert('Kaynak başarıyla eklendi!', 'success');
        e.target.reset();
    }

    // Process Actions
    editProcess(processId) {
        showAlert('Süreç düzenleme özelliği yakında eklenecek!', 'info');
    }

    viewProcessDetails(processId) {
        const process = this.processes.find(p => p.id === processId);
        if (!process) return;

        const details = `
            Süreç: ${process.name}
            Kategori: ${this.getCategoryName(process.category)}
            Açıklama: ${process.description}
            Öncelik: ${this.getPriorityName(process.priority)}
            Süre: ${process.duration} saat
            Verimlilik: %${process.efficiency}
            Kaynaklar: ${process.resources}
            Durum: ${this.getStatusName(process.status)}
        `;
        
        alert(details);
    }

    // Filter Functions
    filterProcesses(searchTerm) {
        const filtered = this.processes.filter(process => 
            process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            process.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredProcesses(filtered);
    }

    filterProcessesByStatus(status) {
        if (!status) {
            this.renderProcesses();
            return;
        }

        const filtered = this.processes.filter(process => process.status === status);
        this.renderFilteredProcesses(filtered);
    }

    filterProcessesByCategory(category) {
        if (!category) {
            this.renderProcesses();
            return;
        }

        const filtered = this.processes.filter(process => process.category === category);
        this.renderFilteredProcesses(filtered);
    }

    renderFilteredProcesses(processes) {
        const grid = document.getElementById('processesGrid');
        if (!grid) return;

        grid.innerHTML = processes.map(process => `
            <div class="process-card">
                <div class="process-header">
                    <h3>${process.name}</h3>
                    <span class="process-priority ${process.priority}">${this.getPriorityName(process.priority)}</span>
                </div>
                <div class="process-content">
                    <div class="process-info">
                        <div class="info-item">
                            <i class="fas fa-tag"></i>
                            <span>${this.getCategoryName(process.category)}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span>${process.duration} saat</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-chart-line"></i>
                            <span>%${process.efficiency} verimlilik</span>
                        </div>
                    </div>
                    <p class="process-description">${process.description}</p>
                    <div class="process-resources">
                        <strong>Kaynaklar:</strong> ${process.resources}
                    </div>
                    <div class="process-status">
                        <span class="status-badge ${process.status}">${this.getStatusName(process.status)}</span>
                    </div>
                </div>
                <div class="process-actions">
                    <button class="btn btn-outline btn-sm" onclick="operationsManager.editProcess(${process.id})">
                        <i class="fas fa-edit"></i>
                        Düzenle
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="operationsManager.viewProcessDetails(${process.id})">
                        <i class="fas fa-eye"></i>
                        Detaylar
                    </button>
                </div>
            </div>
        `).join('');
    }

    generatePerformanceReport() {
        const startDate = document.getElementById('performanceStartDate').value;
        const endDate = document.getElementById('performanceEndDate').value;
        
        if (!startDate || !endDate) {
            showAlert('Lütfen başlangıç ve bitiş tarihlerini seçin!', 'error');
            return;
        }

        showAlert('Performans raporu oluşturuluyor...', 'info');
        
        // Generate report data
        const reportData = {
            period: {
                start: startDate,
                end: endDate
            },
            metrics: this.loadPerformanceData(),
            processes: this.processes,
            resources: this.resources,
            generatedAt: new Date().toISOString()
        };

        // Create and download report
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-report-${startDate}-${endDate}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showAlert('Performans raporu başarıyla oluşturuldu!', 'success');
    }

    exportOperationsData() {
        const data = {
            processes: this.processes,
            resources: this.resources,
            performanceData: this.loadPerformanceData(),
            optimizationData: this.loadOptimizationData(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `operations-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showAlert('Operasyon verileri başarıyla dışa aktarıldı!', 'success');
    }

    // Utility Functions
    getCategoryName(category) {
        const categories = {
            'production': 'Üretim',
            'logistics': 'Lojistik',
            'quality': 'Kalite',
            'maintenance': 'Bakım',
            'support': 'Destek'
        };
        return categories[category] || category;
    }

    getPriorityName(priority) {
        const priorities = {
            'low': 'Düşük',
            'medium': 'Orta',
            'high': 'Yüksek',
            'critical': 'Kritik'
        };
        return priorities[priority] || priority;
    }

    getStatusName(status) {
        const statuses = {
            'active': 'Aktif',
            'inactive': 'Pasif',
            'optimized': 'Optimize Edilmiş'
        };
        return statuses[status] || status;
    }

    // Optimization Functions
    renderOptimizationData() {
        const optimizationData = this.loadOptimizationData();
        this.renderRecommendations(optimizationData.recommendations);
        this.renderBottlenecks(optimizationData.bottlenecks);
        this.renderImprovements(optimizationData.improvements);
        this.renderCostOptimizations(optimizationData.costOptimizations);
    }

    renderRecommendations(recommendations) {
        const container = document.getElementById('optimizationRecommendations');
        if (!container) return;

        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <div class="recommendation-header">
                    <h4>${rec.title}</h4>
                    <span class="impact-badge ${rec.impact}">${this.getImpactName(rec.impact)} Etki</span>
                </div>
                <p class="recommendation-description">${rec.description}</p>
                <div class="recommendation-footer">
                    <span class="effort-badge">${this.getEffortName(rec.effort)}</span>
                    <span class="savings-badge">${rec.savings}</span>
                </div>
            </div>
        `).join('');
    }

    renderBottlenecks(bottlenecks) {
        const container = document.getElementById('bottlenecksList');
        if (!container) return;

        container.innerHTML = bottlenecks.map(bottleneck => `
            <div class="bottleneck-item">
                <div class="bottleneck-header">
                    <h4>${bottleneck.process}</h4>
                    <span class="severity-badge ${bottleneck.severity}">${this.getSeverityName(bottleneck.severity)}</span>
                </div>
                <p class="bottleneck-description">${bottleneck.description}</p>
                <div class="bottleneck-solution">
                    <strong>Çözüm:</strong> ${bottleneck.solution}
                </div>
            </div>
        `).join('');
    }

    renderImprovements(improvements) {
        const container = document.getElementById('efficiencyImprovements');
        if (!container) return;

        container.innerHTML = improvements.map(improvement => `
            <div class="improvement-item">
                <div class="improvement-header">
                    <h4>${improvement.area}</h4>
                    <span class="improvement-timeline">${improvement.timeline}</span>
                </div>
                <p class="improvement-name">${improvement.improvement}</p>
                <div class="improvement-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(parseFloat(improvement.currentValue) / parseFloat(improvement.targetValue)) * 100}%"></div>
                    </div>
                    <div class="progress-values">
                        <span>Mevcut: ${improvement.currentValue}</span>
                        <span>Hedef: ${improvement.targetValue}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCostOptimizations(costOptimizations) {
        const container = document.getElementById('costOptimizations');
        if (!container) return;

        container.innerHTML = costOptimizations.map(opt => {
            const savingsPercent = (parseFloat(opt.potentialSavings.replace(/[^\d.]/g, '')) / parseFloat(opt.currentCost.replace(/[^\d.]/g, ''))) * 100;
            return `
                <div class="cost-optimization-item">
                    <div class="cost-header">
                        <h4>${opt.area}</h4>
                        <span class="savings-percent">%${savingsPercent.toFixed(1)} Tasarruf</span>
                    </div>
                    <div class="cost-details">
                        <div class="cost-item">
                            <span class="cost-label">Mevcut Maliyet:</span>
                            <span class="cost-value">${opt.currentCost}</span>
                        </div>
                        <div class="cost-item">
                            <span class="cost-label">Potansiyel Tasarruf:</span>
                            <span class="cost-value savings">${opt.potentialSavings}</span>
                        </div>
                    </div>
                    <p class="cost-implementation">${opt.implementation}</p>
                </div>
            `;
        }).join('');
    }

    runOptimizationAnalysis() {
        showAlert('Optimizasyon analizi başlatıldı!', 'info');
        // Reload optimization data
        setTimeout(() => {
            this.renderOptimizationData();
            showAlert('Optimizasyon analizi tamamlandı!', 'success');
        }, 2000);
    }

    getResourceTypeName(type) {
        const types = {
            'human': 'İnsan',
            'technical': 'Teknik',
            'equipment': 'Ekipman',
            'software': 'Yazılım'
        };
        return types[type] || type;
    }

    getImpactName(impact) {
        const impacts = {
            'high': 'Yüksek',
            'medium': 'Orta',
            'low': 'Düşük'
        };
        return impacts[impact] || impact;
    }

    getEffortName(effort) {
        const efforts = {
            'high': 'Yüksek Çaba',
            'medium': 'Orta Çaba',
            'low': 'Düşük Çaba'
        };
        return efforts[effort] || effort;
    }

    getSeverityName(severity) {
        const severities = {
            'high': 'Yüksek',
            'medium': 'Orta',
            'low': 'Düşük'
        };
        return severities[severity] || severity;
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
    operationsManager.showTab(tabName);
}

function showAddProcessModal() {
    operationsManager.showAddProcessModal();
}

function showResourceModal() {
    operationsManager.showResourceModal();
}

function exportOperationsData() {
    operationsManager.exportOperationsData();
}

function generatePerformanceReport() {
    operationsManager.generatePerformanceReport();
}

function runOptimizationAnalysis() {
    operationsManager.runOptimizationAnalysis();
}

// Initialize Operations Manager
let operationsManager;
document.addEventListener('DOMContentLoaded', function() {
    operationsManager = new OperationsManager();
});

console.log('✅ Operations Management System Loaded');
