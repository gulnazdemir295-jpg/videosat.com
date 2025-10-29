// R&D & Software Management JavaScript
class RDSoftwareManager {
    constructor() {
        this.projects = this.loadProjects();
        this.research = this.loadResearch();
        this.innovations = this.loadInnovations();
        this.patents = this.loadPatents();
        this.currentTab = 'projects';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderProjects();
        this.renderResearch();
        this.renderInnovations();
        this.renderPatents();
        this.updateOverview();
        this.loadDashboardData();
        this.setDefaultDates();
        this.setupModalCloseListeners();
    }

    setupModalCloseListeners() {
        const modals = ['addProjectModal', 'addResearchModal', 'addInnovationModal', 'addPatentModal'];
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
        document.getElementById('projectSearch')?.addEventListener('input', (e) => this.filterProjects(e.target.value));
        document.getElementById('projectStatusFilter')?.addEventListener('change', (e) => this.filterProjectsByStatus(e.target.value));
        document.getElementById('projectPriorityFilter')?.addEventListener('change', (e) => this.filterProjectsByPriority(e.target.value));

        document.getElementById('researchSearch')?.addEventListener('input', (e) => this.filterResearch(e.target.value));
        document.getElementById('researchTypeFilter')?.addEventListener('change', (e) => this.filterResearchByType(e.target.value));
        document.getElementById('researchStatusFilter')?.addEventListener('change', (e) => this.filterResearchByStatus(e.target.value));

        document.getElementById('addProjectForm')?.addEventListener('submit', (e) => this.handleAddProject(e));
        document.getElementById('addResearchForm')?.addEventListener('submit', (e) => this.handleAddResearch(e));
        document.getElementById('addInnovationForm')?.addEventListener('submit', (e) => this.handleAddInnovation(e));
        document.getElementById('addPatentForm')?.addEventListener('submit', (e) => this.handleAddPatent(e));

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
    loadProjects() {
        const saved = localStorage.getItem('rdProjects');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'P-001', name: 'AI Video Analysis System', category: 'software', status: 'development', priority: 'high', progress: 75, startDate: '2024-08-01', endDate: '2024-12-31', budget: 150000 },
            { id: 'P-002', name: 'Blockchain Payment Integration', category: 'research', status: 'completed', priority: 'medium', progress: 100, startDate: '2024-06-01', endDate: '2024-09-30', budget: 80000 },
            { id: 'P-003', name: 'Mobile App Redesign', category: 'software', status: 'testing', priority: 'high', progress: 90, startDate: '2024-09-01', endDate: '2024-11-30', budget: 120000 },
            { id: 'P-004', name: 'Cloud Infrastructure Upgrade', category: 'infrastructure', status: 'planning', priority: 'critical', progress: 15, startDate: '2024-11-01', endDate: '2025-03-31', budget: 200000 }
        ];
    }

    loadResearch() {
        const saved = localStorage.getItem('rdResearch');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'R-001', name: 'AI-Powered Video Analysis', type: 'ai', status: 'ongoing', startDate: '2024-08-15', endDate: '2024-12-30', budget: 150000, progress: 65 },
            { id: 'R-002', name: 'Blockchain Payment Integration', type: 'blockchain', status: 'completed', startDate: '2024-06-01', endDate: '2024-09-30', budget: 80000, progress: 100 },
            { id: 'R-003', name: 'IoT Device Integration', type: 'iot', status: 'ongoing', startDate: '2024-10-01', endDate: '2025-02-28', budget: 100000, progress: 30 }
        ];
    }

    loadInnovations() {
        const saved = localStorage.getItem('rdInnovations');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'I-001', name: 'Canlı Yayın AI Moderasyonu', category: 'ai', status: 'prototype', date: '2024-10-15', inventor: 'AI Ekibi', patentStatus: 'pending' },
            { id: 'I-002', name: 'Blockchain Ödeme Sistemi', category: 'blockchain', status: 'production', date: '2024-09-30', inventor: 'Blockchain Ekibi', patentStatus: 'patented' }
        ];
    }

    loadPatents() {
        const saved = localStorage.getItem('rdPatents');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'PAT-001', name: 'AI Video Analysis Method', number: 'TR2024/001234', status: 'pending', applicationDate: '2024-10-15', category: 'software', value: 500000 },
            { id: 'PAT-002', name: 'Blockchain Payment System', number: 'TR2024/001235', status: 'granted', applicationDate: '2024-09-30', category: 'software', value: 750000 },
            { id: 'PAT-003', name: 'IoT Integration Protocol', number: 'TR2024/001236', status: 'under-review', applicationDate: '2024-11-01', category: 'process', value: 300000 }
        ];
    }

    saveProjects() { localStorage.setItem('rdProjects', JSON.stringify(this.projects)); }
    saveResearch() { localStorage.setItem('rdResearch', JSON.stringify(this.research)); }
    saveInnovations() { localStorage.setItem('rdInnovations', JSON.stringify(this.innovations)); }
    savePatents() { localStorage.setItem('rdPatents', JSON.stringify(this.patents)); }

    // Overview
    updateOverview() {
        const activeProjects = this.projects.filter(p => p.status === 'development' || p.status === 'testing').length;
        const totalCodeLines = 125430 + Math.floor(Math.random() * 10000);
        const totalInnovations = this.innovations.length;
        const totalBudget = this.projects.reduce((sum, p) => sum + p.budget, 0);
        const totalPatents = this.patents.length;
        const totalDevelopers = 12 + Math.floor(Math.random() * 5);

        document.getElementById('totalProjects').textContent = this.formatNumber(activeProjects);
        document.getElementById('totalCodeLines').textContent = this.formatNumber(totalCodeLines);
        document.getElementById('totalInnovations').textContent = this.formatNumber(totalInnovations);
        document.getElementById('totalBudget').textContent = this.formatCurrency(totalBudget);
        document.getElementById('totalPatents').textContent = this.formatNumber(totalPatents);
        document.getElementById('totalDevelopers').textContent = this.formatNumber(totalDevelopers);
    }

    // Renderers
    renderProjects() {
        const tbody = document.getElementById('projectsTableBody');
        if (!tbody) return;
        tbody.innerHTML = this.projects.map(p => `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td><span class="category-badge ${p.category}">${this.getCategoryName(p.category)}</span></td>
                <td><span class="status-badge ${p.status}">${this.getStatusName(p.status)}</span></td>
                <td><span class="priority-badge ${p.priority}">${this.getPriorityName(p.priority)}</span></td>
                <td>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${p.progress}%"></div>
                        </div>
                        <span class="progress-text">${p.progress}%</span>
                    </div>
                </td>
                <td>${this.formatDate(p.startDate)}</td>
                <td>${this.formatDate(p.endDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="rdManager.viewProject('${p.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="rdManager.editProject('${p.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-primary btn-xs" onclick="rdManager.updateProgress('${p.id}')">
                            <i class="fas fa-chart-line"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderResearch() {
        const grid = document.querySelector('.research-grid');
        if (!grid) return;
        grid.innerHTML = this.research.map(r => `
            <div class="research-card">
                <div class="research-header">
                    <h3>${r.name}</h3>
                    <span class="status-badge ${r.status}">${this.getStatusName(r.status)}</span>
                </div>
                <div class="research-meta">
                    <p><strong>Tür:</strong> ${this.getTypeName(r.type)}</p>
                    <p><strong>Başlangıç:</strong> ${this.formatDate(r.startDate)}</p>
                    <p><strong>Tahmini Bitiş:</strong> ${this.formatDate(r.endDate)}</p>
                    <p><strong>Bütçe:</strong> ${this.formatCurrency(r.budget)}</p>
                </div>
                <div class="research-description">
                    <p>${this.getResearchDescription(r.type)}</p>
                </div>
                <div class="research-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${r.progress}%"></div>
                    </div>
                    <span class="progress-text">${r.progress}% Tamamlandı</span>
                </div>
                <div class="research-actions">
                    <button class="btn btn-outline btn-xs" onclick="rdManager.viewResearchDetails('${r.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-xs" onclick="rdManager.editResearch('${r.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-primary btn-xs" onclick="rdManager.generateResearchReport('${r.id}')">
                        <i class="fas fa-file-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderInnovations() {
        const grid = document.querySelector('.innovation-grid');
        if (!grid) return;
        grid.innerHTML = this.innovations.map(i => `
            <div class="innovation-card">
                <div class="innovation-header">
                    <h3>${i.name}</h3>
                    <span class="innovation-status ${i.patentStatus}">${this.getPatentStatusName(i.patentStatus)}</span>
                </div>
                <div class="innovation-meta">
                    <p><strong>Kategori:</strong> ${this.getCategoryName(i.category)}</p>
                    <p><strong>Geliştirici:</strong> ${i.inventor}</p>
                    <p><strong>Tarih:</strong> ${this.formatDate(i.date)}</p>
                    <p><strong>Durum:</strong> ${this.getInnovationStatusName(i.status)}</p>
                </div>
                <div class="innovation-description">
                    <p>${this.getInnovationDescription(i.category)}</p>
                </div>
                <div class="innovation-impact">
                    <h4>Etki Analizi:</h4>
                    <ul>
                        ${this.getInnovationImpact(i.category).map(impact => `<li>${impact}</li>`).join('')}
                    </ul>
                </div>
                <div class="innovation-actions">
                    <button class="btn btn-outline btn-xs" onclick="rdManager.viewInnovationDetails('${i.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-xs" onclick="rdManager.editInnovation('${i.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-primary btn-xs" onclick="rdManager.filePatent('${i.id}')">
                        <i class="fas fa-certificate"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderPatents() {
        const tbody = document.getElementById('patentsTableBody');
        if (!tbody) return;
        tbody.innerHTML = this.patents.map(p => `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td><code>${p.number}</code></td>
                <td><span class="status-badge ${p.status}">${this.getPatentStatusName(p.status)}</span></td>
                <td>${this.formatDate(p.applicationDate)}</td>
                <td><span class="category-badge ${p.category}">${this.getCategoryName(p.category)}</span></td>
                <td>${this.formatCurrency(p.value)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="rdManager.viewPatentDetails('${p.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="rdManager.editPatent('${p.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-primary btn-xs" onclick="rdManager.downloadPatentDocument('${p.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadDashboardData() {
        this.updateSoftwareStats();
    }

    updateSoftwareStats() {
        document.getElementById('totalCodeLinesCount').textContent = '125,430';
        document.getElementById('activeRepositories').textContent = '8';
        document.getElementById('lastCommit').textContent = '2 saat önce';
        document.getElementById('testCoverage').textContent = '87%';
    }

    // Project actions
    viewProject(id) {
        const p = this.projects.find(x => x.id === id);
        if (!p) return;
        alert(`Proje: ${p.name}\nKategori: ${this.getCategoryName(p.category)}\nDurum: ${this.getStatusName(p.status)}\nİlerleme: ${p.progress}%\nBütçe: ${this.formatCurrency(p.budget)}`);
    }

    editProject(id) {
        showAlert('Proje düzenleme özelliği yakında eklenecek', 'info');
    }

    updateProgress(id) {
        const p = this.projects.find(x => x.id === id);
        if (!p) return;
        const newProgress = Math.min(p.progress + Math.floor(Math.random() * 10) + 5, 100);
        p.progress = newProgress;
        if (newProgress === 100) p.status = 'completed';
        this.saveProjects();
        this.renderProjects();
        this.updateOverview();
        showAlert(`Proje ilerlemesi güncellendi: ${newProgress}%`, 'success');
    }

    handleAddProject(e) {
        e.preventDefault();
        const newProject = {
            id: 'P-' + (100 + Math.floor(Math.random() * 900)),
            name: document.getElementById('projectName').value,
            category: document.getElementById('projectCategory').value,
            status: 'planning',
            priority: document.getElementById('projectPriority').value,
            progress: 0,
            startDate: document.getElementById('projectStartDate').value,
            endDate: document.getElementById('projectEndDate').value,
            budget: parseInt(document.getElementById('projectBudget').value)
        };
        this.projects.unshift(newProject);
        this.saveProjects();
        this.renderProjects();
        this.updateOverview();
        closeModal('addProjectModal');
        showAlert('Proje oluşturuldu', 'success');
        e.target.reset();
    }

    // Research actions
    viewResearchDetails(id) {
        const r = this.research.find(x => x.id === id);
        if (!r) return;
        alert(`Araştırma: ${r.name}\nTür: ${this.getTypeName(r.type)}\nDurum: ${this.getStatusName(r.status)}\nİlerleme: ${r.progress}%\nBütçe: ${this.formatCurrency(r.budget)}`);
    }

    editResearch(id) {
        showAlert('Araştırma düzenleme özelliği yakında eklenecek', 'info');
    }

    generateResearchReport(id) {
        showAlert('Araştırma raporu oluşturuluyor...', 'info');
    }

    handleAddResearch(e) {
        e.preventDefault();
        const newResearch = {
            id: 'R-' + (100 + Math.floor(Math.random() * 900)),
            name: document.getElementById('researchName').value,
            type: document.getElementById('researchType').value,
            status: 'ongoing',
            startDate: new Date().toISOString().split('T')[0],
            endDate: this.calculateEndDate(parseInt(document.getElementById('researchDuration').value)),
            budget: parseInt(document.getElementById('researchBudget').value),
            progress: 0
        };
        this.research.unshift(newResearch);
        this.saveResearch();
        this.renderResearch();
        closeModal('addResearchModal');
        showAlert('Araştırma projesi başlatıldı', 'success');
        e.target.reset();
    }

    // Innovation actions
    viewInnovationDetails(id) {
        const i = this.innovations.find(x => x.id === id);
        if (!i) return;
        alert(`İnovasyon: ${i.name}\nKategori: ${this.getCategoryName(i.category)}\nDurum: ${this.getInnovationStatusName(i.status)}\nMucit: ${i.inventor}\nPatent Durumu: ${this.getPatentStatusName(i.patentStatus)}`);
    }

    editInnovation(id) {
        showAlert('İnovasyon düzenleme özelliği yakında eklenecek', 'info');
    }

    filePatent(id) {
        const i = this.innovations.find(x => x.id === id);
        if (!i) return;
        showAlert(`${i.name} için patent başvurusu yapılıyor...`, 'info');
    }

    handleAddInnovation(e) {
        e.preventDefault();
        const newInnovation = {
            id: 'I-' + (100 + Math.floor(Math.random() * 900)),
            name: document.getElementById('innovationName').value,
            category: document.getElementById('innovationCategory').value,
            status: document.getElementById('innovationStatus').value,
            date: new Date().toISOString().split('T')[0],
            inventor: 'Mevcut Kullanıcı',
            patentStatus: 'pending'
        };
        this.innovations.unshift(newInnovation);
        this.saveInnovations();
        this.renderInnovations();
        this.updateOverview();
        closeModal('addInnovationModal');
        showAlert('İnovasyon kaydedildi', 'success');
        e.target.reset();
    }

    // Patent actions
    viewPatentDetails(id) {
        const p = this.patents.find(x => x.id === id);
        if (!p) return;
        alert(`Patent: ${p.name}\nNumara: ${p.number}\nDurum: ${this.getPatentStatusName(p.status)}\nBaşvuru Tarihi: ${this.formatDate(p.applicationDate)}\nDeğer: ${this.formatCurrency(p.value)}`);
    }

    editPatent(id) {
        showAlert('Patent düzenleme özelliği yakında eklenecek', 'info');
    }

    downloadPatentDocument(id) {
        showAlert('Patent belgesi indiriliyor...', 'info');
    }

    handleAddPatent(e) {
        e.preventDefault();
        const newPatent = {
            id: 'PAT-' + (100 + Math.floor(Math.random() * 900)),
            name: document.getElementById('patentName').value,
            number: 'TR2024/' + (100000 + Math.floor(Math.random() * 900000)),
            status: 'pending',
            applicationDate: new Date().toISOString().split('T')[0],
            category: document.getElementById('patentCategory').value,
            value: parseInt(document.getElementById('patentValue').value) || 0
        };
        this.patents.unshift(newPatent);
        this.savePatents();
        this.renderPatents();
        this.updateOverview();
        closeModal('addPatentModal');
        showAlert('Patent başvurusu yapıldı', 'success');
        e.target.reset();
    }

    // Software actions
    viewRepository(name) {
        showAlert(`${name} repository detayları yakında eklenecek`, 'info');
    }

    manageRepository(name) {
        showAlert(`${name} repository yönetimi yakında eklenecek`, 'info');
    }

    // Analytics
    loadAnalyticsData() {
        this.updateAnalytics();
    }

    updateAnalytics() {
        if (typeof Chart === 'undefined') return;
        this.updateProjectProgressChart();
        this.updateBudgetUsageChart();
        this.updateTechnologyDistributionChart();
        this.updateInnovationTrendChart();
    }

    updateProjectProgressChart() {
        const ctx = document.getElementById('projectProgressChart');
        if (!ctx) return;
        if (this.projectProgressChart) this.projectProgressChart.destroy();
        const projects = this.projects.slice(0, 5).map(p => p.name);
        const progress = projects.map(() => Math.random() * 100);
        this.projectProgressChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: projects,
                datasets: [{
                    label: 'İlerleme %',
                    data: progress,
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } }
            }
        });
    }

    updateBudgetUsageChart() {
        const ctx = document.getElementById('budgetUsageChart');
        if (!ctx) return;
        if (this.budgetUsageChart) this.budgetUsageChart.destroy();
        const projects = this.projects.slice(0, 5).map(p => p.name);
        const budget = projects.map(() => Math.random() * 100);
        this.budgetUsageChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: projects,
                datasets: [{
                    label: 'Bütçe Kullanımı %',
                    data: budget,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } }
            }
        });
    }

    updateTechnologyDistributionChart() {
        const ctx = document.getElementById('technologyDistributionChart');
        if (!ctx) return;
        if (this.technologyDistributionChart) this.technologyDistributionChart.destroy();
        const technologies = ['AI', 'Blockchain', 'IoT', 'Cloud', 'Security'];
        const distribution = technologies.map(() => Math.random() * 30);
        this.technologyDistributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: technologies,
                datasets: [{
                    data: distribution,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(168, 85, 247, 0.8)'
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

    updateInnovationTrendChart() {
        const ctx = document.getElementById('innovationTrendChart');
        if (!ctx) return;
        if (this.innovationTrendChart) this.innovationTrendChart.destroy();
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
        const innovations = months.map(() => Math.floor(Math.random() * 10 + 2));
        this.innovationTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'İnovasyon Sayısı',
                    data: innovations,
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

    // Filters
    filterProjects(q) {
        const filtered = this.projects.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
        this.renderFilteredProjects(filtered);
    }

    filterProjectsByStatus(s) {
        if (!s) { this.renderProjects(); return; }
        this.renderFilteredProjects(this.projects.filter(p => p.status === s));
    }

    filterProjectsByPriority(p) {
        if (!p) { this.renderProjects(); return; }
        this.renderFilteredProjects(this.projects.filter(proj => proj.priority === p));
    }

    filterResearch(q) {
        const filtered = this.research.filter(r => r.name.toLowerCase().includes(q.toLowerCase()));
        this.renderFilteredResearch(filtered);
    }

    filterResearchByType(t) {
        if (!t) { this.renderResearch(); return; }
        this.renderFilteredResearch(this.research.filter(r => r.type === t));
    }

    filterResearchByStatus(s) {
        if (!s) { this.renderResearch(); return; }
        this.renderFilteredResearch(this.research.filter(r => r.status === s));
    }

    renderFilteredProjects(rows) {
        const tbody = document.getElementById('projectsTableBody');
        if (!tbody) return;
        tbody.innerHTML = rows.map(p => `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td><span class="category-badge ${p.category}">${this.getCategoryName(p.category)}</span></td>
                <td><span class="status-badge ${p.status}">${this.getStatusName(p.status)}</span></td>
                <td><span class="priority-badge ${p.priority}">${this.getPriorityName(p.priority)}</span></td>
                <td>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${p.progress}%"></div>
                        </div>
                        <span class="progress-text">${p.progress}%</span>
                    </div>
                </td>
                <td>${this.formatDate(p.startDate)}</td>
                <td>${this.formatDate(p.endDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="rdManager.viewProject('${p.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="rdManager.editProject('${p.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-primary btn-xs" onclick="rdManager.updateProgress('${p.id}')">
                            <i class="fas fa-chart-line"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderFilteredResearch(rows) {
        const grid = document.querySelector('.research-grid');
        if (!grid) return;
        grid.innerHTML = rows.map(r => `
            <div class="research-card">
                <div class="research-header">
                    <h3>${r.name}</h3>
                    <span class="status-badge ${r.status}">${this.getStatusName(r.status)}</span>
                </div>
                <div class="research-meta">
                    <p><strong>Tür:</strong> ${this.getTypeName(r.type)}</p>
                    <p><strong>Başlangıç:</strong> ${this.formatDate(r.startDate)}</p>
                    <p><strong>Tahmini Bitiş:</strong> ${this.formatDate(r.endDate)}</p>
                    <p><strong>Bütçe:</strong> ${this.formatCurrency(r.budget)}</p>
                </div>
                <div class="research-description">
                    <p>${this.getResearchDescription(r.type)}</p>
                </div>
                <div class="research-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${r.progress}%"></div>
                    </div>
                    <span class="progress-text">${r.progress}% Tamamlandı</span>
                </div>
                <div class="research-actions">
                    <button class="btn btn-outline btn-xs" onclick="rdManager.viewResearchDetails('${r.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-xs" onclick="rdManager.editResearch('${r.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-primary btn-xs" onclick="rdManager.generateResearchReport('${r.id}')">
                        <i class="fas fa-file-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Export
    exportRDData() {
        const data = {
            projects: this.projects,
            research: this.research,
            innovations: this.innovations,
            patents: this.patents,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rd-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showAlert('Ar-Ge verileri dışa aktarıldı', 'success');
    }

    // Utils
    formatNumber(n) { return new Intl.NumberFormat('tr-TR').format(n); }
    formatCurrency(n) { return '₺' + new Intl.NumberFormat('tr-TR').format(n); }
    formatDate(d) { return new Date(d).toLocaleDateString('tr-TR'); }

    calculateEndDate(months) {
        const date = new Date();
        date.setMonth(date.getMonth() + months);
        return date.toISOString().split('T')[0];
    }

    getCategoryName(c) { return ({ software: 'Yazılım', research: 'Araştırma', innovation: 'İnovasyon', infrastructure: 'Altyapı', security: 'Güvenlik' })[c] || c; }
    getStatusName(s) { return ({ planning: 'Planlama', development: 'Geliştirme', testing: 'Test', completed: 'Tamamlandı', 'on-hold': 'Beklemede', ongoing: 'Devam Ediyor', paused: 'Duraklatıldı' })[s] || s; }
    getPriorityName(p) { return ({ low: 'Düşük', medium: 'Orta', high: 'Yüksek', critical: 'Kritik' })[p] || p; }
    getTypeName(t) { return ({ ai: 'Yapay Zeka', blockchain: 'Blockchain', iot: 'IoT', cloud: 'Cloud Computing', security: 'Güvenlik', mobile: 'Mobil Teknolojiler' })[t] || t; }
    getPatentStatusName(s) { return ({ pending: 'Patent Bekliyor', patented: 'Patentli', 'under-review': 'İncelemede', granted: 'Onaylandı' })[s] || s; }
    getInnovationStatusName(s) { return ({ idea: 'Fikir', prototype: 'Prototip', development: 'Geliştirme', production: 'Üretimde' })[s] || s; }

    getResearchDescription(type) {
        const descriptions = {
            ai: 'Yapay zeka algoritmaları ve makine öğrenmesi teknikleri kullanarak gelişmiş analiz sistemleri.',
            blockchain: 'Güvenli ve şeffaf işlemler için blockchain teknolojisi entegrasyonu.',
            iot: 'Nesnelerin interneti cihazları ile platform entegrasyonu ve veri toplama.',
            cloud: 'Bulut bilişim altyapısı ve ölçeklenebilir sistem mimarisi.',
            security: 'Gelişmiş güvenlik protokolleri ve siber güvenlik önlemleri.',
            mobile: 'Mobil uygulama geliştirme ve platform optimizasyonu.'
        };
        return descriptions[type] || 'Teknoloji araştırması ve geliştirme projesi.';
    }

    getInnovationDescription(category) {
        const descriptions = {
            ai: 'Yapay zeka teknolojileri kullanarak geliştirilen yenilikçi çözüm.',
            blockchain: 'Blockchain teknolojisi ile güvenli ve şeffaf sistem.',
            iot: 'Nesnelerin interneti entegrasyonu ile akıllı sistem.',
            cloud: 'Bulut bilişim altyapısı ile ölçeklenebilir çözüm.',
            security: 'Gelişmiş güvenlik teknolojileri ile korumalı sistem.',
            mobile: 'Mobil teknolojiler ile kullanıcı dostu çözüm.'
        };
        return descriptions[category] || 'Yenilikçi teknoloji çözümü.';
    }

    getInnovationImpact(category) {
        const impacts = {
            ai: ['%90 doğruluk oranı', '%75 maliyet tasarrufu', '7/24 otomatik kontrol'],
            blockchain: ['%99.9 güvenlik', '%60 hız artışı', 'Düşük işlem maliyeti'],
            iot: ['Gerçek zamanlı veri', '%50 verimlilik artışı', 'Otomatik süreç yönetimi'],
            cloud: ['%99.9 uptime', 'Sınırsız ölçeklenebilirlik', 'Hızlı deployment'],
            security: ['%100 güvenlik', 'Sıfır veri kaybı', 'Gelişmiş tehdit koruması'],
            mobile: ['%95 kullanıcı memnuniyeti', '%80 hız artışı', 'Çoklu platform desteği']
        };
        return impacts[category] || ['%50 verimlilik artışı', '%30 maliyet tasarrufu', 'Gelişmiş kullanıcı deneyimi'];
    }
}

// Global functions
function showTab(t) { rdManager.showTab(t); }
function showAddProjectModal() { rdManager ? document.getElementById('addProjectModal').style.display = 'block' : null; }
function showAddResearchModal() { rdManager ? document.getElementById('addResearchModal').style.display = 'block' : null; }
function showAddInnovationModal() { rdManager ? document.getElementById('addInnovationModal').style.display = 'block' : null; }
function showAddPatentModal() { rdManager ? document.getElementById('addPatentModal').style.display = 'block' : null; }
function exportRDData() { rdManager.exportRDData(); }
function downloadAnalytics(type) { showAlert(`${type} raporu yakında`, 'info'); }
function viewResearchDetails(id) { rdManager.viewResearchDetails(id); }
function editResearch(id) { rdManager.editResearch(id); }
function generateResearchReport(id) { rdManager.generateResearchReport(id); }
function viewInnovationDetails(id) { rdManager.viewInnovationDetails(id); }
function editInnovation(id) { rdManager.editInnovation(id); }
function filePatent(id) { rdManager.filePatent(id); }
function viewPatentDetails(id) { rdManager.viewPatentDetails(id); }
function editPatent(id) { rdManager.editPatent(id); }
function downloadPatentDocument(id) { rdManager.downloadPatentDocument(id); }
function viewRepository(name) { rdManager.viewRepository(name); }
function manageRepository(name) { rdManager.manageRepository(name); }

let rdManager;
document.addEventListener('DOMContentLoaded', () => {
    rdManager = new RDSoftwareManager();
});

console.log('✅ R&D & Software System Loaded');
