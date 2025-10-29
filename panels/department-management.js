// Department Management JavaScript
class DepartmentManager {
    constructor() {
        this.departments = this.loadDepartments();
        this.employees = this.loadEmployees();
        this.budgets = this.loadBudgets();
        this.currentTab = 'departments';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderDepartments();
        this.renderEmployees();
        this.renderBudgets();
        this.updateStatistics();
    }

    setupEventListeners() {
        // Search and filter events
        document.getElementById('departmentSearch')?.addEventListener('input', (e) => {
            this.filterDepartments(e.target.value);
        });

        document.getElementById('departmentFilter')?.addEventListener('change', (e) => {
            this.filterDepartmentsByStatus(e.target.value);
        });

        document.getElementById('employeeSearch')?.addEventListener('input', (e) => {
            this.filterEmployees(e.target.value);
        });

        document.getElementById('employeeFilter')?.addEventListener('change', (e) => {
            this.filterEmployeesByDepartment(e.target.value);
        });

        // Form submissions
        document.getElementById('addDepartmentForm')?.addEventListener('submit', (e) => {
            this.handleAddDepartment(e);
        });

        document.getElementById('editDepartmentForm')?.addEventListener('submit', (e) => {
            this.handleEditDepartment(e);
        });

        document.getElementById('budgetForm')?.addEventListener('submit', (e) => {
            this.handleBudgetSubmit(e);
        });

        // Performance date range
        document.getElementById('performanceStartDate').value = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
        document.getElementById('performanceEndDate').value = new Date().toISOString().split('T')[0];
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
        if (tabName === 'performance') {
            this.loadPerformanceCharts();
        }
    }

    // Department Management
    loadDepartments() {
        const saved = localStorage.getItem('departments');
        if (saved) {
            return JSON.parse(saved);
        }

        // Default departments
        return [
            {
                id: 1,
                name: 'Satış',
                code: 'SAT',
                manager: 'Ahmet Yılmaz',
                managerId: 'manager1',
                description: 'Satış ve müşteri ilişkileri departmanı',
                budget: 5000000,
                employees: 45,
                performance: 94,
                status: 'active',
                createdAt: '2024-01-15'
            },
            {
                id: 2,
                name: 'Pazarlama',
                code: 'PAZ',
                manager: 'Ayşe Demir',
                managerId: 'manager2',
                description: 'Pazarlama ve reklam departmanı',
                budget: 3000000,
                employees: 28,
                performance: 89,
                status: 'active',
                createdAt: '2024-01-15'
            },
            {
                id: 3,
                name: 'Geliştirme',
                code: 'GEL',
                manager: 'Mehmet Kaya',
                managerId: 'manager3',
                description: 'Yazılım geliştirme ve teknoloji departmanı',
                budget: 8000000,
                employees: 65,
                performance: 91,
                status: 'active',
                createdAt: '2024-01-15'
            },
            {
                id: 4,
                name: 'İnsan Kaynakları',
                code: 'IK',
                manager: 'Fatma Özkan',
                managerId: 'manager4',
                description: 'İnsan kaynakları ve personel yönetimi',
                budget: 1500000,
                employees: 12,
                performance: 78,
                status: 'active',
                createdAt: '2024-01-15'
            },
            {
                id: 5,
                name: 'Müşteri Hizmetleri',
                code: 'MH',
                manager: 'Ali Veli',
                managerId: 'manager5',
                description: 'Müşteri destek ve hizmet departmanı',
                budget: 2000000,
                employees: 35,
                performance: 86,
                status: 'active',
                createdAt: '2024-01-15'
            },
            {
                id: 6,
                name: 'Finans',
                code: 'FIN',
                manager: 'Zeynep Ak',
                managerId: 'manager6',
                description: 'Mali işler ve finansal yönetim',
                budget: 1000000,
                employees: 18,
                performance: 92,
                status: 'active',
                createdAt: '2024-01-15'
            }
        ];
    }

    loadEmployees() {
        const saved = localStorage.getItem('employees');
        if (saved) {
            return JSON.parse(saved);
        }

        // Default employees
        return [
            {
                id: 1,
                name: 'Ahmet Yılmaz',
                email: 'ahmet.yilmaz@videosat.com',
                department: 'Satış',
                position: 'Satış Müdürü',
                performance: 94,
                status: 'active',
                hireDate: '2023-01-15',
                salary: 25000
            },
            {
                id: 2,
                name: 'Ayşe Demir',
                email: 'ayse.demir@videosat.com',
                department: 'Pazarlama',
                position: 'Pazarlama Müdürü',
                performance: 89,
                status: 'active',
                hireDate: '2023-02-01',
                salary: 22000
            },
            {
                id: 3,
                name: 'Mehmet Kaya',
                email: 'mehmet.kaya@videosat.com',
                department: 'Geliştirme',
                position: 'Teknik Müdür',
                performance: 91,
                status: 'active',
                hireDate: '2023-01-01',
                salary: 30000
            },
            {
                id: 4,
                name: 'Fatma Özkan',
                email: 'fatma.ozkan@videosat.com',
                department: 'İnsan Kaynakları',
                position: 'İK Müdürü',
                performance: 78,
                status: 'active',
                hireDate: '2023-03-01',
                salary: 18000
            },
            {
                id: 5,
                name: 'Ali Veli',
                email: 'ali.veli@videosat.com',
                department: 'Müşteri Hizmetleri',
                position: 'MH Müdürü',
                performance: 86,
                status: 'active',
                hireDate: '2023-02-15',
                salary: 20000
            },
            {
                id: 6,
                name: 'Zeynep Ak',
                email: 'zeynep.ak@videosat.com',
                department: 'Finans',
                position: 'Finans Müdürü',
                performance: 92,
                status: 'active',
                hireDate: '2023-01-20',
                salary: 24000
            }
        ];
    }

    loadBudgets() {
        const saved = localStorage.getItem('budgets');
        if (saved) {
            return JSON.parse(saved);
        }

        return [
            {
                id: 1,
                department: 'Satış',
                year: 2024,
                totalBudget: 5000000,
                usedBudget: 3200000,
                remainingBudget: 1800000,
                description: 'Satış departmanı yıllık bütçesi'
            },
            {
                id: 2,
                department: 'Pazarlama',
                year: 2024,
                totalBudget: 3000000,
                usedBudget: 2100000,
                remainingBudget: 900000,
                description: 'Pazarlama departmanı yıllık bütçesi'
            },
            {
                id: 3,
                department: 'Geliştirme',
                year: 2024,
                totalBudget: 8000000,
                usedBudget: 5500000,
                remainingBudget: 2500000,
                description: 'Geliştirme departmanı yıllık bütçesi'
            }
        ];
    }

    saveDepartments() {
        localStorage.setItem('departments', JSON.stringify(this.departments));
    }

    saveEmployees() {
        localStorage.setItem('employees', JSON.stringify(this.employees));
    }

    saveBudgets() {
        localStorage.setItem('budgets', JSON.stringify(this.budgets));
    }

    // Render Functions
    renderDepartments() {
        const grid = document.getElementById('departmentsGrid');
        if (!grid) return;

        grid.innerHTML = this.departments.map(dept => `
            <div class="department-card" data-department-id="${dept.id}">
                <div class="card-header">
                    <div class="department-info">
                        <h3>${dept.name}</h3>
                        <span class="department-code">${dept.code}</span>
                    </div>
                    <div class="department-status ${dept.status}">
                        <i class="fas fa-circle"></i>
                        ${dept.status === 'active' ? 'Aktif' : 'Pasif'}
                    </div>
                </div>
                <div class="card-content">
                    <div class="department-manager">
                        <i class="fas fa-user-tie"></i>
                        <span>${dept.manager}</span>
                    </div>
                    <div class="department-stats">
                        <div class="stat">
                            <i class="fas fa-users"></i>
                            <span>${dept.employees} çalışan</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-chart-line"></i>
                            <span>%${dept.performance} performans</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-wallet"></i>
                            <span>₺${this.formatNumber(dept.budget)} bütçe</span>
                        </div>
                    </div>
                    <p class="department-description">${dept.description}</p>
                </div>
                <div class="card-actions">
                    <button class="btn btn-outline btn-sm" onclick="departmentManager.editDepartment(${dept.id})">
                        <i class="fas fa-edit"></i>
                        Düzenle
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="departmentManager.viewDepartmentDetails(${dept.id})">
                        <i class="fas fa-eye"></i>
                        Detaylar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="departmentManager.deleteDepartment(${dept.id})">
                        <i class="fas fa-trash"></i>
                        Sil
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderEmployees() {
        const tbody = document.getElementById('employeesTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.employees.map(emp => `
            <tr>
                <td>
                    <div class="employee-info">
                        <div class="employee-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="employee-details">
                            <strong>${emp.name}</strong>
                            <small>${emp.email}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="department-badge">${emp.department}</span>
                </td>
                <td>${emp.position}</td>
                <td>
                    <div class="performance-bar">
                        <div class="performance-fill" style="width: ${emp.performance}%"></div>
                        <span class="performance-text">%${emp.performance}</span>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${emp.status}">
                        ${emp.status === 'active' ? 'Aktif' : 'Pasif'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="departmentManager.editEmployee(${emp.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="departmentManager.viewEmployee(${emp.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderBudgets() {
        const grid = document.getElementById('budgetsGrid');
        if (!grid) return;

        grid.innerHTML = this.budgets.map(budget => `
            <div class="budget-card">
                <div class="budget-header">
                    <h3>${budget.department}</h3>
                    <span class="budget-year">${budget.year}</span>
                </div>
                <div class="budget-content">
                    <div class="budget-amounts">
                        <div class="budget-item">
                            <span class="label">Toplam Bütçe:</span>
                            <span class="amount">₺${this.formatNumber(budget.totalBudget)}</span>
                        </div>
                        <div class="budget-item">
                            <span class="label">Kullanılan:</span>
                            <span class="amount used">₺${this.formatNumber(budget.usedBudget)}</span>
                        </div>
                        <div class="budget-item">
                            <span class="label">Kalan:</span>
                            <span class="amount remaining">₺${this.formatNumber(budget.remainingBudget)}</span>
                        </div>
                    </div>
                    <div class="budget-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(budget.usedBudget / budget.totalBudget) * 100}%"></div>
                        </div>
                        <span class="progress-text">%${Math.round((budget.usedBudget / budget.totalBudget) * 100)} kullanıldı</span>
                    </div>
                    <p class="budget-description">${budget.description}</p>
                </div>
                <div class="budget-actions">
                    <button class="btn btn-outline btn-sm" onclick="departmentManager.editBudget(${budget.id})">
                        <i class="fas fa-edit"></i>
                        Düzenle
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateStatistics() {
        const totalDepartments = this.departments.filter(d => d.status === 'active').length;
        const totalEmployees = this.employees.filter(e => e.status === 'active').length;
        const avgPerformance = Math.round(this.departments.reduce((sum, d) => sum + d.performance, 0) / this.departments.length);
        const topDepartment = this.departments.reduce((max, d) => d.performance > max.performance ? d : max);

        document.getElementById('totalDepartments').textContent = totalDepartments;
        document.getElementById('totalEmployees').textContent = totalEmployees;
        document.getElementById('avgPerformance').textContent = avgPerformance + '%';
        document.getElementById('topDepartment').textContent = topDepartment.name;
    }

    // Modal Functions
    showAddDepartmentModal() {
        document.getElementById('addDepartmentModal').style.display = 'block';
    }

    showBudgetModal() {
        document.getElementById('budgetModal').style.display = 'block';
    }

    // Form Handlers
    handleAddDepartment(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newDepartment = {
            id: Date.now(),
            name: document.getElementById('departmentName').value,
            code: document.getElementById('departmentCode').value,
            manager: document.getElementById('departmentManager').selectedOptions[0].text,
            managerId: document.getElementById('departmentManager').value,
            description: document.getElementById('departmentDescription').value,
            budget: parseInt(document.getElementById('departmentBudget').value) || 0,
            employees: 0,
            performance: 0,
            status: document.getElementById('departmentActive').checked ? 'active' : 'inactive',
            createdAt: new Date().toISOString()
        };

        this.departments.push(newDepartment);
        this.saveDepartments();
        this.renderDepartments();
        this.updateStatistics();
        
        closeModal('addDepartmentModal');
        showAlert('Departman başarıyla eklendi!', 'success');
        e.target.reset();
    }

    handleEditDepartment(e) {
        e.preventDefault();
        
        const departmentId = parseInt(document.getElementById('editDepartmentId').value);
        const departmentIndex = this.departments.findIndex(d => d.id === departmentId);
        
        if (departmentIndex !== -1) {
            this.departments[departmentIndex] = {
                ...this.departments[departmentIndex],
                name: document.getElementById('editDepartmentName').value,
                code: document.getElementById('editDepartmentCode').value,
                manager: document.getElementById('editDepartmentManager').selectedOptions[0].text,
                managerId: document.getElementById('editDepartmentManager').value,
                description: document.getElementById('editDepartmentDescription').value,
                budget: parseInt(document.getElementById('editDepartmentBudget').value) || 0,
                status: document.getElementById('editDepartmentActive').checked ? 'active' : 'inactive'
            };

            this.saveDepartments();
            this.renderDepartments();
            this.updateStatistics();
            
            closeModal('editDepartmentModal');
            showAlert('Departman başarıyla güncellendi!', 'success');
        }
    }

    handleBudgetSubmit(e) {
        e.preventDefault();
        
        const newBudget = {
            id: Date.now(),
            department: document.getElementById('budgetDepartment').value,
            year: parseInt(document.getElementById('budgetYear').value),
            totalBudget: parseInt(document.getElementById('budgetAmount').value),
            usedBudget: parseInt(document.getElementById('budgetUsed').value) || 0,
            remainingBudget: parseInt(document.getElementById('budgetAmount').value) - (parseInt(document.getElementById('budgetUsed').value) || 0),
            description: document.getElementById('budgetDescription').value
        };

        this.budgets.push(newBudget);
        this.saveBudgets();
        this.renderBudgets();
        
        closeModal('budgetModal');
        showAlert('Bütçe başarıyla eklendi!', 'success');
        e.target.reset();
    }

    // Department Actions
    editDepartment(departmentId) {
        const department = this.departments.find(d => d.id === departmentId);
        if (!department) return;

        document.getElementById('editDepartmentId').value = department.id;
        document.getElementById('editDepartmentName').value = department.name;
        document.getElementById('editDepartmentCode').value = department.code;
        document.getElementById('editDepartmentManager').value = department.managerId;
        document.getElementById('editDepartmentDescription').value = department.description;
        document.getElementById('editDepartmentBudget').value = department.budget;
        document.getElementById('editDepartmentActive').checked = department.status === 'active';

        document.getElementById('editDepartmentModal').style.display = 'block';
    }

    deleteDepartment(departmentId) {
        if (confirm('Bu departmanı silmek istediğinizden emin misiniz?')) {
            this.departments = this.departments.filter(d => d.id !== departmentId);
            this.saveDepartments();
            this.renderDepartments();
            this.updateStatistics();
            showAlert('Departman başarıyla silindi!', 'success');
        }
    }

    viewDepartmentDetails(departmentId) {
        const department = this.departments.find(d => d.id === departmentId);
        if (!department) return;

        const details = `
            Departman: ${department.name} (${department.code})
            Müdür: ${department.manager}
            Çalışan Sayısı: ${department.employees}
            Performans: %${department.performance}
            Bütçe: ₺${this.formatNumber(department.budget)}
            Durum: ${department.status === 'active' ? 'Aktif' : 'Pasif'}
            Açıklama: ${department.description}
        `;
        
        alert(details);
    }

    // Employee Actions
    editEmployee(employeeId) {
        showAlert('Çalışan düzenleme özelliği yakında eklenecek!', 'info');
    }

    viewEmployee(employeeId) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) return;

        const details = `
            Ad: ${employee.name}
            E-posta: ${employee.email}
            Departman: ${employee.department}
            Pozisyon: ${employee.position}
            Performans: %${employee.performance}
            Durum: ${employee.status === 'active' ? 'Aktif' : 'Pasif'}
            İşe Başlama: ${employee.hireDate}
        `;
        
        alert(details);
    }

    // Budget Actions
    editBudget(budgetId) {
        showAlert('Bütçe düzenleme özelliği yakında eklenecek!', 'info');
    }

    // Filter Functions
    filterDepartments(searchTerm) {
        const filtered = this.departments.filter(dept => 
            dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.manager.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredDepartments(filtered);
    }

    filterDepartmentsByStatus(status) {
        if (!status) {
            this.renderDepartments();
            return;
        }

        const filtered = this.departments.filter(dept => {
            if (status === 'high-performance') {
                return dept.performance >= 90;
            }
            return dept.status === status;
        });
        this.renderFilteredDepartments(filtered);
    }

    filterEmployees(searchTerm) {
        const filtered = this.employees.filter(emp => 
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.position.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredEmployees(filtered);
    }

    filterEmployeesByDepartment(department) {
        if (!department) {
            this.renderEmployees();
            return;
        }

        const filtered = this.employees.filter(emp => emp.department === department);
        this.renderFilteredEmployees(filtered);
    }

    renderFilteredDepartments(departments) {
        const grid = document.getElementById('departmentsGrid');
        if (!grid) return;

        grid.innerHTML = departments.map(dept => `
            <div class="department-card" data-department-id="${dept.id}">
                <div class="card-header">
                    <div class="department-info">
                        <h3>${dept.name}</h3>
                        <span class="department-code">${dept.code}</span>
                    </div>
                    <div class="department-status ${dept.status}">
                        <i class="fas fa-circle"></i>
                        ${dept.status === 'active' ? 'Aktif' : 'Pasif'}
                    </div>
                </div>
                <div class="card-content">
                    <div class="department-manager">
                        <i class="fas fa-user-tie"></i>
                        <span>${dept.manager}</span>
                    </div>
                    <div class="department-stats">
                        <div class="stat">
                            <i class="fas fa-users"></i>
                            <span>${dept.employees} çalışan</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-chart-line"></i>
                            <span>%${dept.performance} performans</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-wallet"></i>
                            <span>₺${this.formatNumber(dept.budget)} bütçe</span>
                        </div>
                    </div>
                    <p class="department-description">${dept.description}</p>
                </div>
                <div class="card-actions">
                    <button class="btn btn-outline btn-sm" onclick="departmentManager.editDepartment(${dept.id})">
                        <i class="fas fa-edit"></i>
                        Düzenle
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="departmentManager.viewDepartmentDetails(${dept.id})">
                        <i class="fas fa-eye"></i>
                        Detaylar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="departmentManager.deleteDepartment(${dept.id})">
                        <i class="fas fa-trash"></i>
                        Sil
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderFilteredEmployees(employees) {
        const tbody = document.getElementById('employeesTableBody');
        if (!tbody) return;

        tbody.innerHTML = employees.map(emp => `
            <tr>
                <td>
                    <div class="employee-info">
                        <div class="employee-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="employee-details">
                            <strong>${emp.name}</strong>
                            <small>${emp.email}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="department-badge">${emp.department}</span>
                </td>
                <td>${emp.position}</td>
                <td>
                    <div class="performance-bar">
                        <div class="performance-fill" style="width: ${emp.performance}%"></div>
                        <span class="performance-text">%${emp.performance}</span>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${emp.status}">
                        ${emp.status === 'active' ? 'Aktif' : 'Pasif'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="departmentManager.editEmployee(${emp.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="departmentManager.viewEmployee(${emp.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Performance Charts
    loadPerformanceCharts() {
        // Simple performance chart implementation
        const performanceData = this.departments.map(dept => ({
            name: dept.name,
            performance: dept.performance
        }));

        // This would integrate with Chart.js in a real implementation
        console.log('Performance data loaded:', performanceData);
    }

    updatePerformanceData() {
        showAlert('Performans verileri güncellendi!', 'success');
    }

    // Export Functions
    exportDepartmentData() {
        const data = {
            departments: this.departments,
            employees: this.employees,
            budgets: this.budgets,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `departments-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showAlert('Departman verileri başarıyla dışa aktarıldı!', 'success');
    }

    // Utility Functions
    formatNumber(num) {
        return new Intl.NumberFormat('tr-TR').format(num);
    }
}

// Global Functions
function showTab(tabName) {
    departmentManager.showTab(tabName);
}

function showAddDepartmentModal() {
    departmentManager.showAddDepartmentModal();
}

function showBudgetModal() {
    departmentManager.showBudgetModal();
}

function exportDepartmentData() {
    departmentManager.exportDepartmentData();
}

function updatePerformanceData() {
    departmentManager.updatePerformanceData();
}

// Initialize Department Manager
let departmentManager;
document.addEventListener('DOMContentLoaded', function() {
    departmentManager = new DepartmentManager();
});

console.log('✅ Department Management System Loaded');
