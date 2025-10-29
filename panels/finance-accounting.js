// Finance & Accounting JavaScript
class FinanceManager {
    constructor() {
        this.transactions = this.loadTransactions();
        this.budgets = this.loadBudgets();
        this.accounts = this.loadAccounts();
        this.journalEntries = this.loadJournalEntries();
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTransactions();
        this.renderBudgets();
        this.renderAccounts();
        this.renderJournalEntries();
        this.updateFinancialOverview();
        this.loadDashboardData();
        this.setupModalCloseListeners();
    }

    setupModalCloseListeners() {
        // Close modals when clicking outside
        const modals = ['addTransactionModal', 'budgetModal', 'journalEntryModal'];
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
        document.getElementById('transactionSearch')?.addEventListener('input', (e) => {
            this.filterTransactions(e.target.value);
        });

        document.getElementById('transactionFilter')?.addEventListener('change', (e) => {
            this.filterTransactionsByType(e.target.value);
        });

        document.getElementById('transactionPeriod')?.addEventListener('change', (e) => {
            this.filterTransactionsByPeriod(e.target.value);
        });

        // Form submissions
        document.getElementById('addTransactionForm')?.addEventListener('submit', (e) => {
            this.handleAddTransaction(e);
        });

        document.getElementById('budgetForm')?.addEventListener('submit', (e) => {
            this.handleBudgetSubmit(e);
        });

        document.getElementById('journalEntryForm')?.addEventListener('submit', (e) => {
            this.handleJournalEntry(e);
        });

        // Chart period changes
        document.getElementById('chartPeriod')?.addEventListener('change', (e) => {
            this.updateIncomeExpenseChart(e.target.value);
        });

        document.getElementById('cashFlowPeriod')?.addEventListener('change', (e) => {
            this.updateCashFlowChart(e.target.value);
        });

        // Set default dates
        const today = new Date();
        document.getElementById('transactionDate').value = today.toISOString().split('T')[0];
        document.getElementById('journalDate').value = today.toISOString().split('T')[0];
        
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        document.getElementById('reportStartDate').value = startOfYear.toISOString().split('T')[0];
        document.getElementById('reportEndDate').value = today.toISOString().split('T')[0];
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
        } else if (tabName === 'reports') {
            this.loadReportsData();
        }
    }

    // Data Loading
    loadTransactions() {
        const saved = localStorage.getItem('financialTransactions');
        if (saved) {
            return JSON.parse(saved);
        }

        // Default transactions
        return [
            {
                id: 1,
                date: '2024-10-29',
                description: 'Satış Geliri - E-ticaret',
                category: 'sales',
                amount: 150000,
                type: 'income',
                status: 'completed',
                notes: 'Aylık satış geliri'
            },
            {
                id: 2,
                date: '2024-10-28',
                description: 'Pazarlama Harcaması',
                category: 'marketing',
                amount: 25000,
                type: 'expense',
                status: 'completed',
                notes: 'Google Ads kampanyası'
            },
            {
                id: 3,
                date: '2024-10-27',
                description: 'Maaş Ödemeleri',
                category: 'hr',
                amount: 180000,
                type: 'expense',
                status: 'completed',
                notes: 'Aylık maaş ödemeleri'
            },
            {
                id: 4,
                date: '2024-10-26',
                description: 'Teknoloji Lisansları',
                category: 'technology',
                amount: 15000,
                type: 'expense',
                status: 'completed',
                notes: 'Yazılım lisansları'
            },
            {
                id: 5,
                date: '2024-10-25',
                description: 'Canlı Yayın Geliri',
                category: 'sales',
                amount: 75000,
                type: 'income',
                status: 'completed',
                notes: 'Canlı yayın satışları'
            }
        ];
    }

    loadBudgets() {
        const saved = localStorage.getItem('financialBudgets');
        if (saved) {
            return JSON.parse(saved);
        }

        return [
            {
                id: 1,
                name: '2024 Yıllık Bütçe',
                period: 'yearly',
                amount: 15000000,
                used: 12500000,
                category: 'general',
                description: 'Genel operasyon bütçesi',
                createdAt: '2024-01-01'
            },
            {
                id: 2,
                name: 'Pazarlama Bütçesi',
                period: 'monthly',
                amount: 300000,
                used: 250000,
                category: 'marketing',
                description: 'Aylık pazarlama bütçesi',
                createdAt: '2024-10-01'
            },
            {
                id: 3,
                name: 'Teknoloji Bütçesi',
                period: 'quarterly',
                amount: 500000,
                used: 350000,
                category: 'technology',
                description: 'Çeyreklik teknoloji bütçesi',
                createdAt: '2024-10-01'
            }
        ];
    }

    loadAccounts() {
        const saved = localStorage.getItem('chartOfAccounts');
        if (saved) {
            return JSON.parse(saved);
        }

        return [
            { code: '100', name: 'Kasa', type: 'asset', balance: 500000 },
            { code: '101', name: 'Banka', type: 'asset', balance: 2500000 },
            { code: '120', name: 'Alıcılar', type: 'asset', balance: 750000 },
            { code: '320', name: 'Satışlar', type: 'revenue', balance: 2450000 },
            { code: '600', name: 'Satılan Malın Maliyeti', type: 'expense', balance: 1200000 },
            { code: '700', name: 'Pazarlama Giderleri', type: 'expense', balance: 300000 },
            { code: '800', name: 'Genel Yönetim Giderleri', type: 'expense', balance: 400000 }
        ];
    }

    loadJournalEntries() {
        const saved = localStorage.getItem('journalEntries');
        if (saved) {
            return JSON.parse(saved);
        }

        return [
            {
                id: 1,
                date: '2024-10-29',
                description: 'Satış Geliri',
                entries: [
                    { account: '101', debit: 150000, credit: 0 },
                    { account: '320', debit: 0, credit: 150000 }
                ]
            },
            {
                id: 2,
                date: '2024-10-28',
                description: 'Pazarlama Harcaması',
                entries: [
                    { account: '700', debit: 25000, credit: 0 },
                    { account: '101', debit: 0, credit: 25000 }
                ]
            }
        ];
    }

    saveTransactions() {
        localStorage.setItem('financialTransactions', JSON.stringify(this.transactions));
    }

    saveBudgets() {
        localStorage.setItem('financialBudgets', JSON.stringify(this.budgets));
    }

    saveAccounts() {
        localStorage.setItem('chartOfAccounts', JSON.stringify(this.accounts));
    }

    saveJournalEntries() {
        localStorage.setItem('journalEntries', JSON.stringify(this.journalEntries));
    }

    // Render Functions
    renderTransactions() {
        const tbody = document.getElementById('transactionsTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.transactions.map(transaction => `
            <tr>
                <td>${this.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td>
                    <span class="category-badge ${transaction.category}">
                        ${this.getCategoryName(transaction.category)}
                    </span>
                </td>
                <td class="amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}₺${this.formatNumber(transaction.amount)}
                </td>
                <td>
                    <span class="type-badge ${transaction.type}">
                        ${this.getTypeName(transaction.type)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${transaction.status}">
                        ${this.getStatusName(transaction.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="financeManager.editTransaction(${transaction.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="financeManager.viewTransaction(${transaction.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-danger btn-xs" onclick="financeManager.deleteTransaction(${transaction.id})">
                            <i class="fas fa-trash"></i>
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
                    <h3>${budget.name}</h3>
                    <span class="budget-period">${this.getPeriodName(budget.period)}</span>
                </div>
                <div class="budget-content">
                    <div class="budget-amounts">
                        <div class="budget-item">
                            <span class="label">Toplam:</span>
                            <span class="amount">₺${this.formatNumber(budget.amount)}</span>
                        </div>
                        <div class="budget-item">
                            <span class="label">Kullanılan:</span>
                            <span class="amount used">₺${this.formatNumber(budget.used)}</span>
                        </div>
                        <div class="budget-item">
                            <span class="label">Kalan:</span>
                            <span class="amount remaining">₺${this.formatNumber(budget.amount - budget.used)}</span>
                        </div>
                    </div>
                    <div class="budget-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(budget.used / budget.amount) * 100}%"></div>
                        </div>
                        <span class="progress-text">%${Math.round((budget.used / budget.amount) * 100)} kullanıldı</span>
                    </div>
                    <p class="budget-description">${budget.description}</p>
                </div>
                <div class="budget-actions">
                    <button class="btn btn-outline btn-sm" onclick="financeManager.editBudget(${budget.id})">
                        <i class="fas fa-edit"></i>
                        Düzenle
                    </button>
                </div>
            </div>
        `).join('');

        this.updateBudgetSummary();
    }

    renderAccounts() {
        const tbody = document.getElementById('ledgerTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.accounts.map(account => `
            <tr>
                <td>${account.code}</td>
                <td>${account.name}</td>
                <td>${account.type === 'asset' || account.type === 'expense' ? '₺' + this.formatNumber(account.balance) : '-'}</td>
                <td>${account.type === 'revenue' || account.type === 'liability' ? '₺' + this.formatNumber(account.balance) : '-'}</td>
                <td class="balance ${account.balance >= 0 ? 'positive' : 'negative'}">
                    ₺${this.formatNumber(Math.abs(account.balance))}
                </td>
            </tr>
        `).join('');
    }

    renderJournalEntries() {
        const tbody = document.getElementById('journalTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.journalEntries.map(entry => `
            <tr>
                <td>${this.formatDate(entry.date)}</td>
                <td>${entry.description}</td>
                <td>₺${this.formatNumber(entry.entries.reduce((sum, e) => sum + e.debit, 0))}</td>
                <td>₺${this.formatNumber(entry.entries.reduce((sum, e) => sum + e.credit, 0))}</td>
            </tr>
        `).join('');
    }

    loadDashboardData() {
        this.updateRevenueSources();
        this.updateExpenseCategories();
        this.updateIncomeExpenseChart();
        this.updateCashFlowChart();
    }

    updateRevenueSources() {
        const revenueList = document.getElementById('revenueList');
        if (!revenueList) return;

        const revenueData = [
            { name: 'E-ticaret Satışları', amount: 1200000, percentage: 49 },
            { name: 'Canlı Yayın Geliri', amount: 750000, percentage: 31 },
            { name: 'Abonelik Gelirleri', amount: 500000, percentage: 20 }
        ];

        revenueList.innerHTML = revenueData.map(item => `
            <div class="revenue-item">
                <div class="revenue-info">
                    <span class="revenue-name">${item.name}</span>
                    <span class="revenue-percentage">%${item.percentage}</span>
                </div>
                <div class="revenue-amount">₺${this.formatNumber(item.amount)}</div>
                <div class="revenue-bar">
                    <div class="revenue-fill" style="width: ${item.percentage}%"></div>
                </div>
            </div>
        `).join('');
    }

    updateExpenseCategories() {
        const expenseList = document.getElementById('expenseList');
        if (!expenseList) return;

        const expenseData = [
            { name: 'Maaşlar', amount: 1800000, percentage: 45 },
            { name: 'Operasyon', amount: 600000, percentage: 15 },
            { name: 'Pazarlama', amount: 500000, percentage: 12 },
            { name: 'Teknoloji', amount: 400000, percentage: 10 },
            { name: 'Diğer', amount: 700000, percentage: 18 }
        ];

        expenseList.innerHTML = expenseData.map(item => `
            <div class="expense-item">
                <div class="expense-info">
                    <span class="expense-name">${item.name}</span>
                    <span class="expense-percentage">%${item.percentage}</span>
                </div>
                <div class="expense-amount">₺${this.formatNumber(item.amount)}</div>
                <div class="expense-bar">
                    <div class="expense-fill" style="width: ${item.percentage}%"></div>
                </div>
            </div>
        `).join('');
    }

    updateFinancialOverview() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpense = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netProfit = totalIncome - totalExpense;
        const cashFlow = totalIncome * 1.3; // Mock calculation

        document.getElementById('totalIncome').textContent = '₺' + this.formatNumber(totalIncome);
        document.getElementById('totalExpense').textContent = '₺' + this.formatNumber(totalExpense);
        document.getElementById('netProfit').textContent = '₺' + this.formatNumber(netProfit);
        document.getElementById('cashFlow').textContent = '₺' + this.formatNumber(cashFlow);
    }

    updateBudgetSummary() {
        const totalBudget = this.budgets.reduce((sum, b) => sum + b.amount, 0);
        const usedBudget = this.budgets.reduce((sum, b) => sum + b.used, 0);
        const remainingBudget = totalBudget - usedBudget;
        const usagePercentage = (usedBudget / totalBudget) * 100;

        document.getElementById('totalBudget').textContent = '₺' + this.formatNumber(totalBudget);
        document.getElementById('usedBudget').textContent = '₺' + this.formatNumber(usedBudget);
        document.getElementById('remainingBudget').textContent = '₺' + this.formatNumber(remainingBudget);
        document.getElementById('budgetUsage').textContent = usagePercentage.toFixed(1) + '%';
    }

    // Chart Functions
    updateIncomeExpenseChart(period = 'monthly') {
        const ctx = document.getElementById('incomeExpenseChart');
        if (!ctx || typeof Chart === 'undefined') return;

        // Destroy existing chart if it exists
        if (this.incomeExpenseChart) {
            this.incomeExpenseChart.destroy();
        }

        const periods = {
            monthly: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
            quarterly: ['Q1', 'Q2', 'Q3', 'Q4'],
            yearly: ['2022', '2023', '2024']
        };

        const labels = periods[period] || periods.monthly;
        const incomeData = labels.map(() => 1000000 + Math.random() * 500000);
        const expenseData = labels.map(() => 600000 + Math.random() * 300000);

        this.incomeExpenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Gelir',
                        data: incomeData,
                        backgroundColor: 'rgba(34, 197, 94, 0.8)',
                        borderColor: 'rgba(34, 197, 94, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Gider',
                        data: expenseData,
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 1
                    }
                ]
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
                                return context.dataset.label + ': ₺' + context.parsed.y.toLocaleString('tr-TR');
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₺' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    }
                }
            }
        });
    }

    updateCashFlowChart(period = '6months') {
        const ctx = document.getElementById('cashFlowChart');
        if (!ctx || typeof Chart === 'undefined') return;

        // Destroy existing chart if it exists
        if (this.cashFlowChart) {
            this.cashFlowChart.destroy();
        }

        const periods = {
            '6months': 6,
            '12months': 12,
            '2years': 24
        };

        const monthCount = periods[period] || 6;
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        const labels = months.slice(0, monthCount);
        const cashFlowData = labels.map(() => 2500000 + (Math.random() * 1000000 - 500000));

        this.cashFlowChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Nakit Akışı',
                    data: cashFlowData,
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
                                return 'Nakit Akışı: ₺' + context.parsed.y.toLocaleString('tr-TR');
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '₺' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    }
                }
            }
        });
    }

    loadReportsData() {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }

        this.updateIncomeExpenseReportChart();
        this.updateProfitabilityReportChart();
        this.updateCashFlowReportChart();
        this.updateBudgetPerformanceReportChart();
    }

    updateIncomeExpenseReportChart() {
        const ctx = document.getElementById('incomeExpenseReportChart');
        if (!ctx) return;

        if (this.incomeExpenseReportChart) {
            this.incomeExpenseReportChart.destroy();
        }

        const income = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        this.incomeExpenseReportChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Gelir', 'Gider'],
                datasets: [{
                    data: [income, expense],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(239, 68, 68, 1)'
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
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ₺' + context.parsed.toLocaleString('tr-TR');
                            }
                        }
                    }
                }
            }
        });
    }

    updateProfitabilityReportChart() {
        const ctx = document.getElementById('profitabilityReportChart');
        if (!ctx) return;

        if (this.profitabilityReportChart) {
            this.profitabilityReportChart.destroy();
        }

        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
        const profitData = months.map(() => {
            const income = 1000000 + Math.random() * 500000;
            const expense = 600000 + Math.random() * 300000;
            return income - expense;
        });

        this.profitabilityReportChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Net Kar',
                    data: profitData,
                    backgroundColor: profitData.map(p => p >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
                    borderColor: profitData.map(p => p >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Net Kar: ₺' + context.parsed.y.toLocaleString('tr-TR');
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '₺' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    }
                }
            }
        });
    }

    updateCashFlowReportChart() {
        const ctx = document.getElementById('cashFlowReportChart');
        if (!ctx) return;

        if (this.cashFlowReportChart) {
            this.cashFlowReportChart.destroy();
        }

        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
        const cashFlowData = months.map(() => 2000000 + Math.random() * 1000000);

        this.cashFlowReportChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Nakit Akışı',
                    data: cashFlowData,
                    borderColor: 'rgba(99, 102, 241, 1)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
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
                        ticks: {
                            callback: function(value) {
                                return '₺' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    }
                }
            }
        });
    }

    updateBudgetPerformanceReportChart() {
        const ctx = document.getElementById('budgetPerformanceReportChart');
        if (!ctx) return;

        if (this.budgetPerformanceReportChart) {
            this.budgetPerformanceReportChart.destroy();
        }

        const labels = this.budgets.map(b => b.name);
        const usageData = this.budgets.map(b => (b.used / b.amount) * 100);

        this.budgetPerformanceReportChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Bütçe Kullanımı (%)',
                    data: usageData,
                    backgroundColor: usageData.map(u => 
                        u >= 90 ? 'rgba(239, 68, 68, 0.8)' :
                        u >= 70 ? 'rgba(251, 191, 36, 0.8)' :
                        'rgba(34, 197, 94, 0.8)'
                    ),
                    borderColor: usageData.map(u => 
                        u >= 90 ? 'rgba(239, 68, 68, 1)' :
                        u >= 70 ? 'rgba(251, 191, 36, 1)' :
                        'rgba(34, 197, 94, 1)'
                    ),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
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

    // Modal Functions
    showAddTransactionModal() {
        const modal = document.getElementById('addTransactionModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    showBudgetModal() {
        const modal = document.getElementById('budgetModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    showJournalEntryModal() {
        const modal = document.getElementById('journalEntryModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    showAccountModal() {
        showAlert('Hesap planı özelliği yakında eklenecek!', 'info');
    }

    // Form Handlers
    handleAddTransaction(e) {
        e.preventDefault();
        
        const newTransaction = {
            id: Date.now(),
            date: document.getElementById('transactionDate').value,
            description: document.getElementById('transactionDescription').value,
            category: document.getElementById('transactionCategory').value,
            amount: parseFloat(document.getElementById('transactionAmount').value),
            type: document.getElementById('transactionType').value,
            status: 'completed',
            notes: document.getElementById('transactionNotes').value
        };

        this.transactions.push(newTransaction);
        this.saveTransactions();
        this.renderTransactions();
        this.updateFinancialOverview();
        
        closeModal('addTransactionModal');
        showAlert('İşlem başarıyla eklendi!', 'success');
        e.target.reset();
    }

    handleBudgetSubmit(e) {
        e.preventDefault();
        
        const newBudget = {
            id: Date.now(),
            name: document.getElementById('budgetName').value,
            period: document.getElementById('budgetPeriod').value,
            amount: parseInt(document.getElementById('budgetAmount').value),
            used: 0,
            category: document.getElementById('budgetCategory').value,
            description: document.getElementById('budgetDescription').value,
            createdAt: new Date().toISOString()
        };

        this.budgets.push(newBudget);
        this.saveBudgets();
        this.renderBudgets();
        
        closeModal('budgetModal');
        showAlert('Bütçe başarıyla oluşturuldu!', 'success');
        e.target.reset();
    }

    handleJournalEntry(e) {
        e.preventDefault();
        
        const entries = Array.from(document.querySelectorAll('.journal-entry')).map(entry => ({
            account: entry.querySelector('.journal-account').value,
            debit: parseFloat(entry.querySelector('.journal-debit').value) || 0,
            credit: parseFloat(entry.querySelector('.journal-credit').value) || 0
        }));

        // Validate that at least one entry exists
        if (entries.length === 0) {
            showAlert('En az bir yevmiye satırı eklemelisiniz!', 'error');
            return;
        }

        // Validate that debit equals credit (double-entry bookkeeping)
        const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
        const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            showAlert('Borç ve alacak tutarları eşit olmalıdır! (Borç: ₺' + this.formatNumber(totalDebit) + ', Alacak: ₺' + this.formatNumber(totalCredit) + ')', 'error');
            return;
        }

        // Validate that each entry has account selected
        const invalidEntries = entries.filter(e => !e.account);
        if (invalidEntries.length > 0) {
            showAlert('Tüm satırlarda hesap seçilmelidir!', 'error');
            return;
        }

        const newEntry = {
            id: Date.now(),
            date: document.getElementById('journalDate').value,
            description: document.getElementById('journalDescription').value,
            entries: entries
        };

        this.journalEntries.push(newEntry);
        this.saveJournalEntries();
        this.renderJournalEntries();
        this.updateAccountsFromJournal(newEntry);
        
        closeModal('journalEntryModal');
        showAlert('Yevmiye kaydı başarıyla eklendi!', 'success');
        e.target.reset();
        
        // Reset journal entries container
        const entriesContainer = document.getElementById('journalEntries');
        entriesContainer.innerHTML = `
            <div class="journal-entry">
                <div class="form-row">
                    <div class="form-group">
                        <label>Hesap</label>
                        <select class="journal-account" required>
                            <option value="">Seçin</option>
                            <option value="100">100 - Kasa</option>
                            <option value="101">101 - Banka</option>
                            <option value="120">120 - Alıcılar</option>
                            <option value="320">320 - Satışlar</option>
                            <option value="600">600 - Satılan Malın Maliyeti</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Borç (₺)</label>
                        <input type="number" class="journal-debit" min="0" step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Alacak (₺)</label>
                        <input type="number" class="journal-credit" min="0" step="0.01">
                    </div>
                </div>
            </div>
        `;
    }

    updateAccountsFromJournal(journalEntry) {
        journalEntry.entries.forEach(entry => {
            const account = this.accounts.find(a => a.code === entry.account);
            if (account) {
                if (account.type === 'asset' || account.type === 'expense') {
                    account.balance += entry.debit - entry.credit;
                } else {
                    account.balance += entry.credit - entry.debit;
                }
            }
        });
        this.saveAccounts();
        this.renderAccounts();
    }

    // Transaction Actions
    editTransaction(transactionId) {
        showAlert('İşlem düzenleme özelliği yakında eklenecek!', 'info');
    }

    viewTransaction(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        const details = `
            Tarih: ${this.formatDate(transaction.date)}
            Açıklama: ${transaction.description}
            Kategori: ${this.getCategoryName(transaction.category)}
            Tutar: ₺${this.formatNumber(transaction.amount)}
            Tip: ${this.getTypeName(transaction.type)}
            Durum: ${this.getStatusName(transaction.status)}
            Notlar: ${transaction.notes || 'Yok'}
        `;
        
        alert(details);
    }

    deleteTransaction(transactionId) {
        if (confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
            this.transactions = this.transactions.filter(t => t.id !== transactionId);
            this.saveTransactions();
            this.renderTransactions();
            this.updateFinancialOverview();
            showAlert('İşlem başarıyla silindi!', 'success');
        }
    }

    // Budget Actions
    editBudget(budgetId) {
        showAlert('Bütçe düzenleme özelliği yakında eklenecek!', 'info');
    }

    // Filter Functions
    filterTransactions(searchTerm) {
        const filtered = this.transactions.filter(transaction => 
            transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredTransactions(filtered);
    }

    filterTransactionsByType(type) {
        if (!type) {
            this.renderTransactions();
            return;
        }

        const filtered = this.transactions.filter(transaction => transaction.type === type);
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
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
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
                <td>${this.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td>
                    <span class="category-badge ${transaction.category}">
                        ${this.getCategoryName(transaction.category)}
                    </span>
                </td>
                <td class="amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}₺${this.formatNumber(transaction.amount)}
                </td>
                <td>
                    <span class="type-badge ${transaction.type}">
                        ${this.getTypeName(transaction.type)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${transaction.status}">
                        ${this.getStatusName(transaction.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-xs" onclick="financeManager.editTransaction(${transaction.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline btn-xs" onclick="financeManager.viewTransaction(${transaction.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-danger btn-xs" onclick="financeManager.deleteTransaction(${transaction.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Export Functions
    exportFinancialData() {
        const data = {
            transactions: this.transactions,
            budgets: this.budgets,
            accounts: this.accounts,
            journalEntries: this.journalEntries,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showAlert('Finansal veriler başarıyla dışa aktarıldı!', 'success');
    }

    generateReport() {
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;
        
        if (!startDate || !endDate) {
            showAlert('Lütfen başlangıç ve bitiş tarihlerini seçin!', 'error');
            return;
        }

        showAlert('Rapor oluşturuluyor...', 'info');
        
        // Generate report data
        const reportData = {
            period: {
                start: startDate,
                end: endDate
            },
            financialOverview: {
                totalIncome: this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                totalExpense: this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
                netProfit: 0
            },
            transactions: this.transactions.filter(t => 
                new Date(t.date) >= new Date(startDate) && new Date(t.date) <= new Date(endDate)
            ),
            budgets: this.budgets,
            generatedAt: new Date().toISOString()
        };
        
        reportData.financialOverview.netProfit = reportData.financialOverview.totalIncome - reportData.financialOverview.totalExpense;

        // Create and download report
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${startDate}-${endDate}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showAlert('Rapor başarıyla oluşturuldu!', 'success');
    }

    downloadReport(reportType) {
        const reportData = {
            type: reportType,
            generatedAt: new Date().toISOString(),
            data: {}
        };

        switch (reportType) {
            case 'income-expense':
                reportData.data = {
                    income: this.transactions.filter(t => t.type === 'income'),
                    expense: this.transactions.filter(t => t.type === 'expense')
                };
                break;
            case 'profitability':
                const income = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                const expense = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                reportData.data = {
                    income,
                    expense,
                    profit: income - expense,
                    margin: ((income - expense) / income * 100).toFixed(2) + '%'
                };
                break;
            case 'cashflow':
                reportData.data = {
                    transactions: this.transactions,
                    cashFlow: this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) * 1.3
                };
                break;
            case 'budget-performance':
                reportData.data = {
                    budgets: this.budgets.map(b => ({
                        ...b,
                        usagePercent: (b.used / b.amount * 100).toFixed(2)
                    }))
                };
                break;
        }

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showAlert(`${reportType} raporu başarıyla indirildi!`, 'success');
    }

    // Journal Entry Functions
    addJournalEntry() {
        const entriesContainer = document.getElementById('journalEntries');
        const newEntry = document.createElement('div');
        newEntry.className = 'journal-entry';
        newEntry.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Hesap</label>
                    <select class="journal-account" required>
                        <option value="">Seçin</option>
                        <option value="100">100 - Kasa</option>
                        <option value="101">101 - Banka</option>
                        <option value="120">120 - Alıcılar</option>
                        <option value="320">320 - Satışlar</option>
                        <option value="600">600 - Satılan Malın Maliyeti</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Borç (₺)</label>
                    <input type="number" class="journal-debit" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label>Alacak (₺)</label>
                    <input type="number" class="journal-credit" min="0" step="0.01">
                </div>
            </div>
        `;
        entriesContainer.appendChild(newEntry);
    }

    // Utility Functions
    formatNumber(num) {
        return new Intl.NumberFormat('tr-TR').format(num);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('tr-TR');
    }

    getCategoryName(category) {
        const categories = {
            'sales': 'Satış',
            'marketing': 'Pazarlama',
            'operations': 'Operasyon',
            'hr': 'İnsan Kaynakları',
            'technology': 'Teknoloji',
            'other': 'Diğer'
        };
        return categories[category] || category;
    }

    getTypeName(type) {
        const types = {
            'income': 'Gelir',
            'expense': 'Gider',
            'transfer': 'Transfer'
        };
        return types[type] || type;
    }

    getStatusName(status) {
        const statuses = {
            'completed': 'Tamamlandı',
            'pending': 'Beklemede',
            'cancelled': 'İptal'
        };
        return statuses[status] || status;
    }

    getPeriodName(period) {
        const periods = {
            'monthly': 'Aylık',
            'quarterly': 'Çeyreklik',
            'yearly': 'Yıllık'
        };
        return periods[period] || period;
    }
}

// Global Functions
function showTab(tabName) {
    financeManager.showTab(tabName);
}

function showAddTransactionModal() {
    financeManager.showAddTransactionModal();
}

function showBudgetModal() {
    financeManager.showBudgetModal();
}

function showJournalEntryModal() {
    financeManager.showJournalEntryModal();
}

function showAccountModal() {
    financeManager.showAccountModal();
}

function exportFinancialData() {
    financeManager.exportFinancialData();
}

function generateReport() {
    financeManager.generateReport();
}

function downloadReport(reportType) {
    financeManager.downloadReport(reportType);
}

function addJournalEntry() {
    financeManager.addJournalEntry();
}

// Initialize Finance Manager
let financeManager;
document.addEventListener('DOMContentLoaded', function() {
    financeManager = new FinanceManager();
});

console.log('✅ Finance & Accounting System Loaded');
