// Human Resources Management JavaScript
class HumanResourcesManager {
    constructor() {
        this.employees = this.loadEmployees();
        this.performanceData = this.loadPerformanceData();
        this.payrollData = this.loadPayrollData();
        this.hrReports = this.loadHRReports();
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderEmployees();
        this.renderPayroll();
        this.updateHROverview();
        this.loadDashboardData();
        this.setDefaultDates();
        this.setupModalCloseListeners();
    }

    setupModalCloseListeners() {
        const modals = ['addEmployeeModal', 'payrollModal', 'performanceReviewModal'];
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
        document.getElementById('employeeSearch')?.addEventListener('input', (e) => {
            this.filterEmployees(e.target.value);
        });

        document.getElementById('employeeFilter')?.addEventListener('change', (e) => {
            this.filterEmployeesByStatus(e.target.value);
        });

        document.getElementById('departmentFilter')?.addEventListener('change', (e) => {
            this.filterEmployeesByDepartment(e.target.value);
        });

        document.getElementById('positionFilter')?.addEventListener('change', (e) => {
            this.filterEmployeesByPosition(e.target.value);
        });

        // Form submissions
        document.getElementById('addEmployeeForm')?.addEventListener('submit', (e) => {
            this.handleAddEmployee(e);
        });

        document.getElementById('payrollForm')?.addEventListener('submit', (e) => {
            this.handlePayrollSubmit(e);
        });

        // Chart period changes
        document.getElementById('performancePeriod')?.addEventListener('change', (e) => {
            this.updatePerformanceTrendChart(e.target.value);
        });
    }

    setDefaultDates() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        document.getElementById('performanceStartDate').value = startOfMonth.toISOString().split('T')[0];
        document.getElementById('performanceEndDate').value = today.toISOString().split('T')[0];
        document.getElementById('reportStartDate').value = startOfMonth.toISOString().split('T')[0];
        document.getElementById('reportEndDate').value = today.toISOString().split('T')[0];
        document.getElementById('employeeStartDate').value = today.toISOString().split('T')[0];
        document.getElementById('payrollStartDate').value = startOfMonth.toISOString().split('T')[0];
        document.getElementById('payrollEndDate').value = today.toISOString().split('T')[0];
        document.getElementById('paymentDate').value = today.toISOString().split('T')[0];
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
        } else if (tabName === 'reports') {
            this.loadReportsData();
        }
    }

    // Data Loading
    loadEmployees() {
        const saved = localStorage.getItem('hrEmployees');
        if (saved) {
            return JSON.parse(saved);
        }

        // Default employees
        return [
            {
                id: 1,
                firstName: 'Ahmet',
                lastName: 'Yılmaz',
                email: 'ahmet.yilmaz@videosat.com',
                phone: '+90 555 123 4567',
                department: 'sales',
                position: 'manager',
                salary: 25000,
                startDate: '2023-01-15',
                address: 'İstanbul, Türkiye',
                notes: 'Satış müdürü',
                status: 'active',
                performance: 92.5,
                avatar: 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=AY'
            },
            {
                id: 2,
                firstName: 'Ayşe',
                lastName: 'Demir',
                email: 'ayse.demir@videosat.com',
                phone: '+90 555 234 5678',
                department: 'marketing',
                position: 'senior',
                salary: 18000,
                startDate: '2023-03-20',
                address: 'Ankara, Türkiye',
                notes: 'Pazarlama uzmanı',
                status: 'active',
                performance: 88.7,
                avatar: 'https://via.placeholder.com/40x40/059669/FFFFFF?text=AD'
            },
            {
                id: 3,
                firstName: 'Mehmet',
                lastName: 'Kaya',
                email: 'mehmet.kaya@videosat.com',
                phone: '+90 555 345 6789',
                department: 'development',
                position: 'senior',
                salary: 22000,
                startDate: '2022-11-10',
                address: 'İzmir, Türkiye',
                notes: 'Senior developer',
                status: 'active',
                performance: 95.2,
                avatar: 'https://via.placeholder.com/40x40/DC2626/FFFFFF?text=MK'
            },
            {
                id: 4,
                firstName: 'Zeynep',
                lastName: 'Özkan',
                email: 'zeynep.ozkan@videosat.com',
                phone: '+90 555 456 7890',
                department: 'hr',
                position: 'manager',
                salary: 20000,
                startDate: '2023-02-01',
                address: 'Bursa, Türkiye',
                notes: 'İK müdürü',
                status: 'active',
                performance: 89.3,
                avatar: 'https://via.placeholder.com/40x40/7C3AED/FFFFFF?text=ZO'
            },
            {
                id: 5,
                firstName: 'Ali',
                lastName: 'Çelik',
                email: 'ali.celik@videosat.com',
                phone: '+90 555 567 8901',
                department: 'finance',
                position: 'senior',
                salary: 19000,
                startDate: '2023-04-15',
                address: 'Antalya, Türkiye',
                notes: 'Mali müşavir',
                status: 'active',
                performance: 91.8,
                avatar: 'https://via.placeholder.com/40x40/EA580C/FFFFFF?text=AC'
            },
            {
                id: 6,
                firstName: 'Fatma',
                lastName: 'Şahin',
                email: 'fatma.sahin@videosat.com',
                phone: '+90 555 678 9012',
                department: 'development',
                position: 'junior',
                salary: 12000,
                startDate: '2024-01-10',
                address: 'Trabzon, Türkiye',
                notes: 'Junior developer',
                status: 'probation',
                performance: 76.4,
                avatar: 'https://via.placeholder.com/40x40/0891B2/FFFFFF?text=FS'
            }
        ];
    }

    loadPerformanceData() {
        return {
            overallPerformance: 87.3,
            highPerformers: 23,
            needsImprovement: 8,
            goalAchievement: 94.2,
            departmentPerformance: {
                'sales': 89.2,
                'marketing': 85.7,
                'development': 92.1,
                'hr': 88.9,
                'finance': 91.5
            },
            performanceDistribution: {
                'excellent': 15,
                'good': 45,
                'average': 30,
                'needs_improvement': 10
            }
        };
    }

    loadPayrollData() {
        const saved = localStorage.getItem('hrPayroll');
        if (saved) {
            return JSON.parse(saved);
        }

        return [
            {
                id: 1,
                employeeId: 1,
                employeeName: 'Ahmet Yılmaz',
                department: 'sales',
                grossSalary: 25000,
                sgkPremium: 3750,
                taxDeduction: 2500,
                netSalary: 18750,
                status: 'paid',
                payDate: '2024-10-01'
            },
            {
                id: 2,
                employeeId: 2,
                employeeName: 'Ayşe Demir',
                department: 'marketing',
                grossSalary: 18000,
                sgkPremium: 2700,
                taxDeduction: 1800,
                netSalary: 13500,
                status: 'paid',
                payDate: '2024-10-01'
            },
            {
                id: 3,
                employeeId: 3,
                employeeName: 'Mehmet Kaya',
                department: 'development',
                grossSalary: 22000,
                sgkPremium: 3300,
                taxDeduction: 2200,
                netSalary: 16500,
                status: 'paid',
                payDate: '2024-10-01'
            },
            {
                id: 4,
                employeeId: 4,
                employeeName: 'Zeynep Özkan',
                department: 'hr',
                grossSalary: 20000,
                sgkPremium: 3000,
                taxDeduction: 2000,
                netSalary: 15000,
                status: 'paid',
                payDate: '2024-10-01'
            },
            {
                id: 5,
                employeeId: 5,
                employeeName: 'Ali Çelik',
                department: 'finance',
                grossSalary: 19000,
                sgkPremium: 2850,
                taxDeduction: 1900,
                netSalary: 14250,
                status: 'paid',
                payDate: '2024-10-01'
            }
        ];
    }

    loadHRReports() {
        return {
            employeeReport: {
                totalEmployees: 156,
                newHires: 8,
                departures: 3,
                turnoverRate: 1.9
            },
            performanceReport: {
                averagePerformance: 87.3,
                topPerformers: 23,
                underPerformers: 8
            },
            payrollReport: {
                totalPayroll: 2450000,
                averageSalary: 15705,
                salaryIncrease: 5.2
            },
            attendanceReport: {
                averageAttendance: 96.8,
                sickDays: 12,
                vacationDays: 45
            }
        };
    }

    saveEmployees() {
        localStorage.setItem('hrEmployees', JSON.stringify(this.employees));
    }

    savePayrollData() {
        localStorage.setItem('hrPayroll', JSON.stringify(this.payrollData));
    }

    // Render Functions
    renderEmployees() {
        const tbody = document.getElementById('employeesTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.employees.map(employee => `
            <tr>
                <td>
                    <div class="employee-avatar">
                        <img src="${employee.avatar}" alt="${employee.firstName} ${employee.lastName}" onerror="this.src='https://via.placeholder.com/40x40/6B7280/FFFFFF?text='+this.alt.charAt(0)">
                    </div>
                </td>
                <td>
                    <div class="employee-info">
                        <div class="employee-name">${employee.firstName} ${employee.lastName}</div>
                        <div class="employee-email">${employee.email}</div>
                    </div>
                </td>
                <td>
                    <span class="department-badge ${employee.department}">
                        ${this.getDepartmentName(employee.department)}
                    </span>
                </td>
                <td>
                    <span class="position-badge ${employee.position}">
                        ${this.getPositionName(employee.position)}
                    </span>
                </td>
                <td class="salary">₺${this.formatNumber(employee.salary)}</td>
                <td>
                    <div class="performance-bar">
                        <div class="performance-fill" style="width: ${employee.performance}%"></div>
                        <span class="performance-text">${employee.performance}%</span>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${employee.status}">
                        ${this.getStatusName(employee.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="hrManager.viewEmployee(${employee.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="hrManager.editEmployee(${employee.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="hrManager.viewPerformance(${employee.id})">
                            <i class="fas fa-chart-line"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderPayroll() {
        const tbody = document.getElementById('payrollTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.payrollData.map(payroll => `
            <tr>
                <td>
                    <div class="employee-info">
                        <div class="employee-name">${payroll.employeeName}</div>
                    </div>
                </td>
                <td>
                    <span class="department-badge ${payroll.department}">
                        ${this.getDepartmentName(payroll.department)}
                    </span>
                </td>
                <td class="salary">₺${this.formatNumber(payroll.grossSalary)}</td>
                <td class="salary">₺${this.formatNumber(payroll.sgkPremium)}</td>
                <td class="salary">₺${this.formatNumber(payroll.taxDeduction)}</td>
                <td class="salary">₺${this.formatNumber(payroll.netSalary)}</td>
                <td>
                    <span class="status-badge ${payroll.status}">
                        ${this.getStatusName(payroll.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="hrManager.viewPayroll(${payroll.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="hrManager.downloadPayslip(${payroll.id})">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadDashboardData() {
        this.updateRecentActivities();
        this.updateHRAlerts();
        this.updateDepartmentChart();
        this.updatePerformanceTrendChart();
    }

    updateRecentActivities() {
        const container = document.getElementById('recentActivitiesList');
        if (!container) return;

        const activities = [
            {
                id: 1,
                type: 'hire',
                message: 'Fatma Şahin işe başladı',
                employee: 'Fatma Şahin',
                department: 'Geliştirme',
                time: '2 saat önce'
            },
            {
                id: 2,
                type: 'performance',
                message: 'Mehmet Kaya performans değerlendirmesi tamamlandı',
                employee: 'Mehmet Kaya',
                department: 'Geliştirme',
                time: '4 saat önce'
            },
            {
                id: 3,
                type: 'payroll',
                message: 'Ekim ayı bordroları ödendi',
                employee: 'Sistem',
                department: 'Finans',
                time: '1 gün önce'
            },
            {
                id: 4,
                type: 'leave',
                message: 'Ayşe Demir izin aldı',
                employee: 'Ayşe Demir',
                department: 'Pazarlama',
                time: '2 gün önce'
            }
        ];

        container.innerHTML = activities.map(activity => `
            <div class="activity-item ${activity.type}">
                <div class="activity-icon">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-message">${activity.message}</div>
                    <div class="activity-details">
                        <span class="activity-employee">${activity.employee}</span>
                        <span class="activity-department">${activity.department}</span>
                        <span class="activity-time">${activity.time}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateHRAlerts() {
        const container = document.getElementById('hrAlertsList');
        if (!container) return;

        const alerts = [
            {
                id: 1,
                type: 'warning',
                message: 'Fatma Şahin\'in deneme süresi yakında bitiyor',
                employee: 'Fatma Şahin',
                time: '3 gün'
            },
            {
                id: 2,
                type: 'info',
                message: 'Yıllık performans değerlendirmeleri başladı',
                employee: 'Sistem',
                time: '1 hafta'
            },
            {
                id: 3,
                type: 'success',
                message: 'Tüm bordrolar başarıyla ödendi',
                employee: 'Sistem',
                time: 'Tamamlandı'
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
                        <span class="alert-employee">${alert.employee}</span>
                        <span class="alert-time">${alert.time}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateHROverview() {
        const totalEmployees = this.employees.length;
        const activeEmployees = this.employees.filter(e => e.status === 'active').length;
        const avgPerformance = this.employees.reduce((sum, e) => sum + e.performance, 0) / this.employees.length;
        const monthlyPayroll = this.employees.reduce((sum, e) => sum + e.salary, 0);

        document.getElementById('totalEmployees').textContent = totalEmployees;
        document.getElementById('activeEmployees').textContent = activeEmployees;
        document.getElementById('avgPerformance').textContent = avgPerformance.toFixed(1) + '%';
        document.getElementById('monthlyPayroll').textContent = '₺' + this.formatNumber(monthlyPayroll);
    }

    // Chart Functions
    updateDepartmentChart() {
        const ctx = document.getElementById('departmentChart');
        if (!ctx || typeof Chart === 'undefined') return;

        if (this.departmentChart) {
            this.departmentChart.destroy();
        }

        const departments = ['Geliştirme', 'Satış', 'Pazarlama', 'İnsan Kaynakları', 'Finans', 'Operasyon'];
        const counts = departments.map(dept => {
            return this.employees.filter(e => this.getDepartmentName(e.department) === dept).length;
        });

        this.departmentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: departments,
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(236, 72, 153, 0.8)'
                    ],
                    borderColor: [
                        'rgba(99, 102, 241, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(251, 191, 36, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(168, 85, 247, 1)',
                        'rgba(236, 72, 153, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updatePerformanceTrendChart(period = 'monthly') {
        const ctx = document.getElementById('performanceTrendChart');
        if (!ctx || typeof Chart === 'undefined') return;

        if (this.performanceTrendChart) {
            this.performanceTrendChart.destroy();
        }

        const periods = {
            weekly: ['Hafta 1', 'Hafta 2', 'Hafta 3', 'Hafta 4'],
            monthly: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran']
        };

        const labels = periods[period] || periods.monthly;
        const avgPerformance = labels.map(() => 75 + Math.random() * 20);

        this.performanceTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ortalama Performans',
                    data: avgPerformance,
                    borderColor: 'rgba(99, 102, 241, 1)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
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
                        min: 60,
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

    loadPerformanceData() {
        this.updatePerformanceMetrics();
        this.updatePerformanceItems();
    }

    updatePerformanceMetrics() {
        const data = this.loadPerformanceData();
        
        document.getElementById('overallPerformance').textContent = data.overallPerformance + '%';
        document.getElementById('highPerformers').textContent = data.highPerformers;
        document.getElementById('needsImprovement').textContent = data.needsImprovement;
        document.getElementById('goalAchievement').textContent = data.goalAchievement + '%';
    }

    updatePerformanceItems() {
        const container = document.getElementById('performanceItems');
        if (!container) return;

        const topPerformers = this.employees
            .sort((a, b) => b.performance - a.performance)
            .slice(0, 5);

        container.innerHTML = topPerformers.map(employee => `
            <div class="performance-item">
                <div class="performance-employee">
                    <div class="employee-avatar">
                        <img src="${employee.avatar}" alt="${employee.firstName} ${employee.lastName}" onerror="this.src='https://via.placeholder.com/32x32/6B7280/FFFFFF?text='+this.alt.charAt(0)">
                    </div>
                    <div class="employee-details">
                        <div class="employee-name">${employee.firstName} ${employee.lastName}</div>
                        <div class="employee-department">${this.getDepartmentName(employee.department)}</div>
                    </div>
                </div>
                <div class="performance-score">${employee.performance}%</div>
                <div class="performance-bar">
                    <div class="performance-fill" style="width: ${employee.performance}%"></div>
                </div>
            </div>
        `).join('');
    }

    loadReportsData() {
        console.log('Reports data loaded');
    }

    // Modal Functions
    showAddEmployeeModal() {
        document.getElementById('addEmployeeModal').style.display = 'block';
    }

    showPayrollModal() {
        document.getElementById('payrollModal').style.display = 'block';
    }

    // Form Handlers
    handleAddEmployee(e) {
        e.preventDefault();
        
        const newEmployee = {
            id: Date.now(),
            firstName: document.getElementById('employeeFirstName').value,
            lastName: document.getElementById('employeeLastName').value,
            email: document.getElementById('employeeEmail').value,
            phone: document.getElementById('employeePhone').value,
            department: document.getElementById('employeeDepartment').value,
            position: document.getElementById('employeePosition').value,
            salary: parseInt(document.getElementById('employeeSalary').value),
            startDate: document.getElementById('employeeStartDate').value,
            address: document.getElementById('employeeAddress').value,
            notes: document.getElementById('employeeNotes').value,
            status: 'active',
            performance: Math.floor(Math.random() * 20) + 80, // Mock performance
            avatar: `https://via.placeholder.com/40x40/${this.getRandomColor()}/FFFFFF?text=${document.getElementById('employeeFirstName').value.charAt(0)}${document.getElementById('employeeLastName').value.charAt(0)}`
        };

        this.employees.push(newEmployee);
        this.saveEmployees();
        this.renderEmployees();
        this.updateHROverview();
        
        closeModal('addEmployeeModal');
        showAlert('Çalışan başarıyla eklendi!', 'success');
        e.target.reset();
    }

    handlePayrollSubmit(e) {
        e.preventDefault();
        
        const payrollPeriod = document.getElementById('payrollPeriod').value;
        const startDate = document.getElementById('payrollStartDate').value;
        const endDate = document.getElementById('payrollEndDate').value;
        const paymentDate = document.getElementById('paymentDate').value;
        
        showAlert('Bordro oluşturma işlemi başlatıldı!', 'info');
        closeModal('payrollModal');
        e.target.reset();
    }

    // Employee Actions
    viewEmployee(employeeId) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) return;

        const details = `
            Ad Soyad: ${employee.firstName} ${employee.lastName}
            E-posta: ${employee.email}
            Telefon: ${employee.phone}
            Departman: ${this.getDepartmentName(employee.department)}
            Pozisyon: ${this.getPositionName(employee.position)}
            Maaş: ₺${this.formatNumber(employee.salary)}
            İşe Başlama: ${employee.startDate}
            Performans: %${employee.performance}
            Durum: ${this.getStatusName(employee.status)}
            Adres: ${employee.address}
            Notlar: ${employee.notes}
        `;
        
        alert(details);
    }

    editEmployee(employeeId) {
        showAlert('Çalışan düzenleme özelliği yakında eklenecek!', 'info');
    }

    viewPerformance(employeeId) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) return;

        showAlert(`${employee.firstName} ${employee.lastName} performans detayları yakında eklenecek!`, 'info');
    }

    // Payroll Actions
    viewPayroll(payrollId) {
        const payroll = this.payrollData.find(p => p.id === payrollId);
        if (!payroll) return;

        const details = `
            Çalışan: ${payroll.employeeName}
            Departman: ${this.getDepartmentName(payroll.department)}
            Brüt Maaş: ₺${this.formatNumber(payroll.grossSalary)}
            SGK Primi: ₺${this.formatNumber(payroll.sgkPremium)}
            Vergi Kesintisi: ₺${this.formatNumber(payroll.taxDeduction)}
            Net Maaş: ₺${this.formatNumber(payroll.netSalary)}
            Durum: ${this.getStatusName(payroll.status)}
            Ödeme Tarihi: ${payroll.payDate}
        `;
        
        alert(details);
    }

    downloadPayslip(payrollId) {
        showAlert('Maaş bordrosu indirme özelliği yakında eklenecek!', 'info');
    }

    // Filter Functions
    filterEmployees(searchTerm) {
        const filtered = this.employees.filter(employee => 
            `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            this.getDepartmentName(employee.department).toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredEmployees(filtered);
    }

    filterEmployeesByStatus(status) {
        if (!status) {
            this.renderEmployees();
            return;
        }

        const filtered = this.employees.filter(employee => employee.status === status);
        this.renderFilteredEmployees(filtered);
    }

    filterEmployeesByDepartment(department) {
        if (!department) {
            this.renderEmployees();
            return;
        }

        const filtered = this.employees.filter(employee => employee.department === department);
        this.renderFilteredEmployees(filtered);
    }

    filterEmployeesByPosition(position) {
        if (!position) {
            this.renderEmployees();
            return;
        }

        const filtered = this.employees.filter(employee => employee.position === position);
        this.renderFilteredEmployees(filtered);
    }

    renderFilteredEmployees(employees) {
        const tbody = document.getElementById('employeesTableBody');
        if (!tbody) return;

        tbody.innerHTML = employees.map(employee => `
            <tr>
                <td>
                    <div class="employee-avatar">
                        <img src="${employee.avatar}" alt="${employee.firstName} ${employee.lastName}" onerror="this.src='https://via.placeholder.com/40x40/6B7280/FFFFFF?text='+this.alt.charAt(0)">
                    </div>
                </td>
                <td>
                    <div class="employee-info">
                        <div class="employee-name">${employee.firstName} ${employee.lastName}</div>
                        <div class="employee-email">${employee.email}</div>
                    </div>
                </td>
                <td>
                    <span class="department-badge ${employee.department}">
                        ${this.getDepartmentName(employee.department)}
                    </span>
                </td>
                <td>
                    <span class="position-badge ${employee.position}">
                        ${this.getPositionName(employee.position)}
                    </span>
                </td>
                <td class="salary">₺${this.formatNumber(employee.salary)}</td>
                <td>
                    <div class="performance-bar">
                        <div class="performance-fill" style="width: ${employee.performance}%"></div>
                        <span class="performance-text">${employee.performance}%</span>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${employee.status}">
                        ${this.getStatusName(employee.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="hrManager.viewEmployee(${employee.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="hrManager.editEmployee(${employee.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="hrManager.viewPerformance(${employee.id})">
                            <i class="fas fa-chart-line"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Export Functions
    exportHRData() {
        const data = {
            employees: this.employees,
            performanceData: this.loadPerformanceData(),
            payrollData: this.payrollData,
            hrReports: this.loadHRReports(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hr-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showAlert('İK verileri başarıyla dışa aktarıldı!', 'success');
    }

    generatePerformanceReport() {
        showAlert('Performans raporu oluşturuluyor...', 'info');
    }

    generateHRReport() {
        showAlert('İK raporu oluşturuluyor...', 'info');
    }

    downloadReport(reportType) {
        showAlert(`${reportType} raporu indirme özelliği yakında eklenecek!`, 'info');
    }

    processPayroll() {
        showAlert('Bordro hesaplama işlemi başlatıldı!', 'info');
    }

    // Utility Functions
    formatNumber(num) {
        return new Intl.NumberFormat('tr-TR').format(num);
    }

    getDepartmentName(department) {
        const departments = {
            'sales': 'Satış',
            'marketing': 'Pazarlama',
            'development': 'Geliştirme',
            'hr': 'İnsan Kaynakları',
            'finance': 'Finans',
            'operations': 'Operasyon'
        };
        return departments[department] || department;
    }

    getPositionName(position) {
        const positions = {
            'manager': 'Müdür',
            'senior': 'Kıdemli',
            'junior': 'Genç',
            'intern': 'Stajyer'
        };
        return positions[position] || position;
    }

    getStatusName(status) {
        const statuses = {
            'active': 'Aktif',
            'inactive': 'Pasif',
            'on-leave': 'İzinli',
            'probation': 'Deneme Süresi',
            'paid': 'Ödendi',
            'pending': 'Beklemede'
        };
        return statuses[status] || status;
    }

    getActivityIcon(type) {
        const icons = {
            'hire': 'user-plus',
            'performance': 'chart-line',
            'payroll': 'money-check-alt',
            'leave': 'calendar-times'
        };
        return icons[type] || 'info-circle';
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

    getRandomColor() {
        const colors = ['4F46E5', '059669', 'DC2626', '7C3AED', 'EA580C', '0891B2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// Global Functions
function showTab(tabName) {
    hrManager.showTab(tabName);
}

function showAddEmployeeModal() {
    hrManager.showAddEmployeeModal();
}

function showPayrollModal() {
    hrManager.showPayrollModal();
}

function exportHRData() {
    hrManager.exportHRData();
}

function generatePerformanceReport() {
    hrManager.generatePerformanceReport();
}

function generateHRReport() {
    hrManager.generateHRReport();
}

function downloadReport(reportType) {
    hrManager.downloadReport(reportType);
}

function processPayroll() {
    hrManager.processPayroll();
}

// Initialize HR Manager
let hrManager;
document.addEventListener('DOMContentLoaded', function() {
    hrManager = new HumanResourcesManager();
});

console.log('✅ Human Resources Management System Loaded');
