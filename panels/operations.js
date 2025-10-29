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
            this.loadPerformanceData();
        } else if (tabName === 'optimization') {
            this.loadOptimizationData();
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

    // Chart Functions (Mock implementations)
    updateSystemPerformanceChart() {
        console.log('System performance chart updated');
    }

    updateResourceUtilizationChart() {
        console.log('Resource utilization chart updated');
    }

    // Modal Functions
    showAddProcessModal() {
        document.getElementById('addProcessModal').style.display = 'block';
    }

    showResourceModal() {
        document.getElementById('resourceModal').style.display = 'block';
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

    // Optimization Functions
    runOptimizationAnalysis() {
        showAlert('Optimizasyon analizi başlatıldı!', 'info');
        // In a real implementation, this would run actual optimization algorithms
    }

    generatePerformanceReport() {
        showAlert('Performans raporu oluşturuluyor...', 'info');
        // In a real implementation, this would generate actual reports
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
