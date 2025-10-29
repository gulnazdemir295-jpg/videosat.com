// Security Management JavaScript
class SecurityManager {
    constructor() {
        this.threats = this.loadThreats();
        this.incidents = this.loadIncidents();
        this.users = this.loadUsers();
        this.policies = this.loadPolicies();
        this.compliance = this.loadCompliance();
        this.currentTab = 'threats';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderThreats();
        this.renderIncidents();
        this.renderUsers();
        this.renderPolicies();
        this.renderCompliance();
        this.updateOverview();
        this.loadDashboardData();
        this.setDefaultDates();
        this.setupModalCloseListeners();
    }

    setupModalCloseListeners() {
        const modals = ['addSecurityPolicyModal', 'addIncidentModal'];
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
        document.getElementById('threatSearch')?.addEventListener('input', (e) => this.filterThreats(e.target.value));
        document.getElementById('threatSeverityFilter')?.addEventListener('change', (e) => this.filterThreatsBySeverity(e.target.value));
        document.getElementById('threatStatusFilter')?.addEventListener('change', (e) => this.filterThreatsByStatus(e.target.value));

        document.getElementById('incidentSearch')?.addEventListener('input', (e) => this.filterIncidents(e.target.value));
        document.getElementById('incidentStatusFilter')?.addEventListener('change', (e) => this.filterIncidentsByStatus(e.target.value));
        document.getElementById('incidentPriorityFilter')?.addEventListener('change', (e) => this.filterIncidentsByPriority(e.target.value));

        document.getElementById('userSearch')?.addEventListener('input', (e) => this.filterUsers(e.target.value));
        document.getElementById('userRoleFilter')?.addEventListener('change', (e) => this.filterUsersByRole(e.target.value));
        document.getElementById('userStatusFilter')?.addEventListener('change', (e) => this.filterUsersByStatus(e.target.value));

        document.getElementById('addSecurityPolicyForm')?.addEventListener('submit', (e) => this.handleAddSecurityPolicy(e));
        document.getElementById('addIncidentForm')?.addEventListener('submit', (e) => this.handleAddIncident(e));

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
    loadThreats() {
        const saved = localStorage.getItem('securityThreats');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'T-001', name: 'SQL Injection Saldırısı', type: 'web', severity: 'critical', status: 'active', detectedAt: '2024-10-29 14:30', sourceIP: '192.168.1.100', target: 'Veritabanı' },
            { id: 'T-002', name: 'Brute Force Saldırısı', type: 'auth', severity: 'high', status: 'active', detectedAt: '2024-10-29 13:15', sourceIP: '10.0.0.50', target: 'Admin Paneli' },
            { id: 'T-003', name: 'Phishing E-postası', type: 'social', severity: 'medium', status: 'mitigated', detectedAt: '2024-10-29 12:45', sourceIP: 'Bilinmeyen', target: 'Çalışanlar' }
        ];
    }

    loadIncidents() {
        const saved = localStorage.getItem('securityIncidents');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'INC-001', title: 'SQL Injection Tespit Edildi', type: 'malware', priority: 'critical', status: 'investigating', date: '2024-10-29', assignedTo: 'Güvenlik Ekibi' },
            { id: 'INC-002', title: 'Brute Force Saldırısı', type: 'unauthorized-access', priority: 'high', status: 'open', date: '2024-10-29', assignedTo: 'Sistem Yöneticisi' },
            { id: 'INC-003', title: 'Phishing E-postası Bildirildi', type: 'phishing', priority: 'medium', status: 'resolved', date: '2024-10-28', assignedTo: 'IT Ekibi' }
        ];
    }

    loadUsers() {
        const saved = localStorage.getItem('securityUsers');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'U-001', name: 'Ahmet Yılmaz', email: 'admin@videosat.com', role: 'admin', status: 'active', lastLogin: '2 saat önce', twoFA: true, strongPassword: true },
            { id: 'U-002', name: 'Ayşe Demir', email: 'ayse@videosat.com', role: 'manager', status: 'active', lastLogin: '1 saat önce', twoFA: true, strongPassword: true },
            { id: 'U-003', name: 'Mehmet Kaya', email: 'mehmet@videosat.com', role: 'employee', status: 'suspended', lastLogin: '1 gün önce', twoFA: false, strongPassword: false }
        ];
    }

    loadPolicies() {
        const saved = localStorage.getItem('securityPolicies');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'POL-001', name: 'Şifre Politikası', type: 'password', version: '2.1', lastUpdate: '2024-10-15', scope: 'Tüm Kullanıcılar', status: 'active' },
            { id: 'POL-002', name: 'Veri Şifreleme Politikası', type: 'encryption', version: '1.8', lastUpdate: '2024-10-20', scope: 'Hassas Veriler', status: 'active' },
            { id: 'POL-003', name: 'Erişim Kontrol Politikası', type: 'access', version: '3.2', lastUpdate: '2024-10-25', scope: 'Sistem Erişimi', status: 'active' }
        ];
    }

    loadCompliance() {
        const saved = localStorage.getItem('securityCompliance');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'COMP-001', name: 'GDPR', score: 95, status: 'high', lastAudit: '2024-10-01' },
            { id: 'COMP-002', name: 'ISO 27001', score: 88, status: 'medium', lastAudit: '2024-09-15' },
            { id: 'COMP-003', name: 'KVKK', score: 92, status: 'high', lastAudit: '2024-10-10' },
            { id: 'COMP-004', name: 'PCI DSS', score: 90, status: 'high', lastAudit: '2024-09-30' }
        ];
    }

    saveThreats() { localStorage.setItem('securityThreats', JSON.stringify(this.threats)); }
    saveIncidents() { localStorage.setItem('securityIncidents', JSON.stringify(this.incidents)); }
    saveUsers() { localStorage.setItem('securityUsers', JSON.stringify(this.users)); }
    savePolicies() { localStorage.setItem('securityPolicies', JSON.stringify(this.policies)); }
    saveCompliance() { localStorage.setItem('securityCompliance', JSON.stringify(this.compliance)); }

    // Overview
    updateOverview() {
        const securityScore = 85 + Math.floor(Math.random() * 10);
        const activeThreats = this.threats.filter(t => t.status === 'active').length;
        const protectedUsers = this.users.filter(u => u.twoFA && u.strongPassword).length;
        const encryptedData = 95 + Math.floor(Math.random() * 5);
        const securityEvents = this.incidents.length;
        const complianceScore = Math.floor(this.compliance.reduce((sum, c) => sum + c.score, 0) / this.compliance.length);

        document.getElementById('securityScore').textContent = securityScore;
        document.getElementById('activeThreats').textContent = this.formatNumber(activeThreats);
        document.getElementById('protectedUsers').textContent = this.formatNumber(protectedUsers);
        document.getElementById('encryptedData').textContent = encryptedData + '%';
        document.getElementById('securityEvents').textContent = this.formatNumber(securityEvents);
        document.getElementById('complianceScore').textContent = complianceScore + '%';
    }

    // Renderers
    renderThreats() {
        const grid = document.querySelector('.threats-grid');
        if (!grid) return;
        grid.innerHTML = this.threats.map(t => `
            <div class="threat-card ${t.severity}">
                <div class="threat-header">
                    <h3>${t.name}</h3>
                    <span class="severity-badge ${t.severity}">${this.getSeverityName(t.severity)}</span>
                </div>
                <div class="threat-meta">
                    <p><strong>Tür:</strong> ${this.getTypeName(t.type)}</p>
                    <p><strong>Tespit:</strong> ${this.formatDateTime(t.detectedAt)}</p>
                    <p><strong>Kaynak IP:</strong> ${t.sourceIP}</p>
                    <p><strong>Hedef:</strong> ${t.target}</p>
                </div>
                <div class="threat-description">
                    <p>${this.getThreatDescription(t.type)}</p>
                </div>
                <div class="threat-impact">
                    <h4>Etki:</h4>
                    <ul>
                        ${this.getThreatImpact(t.severity).map(impact => `<li>${impact}</li>`).join('')}
                    </ul>
                </div>
                <div class="threat-actions">
                    <button class="btn btn-${this.getSeverityColor(t.severity)} btn-xs" onclick="securityManager.mitigateThreat('${t.id}')">
                        <i class="fas fa-shield-alt"></i> Azalt
                    </button>
                    <button class="btn btn-outline btn-xs" onclick="securityManager.viewThreatDetails('${t.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-xs" onclick="securityManager.blockSource('${t.id}')">
                        <i class="fas fa-ban"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderIncidents() {
        const tbody = document.getElementById('incidentsTableBody');
        if (!tbody) return;
        tbody.innerHTML = this.incidents.map(i => `
            <tr>
                <td><code>${i.id}</code></td>
                <td><strong>${i.title}</strong></td>
                <td><span class="type-badge ${i.type}">${this.getTypeName(i.type)}</span></td>
                <td><span class="priority-badge ${i.priority}">${this.getPriorityName(i.priority)}</span></td>
                <td><span class="status-badge ${i.status}">${this.getStatusName(i.status)}</span></td>
                <td>${this.formatDate(i.date)}</td>
                <td>${i.assignedTo}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="securityManager.viewIncidentDetails('${i.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="securityManager.updateIncidentStatus('${i.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-primary btn-xs" onclick="securityManager.assignIncident('${i.id}')">
                            <i class="fas fa-user"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderUsers() {
        const grid = document.querySelector('.users-grid');
        if (!grid) return;
        grid.innerHTML = this.users.map(u => `
            <div class="user-card">
                <div class="user-header">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-info">
                        <h3>${u.name}</h3>
                        <p>${u.email}</p>
                        <span class="role-badge ${u.role}">${this.getRoleName(u.role)}</span>
                    </div>
                    <span class="status-badge ${u.status}">${this.getStatusName(u.status)}</span>
                </div>
                <div class="user-security">
                    <div class="security-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>${u.twoFA ? '2FA Aktif' : '2FA Pasif'}</span>
                    </div>
                    <div class="security-item">
                        <i class="fas fa-key"></i>
                        <span>${u.strongPassword ? 'Güçlü Şifre' : 'Zayıf Şifre'}</span>
                    </div>
                    <div class="security-item">
                        <i class="fas fa-clock"></i>
                        <span>Son Giriş: ${u.lastLogin}</span>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="btn btn-outline btn-xs" onclick="securityManager.viewUserSecurity('${u.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-xs" onclick="securityManager.resetUserPassword('${u.id}')">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="btn btn-warning btn-xs" onclick="securityManager.suspendUser('${u.id}')">
                        <i class="fas fa-pause"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderPolicies() {
        const grid = document.querySelector('.policies-grid');
        if (!grid) return;
        grid.innerHTML = this.policies.map(p => `
            <div class="policy-card">
                <div class="policy-header">
                    <h3>${p.name}</h3>
                    <span class="status-badge ${p.status}">${this.getStatusName(p.status)}</span>
                </div>
                <div class="policy-meta">
                    <p><strong>Versiyon:</strong> ${p.version}</p>
                    <p><strong>Son Güncelleme:</strong> ${this.formatDate(p.lastUpdate)}</p>
                    <p><strong>Geçerlilik:</strong> ${p.scope}</p>
                </div>
                <div class="policy-description">
                    <p>${this.getPolicyDescription(p.type)}</p>
                </div>
                <div class="policy-requirements">
                    <h4>Gereksinimler:</h4>
                    <ul>
                        ${this.getPolicyRequirements(p.type).map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                <div class="policy-actions">
                    <button class="btn btn-outline btn-xs" onclick="securityManager.viewPolicyDetails('${p.type}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-xs" onclick="securityManager.editPolicy('${p.type}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-primary btn-xs" onclick="securityManager.deployPolicy('${p.type}')">
                        <i class="fas fa-rocket"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderCompliance() {
        const grid = document.querySelector('.compliance-grid');
        if (!grid) return;
        grid.innerHTML = this.compliance.map(c => `
            <div class="compliance-card">
                <div class="compliance-header">
                    <h3>${c.name}</h3>
                    <span class="compliance-score ${c.status}">${c.score}%</span>
                </div>
                <div class="compliance-description">
                    <p>${this.getComplianceDescription(c.name)}</p>
                </div>
                <div class="compliance-requirements">
                    <h4>Gereksinimler:</h4>
                    <ul>
                        ${this.getComplianceRequirements(c.name).map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                <div class="compliance-actions">
                    <button class="btn btn-outline btn-xs" onclick="securityManager.viewComplianceDetails('${c.name.toLowerCase()}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-primary btn-xs" onclick="securityManager.generateComplianceReport('${c.name.toLowerCase()}')">
                        <i class="fas fa-file-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadDashboardData() {
        this.updateComplianceStats();
    }

    updateComplianceStats() {
        document.getElementById('gdprCompliance').textContent = '95%';
        document.getElementById('isoCompliance').textContent = '88%';
        document.getElementById('kvkkCompliance').textContent = '92%';
        document.getElementById('pciCompliance').textContent = '90%';
    }

    // Threat actions
    mitigateThreat(id) {
        const t = this.threats.find(x => x.id === id);
        if (!t) return;
        t.status = 'mitigated';
        this.saveThreats();
        this.renderThreats();
        this.updateOverview();
        showAlert(`Tehdit azaltıldı: ${t.name}`, 'success');
    }

    viewThreatDetails(id) {
        const t = this.threats.find(x => x.id === id);
        if (!t) return;
        alert(`Tehdit: ${t.name}\nTür: ${this.getTypeName(t.type)}\nŞiddet: ${this.getSeverityName(t.severity)}\nDurum: ${this.getStatusName(t.status)}\nTespit: ${this.formatDateTime(t.detectedAt)}`);
    }

    blockSource(id) {
        const t = this.threats.find(x => x.id === id);
        if (!t) return;
        showAlert(`Kaynak IP engellendi: ${t.sourceIP}`, 'success');
    }

    // Incident actions
    viewIncidentDetails(id) {
        const i = this.incidents.find(x => x.id === id);
        if (!i) return;
        alert(`Olay: ${i.title}\nTür: ${this.getTypeName(i.type)}\nÖncelik: ${this.getPriorityName(i.priority)}\nDurum: ${this.getStatusName(i.status)}\nSorumlu: ${i.assignedTo}`);
    }

    updateIncidentStatus(id) {
        const i = this.incidents.find(x => x.id === id);
        if (!i) return;
        const statuses = ['open', 'investigating', 'resolved', 'closed'];
        const currentIndex = statuses.indexOf(i.status);
        i.status = statuses[Math.min(currentIndex + 1, statuses.length - 1)];
        this.saveIncidents();
        this.renderIncidents();
        showAlert(`Olay durumu güncellendi: ${this.getStatusName(i.status)}`, 'success');
    }

    assignIncident(id) {
        const i = this.incidents.find(x => x.id === id);
        if (!i) return;
        showAlert(`Olay atandı: ${i.title}`, 'info');
    }

    handleAddIncident(e) {
        e.preventDefault();
        const newIncident = {
            id: 'INC-' + (100 + Math.floor(Math.random() * 900)),
            title: document.getElementById('incidentTitle').value,
            type: document.getElementById('incidentType').value,
            priority: document.getElementById('incidentPriority').value,
            status: 'open',
            date: new Date().toISOString().split('T')[0],
            assignedTo: 'Güvenlik Ekibi'
        };
        this.incidents.unshift(newIncident);
        this.saveIncidents();
        this.renderIncidents();
        this.updateOverview();
        closeModal('addIncidentModal');
        showAlert('Güvenlik olayı bildirildi', 'success');
        e.target.reset();
    }

    // User actions
    viewUserSecurity(id) {
        const u = this.users.find(x => x.id === id);
        if (!u) return;
        alert(`Kullanıcı: ${u.name}\nEmail: ${u.email}\nRol: ${this.getRoleName(u.role)}\nDurum: ${this.getStatusName(u.status)}\n2FA: ${u.twoFA ? 'Aktif' : 'Pasif'}\nGüçlü Şifre: ${u.strongPassword ? 'Evet' : 'Hayır'}`);
    }

    resetUserPassword(id) {
        const u = this.users.find(x => x.id === id);
        if (!u) return;
        showAlert(`${u.name} için şifre sıfırlama e-postası gönderildi`, 'success');
    }

    suspendUser(id) {
        const u = this.users.find(x => x.id === id);
        if (!u) return;
        u.status = u.status === 'active' ? 'suspended' : 'active';
        this.saveUsers();
        this.renderUsers();
        showAlert(`Kullanıcı ${u.status === 'active' ? 'aktifleştirildi' : 'askıya alındı'}: ${u.name}`, 'success');
    }

    // Policy actions
    viewPolicyDetails(type) {
        showAlert(`${this.getTypeName(type)} politikası detayları yakında eklenecek`, 'info');
    }

    editPolicy(type) {
        showAlert(`${this.getTypeName(type)} politikası düzenleme özelliği yakında eklenecek`, 'info');
    }

    deployPolicy(type) {
        showAlert(`${this.getTypeName(type)} politikası dağıtıldı`, 'success');
    }

    handleAddSecurityPolicy(e) {
        e.preventDefault();
        const newPolicy = {
            id: 'POL-' + (100 + Math.floor(Math.random() * 900)),
            name: document.getElementById('policyName').value,
            type: document.getElementById('policyType').value,
            version: '1.0',
            lastUpdate: new Date().toISOString().split('T')[0],
            scope: document.getElementById('policyScope').value,
            status: 'active'
        };
        this.policies.unshift(newPolicy);
        this.savePolicies();
        this.renderPolicies();
        closeModal('addSecurityPolicyModal');
        showAlert('Güvenlik politikası oluşturuldu', 'success');
        e.target.reset();
    }

    // Compliance actions
    viewComplianceDetails(standard) {
        showAlert(`${standard.toUpperCase()} uyumluluk detayları yakında eklenecek`, 'info');
    }

    generateComplianceReport(standard) {
        showAlert(`${standard.toUpperCase()} uyumluluk raporu oluşturuluyor...`, 'info');
    }

    // Analytics
    loadAnalyticsData() {
        this.updateAnalytics();
    }

    updateAnalytics() {
        if (typeof Chart === 'undefined') return;
        this.updateThreatTrendChart();
        this.updateIncidentsChart();
        this.updateComplianceChart();
        this.updateUserSecurityChart();
    }

    updateThreatTrendChart() {
        const ctx = document.getElementById('threatTrendChart');
        if (!ctx) return;
        if (this.threatTrendChart) this.threatTrendChart.destroy();
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
        const threats = months.map(() => Math.floor(Math.random() * 50 + 10));
        this.threatTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Tehdit Sayısı',
                    data: threats,
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
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

    updateIncidentsChart() {
        const ctx = document.getElementById('incidentsChart');
        if (!ctx) return;
        if (this.incidentsChart) this.incidentsChart.destroy();
        const statuses = ['Açık', 'İşlemde', 'Çözüldü', 'Kapalı'];
        const counts = statuses.map(() => Math.floor(Math.random() * 20 + 5));
        this.incidentsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: statuses,
                datasets: [{
                    label: 'Olay Sayısı',
                    data: counts,
                    backgroundColor: 'rgba(251, 191, 36, 0.8)',
                    borderColor: 'rgba(251, 191, 36, 1)',
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

    updateComplianceChart() {
        const ctx = document.getElementById('complianceChart');
        if (!ctx) return;
        if (this.complianceChart) this.complianceChart.destroy();
        const standards = ['GDPR', 'ISO 27001', 'KVKK', 'PCI DSS'];
        const scores = standards.map(() => Math.floor(Math.random() * 20 + 80));
        this.complianceChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: standards,
                datasets: [{
                    data: scores,
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

    updateUserSecurityChart() {
        const ctx = document.getElementById('userSecurityChart');
        if (!ctx) return;
        if (this.userSecurityChart) this.userSecurityChart.destroy();
        const categories = ['Güvenli', 'Düşük Risk', 'Yüksek Risk', 'Engellenmiş'];
        const counts = categories.map(() => Math.floor(Math.random() * 50 + 10));
        this.userSecurityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Kullanıcı Sayısı',
                    data: counts,
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(107, 114, 128, 0.8)'
                    ],
                    borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(251, 191, 36, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(107, 114, 128, 1)'
                    ],
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
    filterThreats(q) {
        const filtered = this.threats.filter(t => t.name.toLowerCase().includes(q.toLowerCase()));
        this.renderFilteredThreats(filtered);
    }

    filterThreatsBySeverity(s) {
        if (!s) { this.renderThreats(); return; }
        this.renderFilteredThreats(this.threats.filter(t => t.severity === s));
    }

    filterThreatsByStatus(s) {
        if (!s) { this.renderThreats(); return; }
        this.renderFilteredThreats(this.threats.filter(t => t.status === s));
    }

    filterIncidents(q) {
        const filtered = this.incidents.filter(i => i.title.toLowerCase().includes(q.toLowerCase()));
        this.renderFilteredIncidents(filtered);
    }

    filterIncidentsByStatus(s) {
        if (!s) { this.renderIncidents(); return; }
        this.renderFilteredIncidents(this.incidents.filter(i => i.status === s));
    }

    filterIncidentsByPriority(p) {
        if (!p) { this.renderIncidents(); return; }
        this.renderFilteredIncidents(this.incidents.filter(i => i.priority === p));
    }

    filterUsers(q) {
        const filtered = this.users.filter(u => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));
        this.renderFilteredUsers(filtered);
    }

    filterUsersByRole(r) {
        if (!r) { this.renderUsers(); return; }
        this.renderFilteredUsers(this.users.filter(u => u.role === r));
    }

    filterUsersByStatus(s) {
        if (!s) { this.renderUsers(); return; }
        this.renderFilteredUsers(this.users.filter(u => u.status === s));
    }

    renderFilteredThreats(rows) {
        const grid = document.querySelector('.threats-grid');
        if (!grid) return;
        grid.innerHTML = rows.map(t => `
            <div class="threat-card ${t.severity}">
                <div class="threat-header">
                    <h3>${t.name}</h3>
                    <span class="severity-badge ${t.severity}">${this.getSeverityName(t.severity)}</span>
                </div>
                <div class="threat-meta">
                    <p><strong>Tür:</strong> ${this.getTypeName(t.type)}</p>
                    <p><strong>Tespit:</strong> ${this.formatDateTime(t.detectedAt)}</p>
                    <p><strong>Kaynak IP:</strong> ${t.sourceIP}</p>
                    <p><strong>Hedef:</strong> ${t.target}</p>
                </div>
                <div class="threat-description">
                    <p>${this.getThreatDescription(t.type)}</p>
                </div>
                <div class="threat-impact">
                    <h4>Etki:</h4>
                    <ul>
                        ${this.getThreatImpact(t.severity).map(impact => `<li>${impact}</li>`).join('')}
                    </ul>
                </div>
                <div class="threat-actions">
                    <button class="btn btn-${this.getSeverityColor(t.severity)} btn-xs" onclick="securityManager.mitigateThreat('${t.id}')">
                        <i class="fas fa-shield-alt"></i> Azalt
                    </button>
                    <button class="btn btn-outline btn-xs" onclick="securityManager.viewThreatDetails('${t.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-xs" onclick="securityManager.blockSource('${t.id}')">
                        <i class="fas fa-ban"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderFilteredIncidents(rows) {
        const tbody = document.getElementById('incidentsTableBody');
        if (!tbody) return;
        tbody.innerHTML = rows.map(i => `
            <tr>
                <td><code>${i.id}</code></td>
                <td><strong>${i.title}</strong></td>
                <td><span class="type-badge ${i.type}">${this.getTypeName(i.type)}</span></td>
                <td><span class="priority-badge ${i.priority}">${this.getPriorityName(i.priority)}</span></td>
                <td><span class="status-badge ${i.status}">${this.getStatusName(i.status)}</span></td>
                <td>${this.formatDate(i.date)}</td>
                <td>${i.assignedTo}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="securityManager.viewIncidentDetails('${i.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="securityManager.updateIncidentStatus('${i.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-primary btn-xs" onclick="securityManager.assignIncident('${i.id}')">
                            <i class="fas fa-user"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderFilteredUsers(rows) {
        const grid = document.querySelector('.users-grid');
        if (!grid) return;
        grid.innerHTML = rows.map(u => `
            <div class="user-card">
                <div class="user-header">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-info">
                        <h3>${u.name}</h3>
                        <p>${u.email}</p>
                        <span class="role-badge ${u.role}">${this.getRoleName(u.role)}</span>
                    </div>
                    <span class="status-badge ${u.status}">${this.getStatusName(u.status)}</span>
                </div>
                <div class="user-security">
                    <div class="security-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>${u.twoFA ? '2FA Aktif' : '2FA Pasif'}</span>
                    </div>
                    <div class="security-item">
                        <i class="fas fa-key"></i>
                        <span>${u.strongPassword ? 'Güçlü Şifre' : 'Zayıf Şifre'}</span>
                    </div>
                    <div class="security-item">
                        <i class="fas fa-clock"></i>
                        <span>Son Giriş: ${u.lastLogin}</span>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="btn btn-outline btn-xs" onclick="securityManager.viewUserSecurity('${u.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-xs" onclick="securityManager.resetUserPassword('${u.id}')">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="btn btn-warning btn-xs" onclick="securityManager.suspendUser('${u.id}')">
                        <i class="fas fa-pause"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Export
    exportSecurityData() {
        const data = {
            threats: this.threats,
            incidents: this.incidents,
            users: this.users,
            policies: this.policies,
            compliance: this.compliance,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showAlert('Güvenlik verileri dışa aktarıldı', 'success');
    }

    // Utils
    formatNumber(n) { return new Intl.NumberFormat('tr-TR').format(n); }
    formatDate(d) { return new Date(d).toLocaleDateString('tr-TR'); }
    formatDateTime(dt) { return new Date(dt).toLocaleString('tr-TR'); }

    getSeverityName(s) { return ({ low: 'Düşük', medium: 'Orta', high: 'Yüksek', critical: 'Kritik' })[s] || s; }
    getSeverityColor(s) { return ({ low: 'info', medium: 'warning', high: 'warning', critical: 'danger' })[s] || 'info'; }
    getTypeName(t) { return ({ web: 'Web Güvenliği', auth: 'Kimlik Doğrulama', social: 'Sosyal Mühendislik', malware: 'Malware', phishing: 'Phishing', 'data-breach': 'Veri İhlali', 'unauthorized-access': 'Yetkisiz Erişim', ddos: 'DDoS Saldırısı', other: 'Diğer' })[t] || t; }
    getPriorityName(p) { return ({ low: 'Düşük', medium: 'Orta', high: 'Yüksek', critical: 'Kritik' })[p] || p; }
    getStatusName(s) { return ({ active: 'Aktif', mitigated: 'Azaltıldı', resolved: 'Çözüldü', open: 'Açık', investigating: 'İnceleniyor', closed: 'Kapalı', suspended: 'Askıya Alındı', locked: 'Kilitli' })[s] || s; }
    getRoleName(r) { return ({ admin: 'Admin', manager: 'Yönetici', employee: 'Çalışan', customer: 'Müşteri' })[r] || r; }

    getThreatDescription(type) {
        const descriptions = {
            web: 'Web uygulamasına yönelik güvenlik tehdidi.',
            auth: 'Kimlik doğrulama sistemine yönelik saldırı.',
            social: 'Sosyal mühendislik teknikleri kullanılan tehdit.'
        };
        return descriptions[type] || 'Güvenlik tehdidi tespit edildi.';
    }

    getThreatImpact(severity) {
        const impacts = {
            low: ['Minimal etki', 'Düşük risk'],
            medium: ['Orta seviye etki', 'Veri güvenliği riski'],
            high: ['Yüksek etki', 'Sistem erişimi riski', 'Veri sızıntısı tehlikesi'],
            critical: ['Kritik etki', 'Sistem erişimi tehlikesi', 'Veri sızıntısı riski', 'Müşteri bilgileri riski']
        };
        return impacts[severity] || ['Bilinmeyen etki'];
    }

    getPolicyDescription(type) {
        const descriptions = {
            password: 'Güçlü şifre oluşturma ve yönetimi için standartlar.',
            encryption: 'Hassas verilerin şifrelenmesi ve korunması için standartlar.',
            access: 'Sistem erişimi ve yetkilendirme için standartlar.',
            data: 'Veri koruma ve gizlilik için standartlar.',
            network: 'Ağ güvenliği ve koruma için standartlar.'
        };
        return descriptions[type] || 'Güvenlik politikası.';
    }

    getPolicyRequirements(type) {
        const requirements = {
            password: ['En az 8 karakter', 'Büyük ve küçük harf', 'Sayı ve özel karakter', '90 günde bir değişim'],
            encryption: ['AES-256 şifreleme', 'SSL/TLS bağlantıları', 'Veri yedekleme şifreleme', 'Anahtar yönetimi'],
            access: ['Rol tabanlı erişim', 'En az ayrıcalık prensibi', 'Düzenli erişim gözden geçirme', 'Çok faktörlü kimlik doğrulama'],
            data: ['Veri sınıflandırması', 'Erişim kontrolleri', 'Veri saklama politikaları', 'Veri silme prosedürleri'],
            network: ['Firewall kuralları', 'VPN erişimi', 'Ağ segmentasyonu', 'İzleme ve loglama']
        };
        return requirements[type] || ['Temel güvenlik gereksinimleri'];
    }

    getComplianceDescription(name) {
        const descriptions = {
            'GDPR': 'Genel Veri Koruma Yönetmeliği uyumluluğu.',
            'ISO 27001': 'Bilgi Güvenliği Yönetim Sistemi standardı.',
            'KVKK': 'Kişisel Verilerin Korunması Kanunu uyumluluğu.',
            'PCI DSS': 'Ödeme Kartı Endüstrisi Veri Güvenliği Standardı.'
        };
        return descriptions[name] || 'Uyumluluk standardı.';
    }

    getComplianceRequirements(name) {
        const requirements = {
            'GDPR': ['Veri işleme kayıtları', 'Kullanıcı onayları', 'Veri silme hakları', 'Gizlilik politikaları'],
            'ISO 27001': ['Güvenlik politikaları', 'Risk değerlendirmesi', 'Eğitim programları', 'İç denetimler'],
            'KVKK': ['Veri envanteri', 'Açık rıza', 'Veri sahibi hakları', 'Güvenlik önlemleri'],
            'PCI DSS': ['Ağ güvenliği', 'Veri koruma', 'Güvenlik yönetimi', 'Düzenli testler']
        };
        return requirements[name] || ['Temel uyumluluk gereksinimleri'];
    }
}

// Global functions
function showTab(t) { securityManager.showTab(t); }
function showAddSecurityPolicyModal() { securityManager ? document.getElementById('addSecurityPolicyModal').style.display = 'block' : null; }
function showAddIncidentModal() { securityManager ? document.getElementById('addIncidentModal').style.display = 'block' : null; }
function exportSecurityData() { securityManager.exportSecurityData(); }
function downloadAnalytics(type) { showAlert(`${type} raporu yakında`, 'info'); }
function mitigateThreat(id) { securityManager.mitigateThreat(id); }
function viewThreatDetails(id) { securityManager.viewThreatDetails(id); }
function blockSource(id) { securityManager.blockSource(id); }
function viewIncidentDetails(id) { securityManager.viewIncidentDetails(id); }
function updateIncidentStatus(id) { securityManager.updateIncidentStatus(id); }
function assignIncident(id) { securityManager.assignIncident(id); }
function viewUserSecurity(id) { securityManager.viewUserSecurity(id); }
function resetUserPassword(id) { securityManager.resetUserPassword(id); }
function suspendUser(id) { securityManager.suspendUser(id); }
function viewPolicyDetails(type) { securityManager.viewPolicyDetails(type); }
function editPolicy(type) { securityManager.editPolicy(type); }
function deployPolicy(type) { securityManager.deployPolicy(type); }
function viewComplianceDetails(standard) { securityManager.viewComplianceDetails(standard); }
function generateComplianceReport(standard) { securityManager.generateComplianceReport(standard); }

let securityManager;
document.addEventListener('DOMContentLoaded', () => {
    securityManager = new SecurityManager();
});

console.log('✅ Security Management System Loaded');
