// CEO Dashboard Management JavaScript
class CEODashboard {
    constructor() {
        this.revenueChart = null;
        this.departmentChart = null;
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.loadDashboardData();
        this.setupCharts();
        this.loadRecentActivities();
        this.loadNotifications();
        this.loadCriticalAlerts();
        this.startAutoRefresh();
    }

    loadDashboardData() {
        // Load financial data
        const transactions = JSON.parse(localStorage.getItem('paymentTransactions') || '[]');
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        
        // Calculate revenue
        const totalRevenue = transactions
            .filter(t => t.status === 'completed' && t.type === 'payment')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        
        const monthlyRevenue = transactions
            .filter(t => {
                const transactionDate = new Date(t.timestamp);
                const now = new Date();
                return transactionDate.getMonth() === now.getMonth() &&
                       transactionDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        // Calculate expenses (mock data)
        const totalExpenses = monthlyRevenue * 0.6;
        const netProfit = monthlyRevenue - totalExpenses;

        // Update UI
        document.getElementById('totalRevenue').textContent = this.formatCurrency(monthlyRevenue);
        document.getElementById('netProfit').textContent = this.formatCurrency(netProfit);
        document.getElementById('totalOrders').textContent = this.formatNumber(orders.length);
        
        // User count
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const activeUsers = users.filter(u => u.isActive !== false).length;
        document.getElementById('totalUsers').textContent = this.formatNumber(activeUsers || 1450);
        
        // Active streams (mock)
        document.getElementById('activeStreams').textContent = this.formatNumber(Math.floor(Math.random() * 25) + 5);
        
        // Security score (mock)
        const securityScore = 85 + Math.floor(Math.random() * 10);
        document.getElementById('securityScore').textContent = securityScore + '%';
        
        // System performance (mock)
        const performance = 90 + Math.floor(Math.random() * 8);
        document.getElementById('systemPerformance').textContent = performance + '%';
    }

    setupCharts() {
        this.setupRevenueChart();
        this.setupDepartmentChart();
    }

    setupRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        const period = parseInt(document.getElementById('revenueChartPeriod')?.value || '30');
        const data = this.generateRevenueData(period);

        if (this.revenueChart) {
            this.revenueChart.destroy();
        }

        this.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Gelir',
                    data: data.values,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    fill: true
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
                            label: (context) => {
                                return 'Gelir: ' + this.formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => {
                                return '₺' + this.formatNumber(value);
                            }
                        }
                    }
                }
            }
        });
    }

    setupDepartmentChart() {
        const ctx = document.getElementById('departmentChart');
        if (!ctx) return;

        const data = {
            labels: ['Finans', 'Operasyon', 'Pazarlama', 'Ar-Ge', 'Güvenlik', 'Diğer'],
            datasets: [{
                data: [25, 30, 15, 12, 10, 8],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 2
            }]
        };

        if (this.departmentChart) {
            this.departmentChart.destroy();
        }

        this.departmentChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return label + ': %' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    generateRevenueData(days) {
        const labels = [];
        const values = [];
        const today = new Date();
        const baseValue = 50000;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            if (days <= 7) {
                labels.push(date.toLocaleDateString('tr-TR', { weekday: 'short' }));
            } else if (days <= 30) {
                labels.push(date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }));
            } else {
                labels.push(date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }));
            }

            // Generate realistic revenue data with trend
            const trend = 1 + (days - i) * 0.02;
            const variance = 0.8 + Math.random() * 0.4;
            values.push(Math.floor(baseValue * trend * variance));
        }

        return { labels, values };
    }

    loadRecentActivities() {
        const activities = [
            { icon: 'fa-coins', text: 'Yeni ödeme işlemi tamamlandı', time: '5 dakika önce', color: 'success' },
            { icon: 'fa-shopping-cart', text: 'Yeni sipariş alındı', time: '12 dakika önce', color: 'primary' },
            { icon: 'fa-user-plus', text: 'Yeni kullanıcı kaydı', time: '1 saat önce', color: 'info' },
            { icon: 'fa-shield-alt', text: 'Güvenlik taraması tamamlandı', time: '2 saat önce', color: 'success' },
            { icon: 'fa-file-alt', text: 'Finansal rapor oluşturuldu', time: '3 saat önce', color: 'warning' },
            { icon: 'fa-broadcast-tower', text: 'Canlı yayın başlatıldı', time: '4 saat önce', color: 'primary' }
        ];

        const container = document.getElementById('recentActivitiesList');
        if (!container) return;

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.color}">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <small>${activity.time}</small>
                </div>
            </div>
        `).join('');
    }

    loadNotifications() {
        const notifications = [
            { icon: 'fa-exclamation-triangle', text: '3 kritik güvenlik tehdidi tespit edildi', time: '10 dakika önce', unread: true, type: 'warning' },
            { icon: 'fa-chart-line', text: 'Aylık gelir hedefi %125 aşıldı', time: '1 saat önce', unread: true, type: 'success' },
            { icon: 'fa-envelope', text: '5 yeni destek talebi bekliyor', time: '2 saat önce', unread: false, type: 'info' },
            { icon: 'fa-sync-alt', text: 'Sistem yedeklemesi tamamlandı', time: '3 saat önce', unread: false, type: 'success' },
            { icon: 'fa-users', text: '12 yeni kullanıcı kaydı', time: '5 saat önce', unread: false, type: 'info' }
        ];

        const container = document.getElementById('notificationsList');
        if (!container) return;

        container.innerHTML = notifications.map(notif => `
            <div class="notification-item ${notif.unread ? 'unread' : ''}">
                <div class="notification-icon ${notif.type}">
                    <i class="fas ${notif.icon}"></i>
                </div>
                <div class="notification-content">
                    <p>${notif.text}</p>
                    <small>${notif.time}</small>
                </div>
            </div>
        `).join('');
    }

    loadCriticalAlerts() {
        const alerts = [
            { level: 'high', message: 'Güvenlik tehdidi tespit edildi: SQL Injection saldırısı', action: 'İncele' },
            { level: 'medium', message: 'Yüksek CPU kullanımı: %85', action: 'Detaylar' },
            { level: 'low', message: '5 bekleyen sipariş onayı gerekiyor', action: 'Görüntüle' }
        ];

        const container = document.getElementById('criticalAlertsList');
        if (!container) return;

        if (alerts.length === 0) {
            container.innerHTML = '<div class="alert-item no-alerts"><p>Kritik uyarı yok</p></div>';
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.level}">
                <div class="alert-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${alert.message}</span>
                </div>
                <button class="btn btn-outline btn-xs" onclick="handleAlertAction('${alert.level}')">
                    ${alert.action}
                </button>
            </div>
        `).join('');
    }

    startAutoRefresh() {
        // Refresh dashboard data every 30 seconds
        this.updateInterval = setInterval(() => {
            this.loadDashboardData();
        }, 30000);
    }

    stopAutoRefresh() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    refresh() {
        this.loadDashboardData();
        this.setupCharts();
        this.loadRecentActivities();
        this.loadNotifications();
        this.loadCriticalAlerts();
        showAlert('Dashboard yenilendi', 'success');
    }

    // Utility functions
    formatCurrency(value) {
        return '₺' + new Intl.NumberFormat('tr-TR').format(Math.round(value || 0));
    }

    formatNumber(value) {
        return new Intl.NumberFormat('tr-TR').format(value || 0);
    }
}

// Global functions
function refreshDashboard() {
    if (ceoDashboard) {
        ceoDashboard.refresh();
    }
}

function updateRevenueChart() {
    if (ceoDashboard) {
        ceoDashboard.setupRevenueChart();
    }
}

function refreshDepartmentChart() {
    if (ceoDashboard) {
        ceoDashboard.setupDepartmentChart();
    }
}

function viewAllActivities() {
    showAlert('Tüm aktiviteler yakında eklenecek', 'info');
}

function markAllAsRead() {
    document.querySelectorAll('.notification-item.unread').forEach(item => {
        item.classList.remove('unread');
    });
    showAlert('Tüm bildirimler okundu olarak işaretlendi', 'success');
}

function handleAlertAction(level) {
    showAlert(`${level} seviyesindeki uyarı işleniyor...`, 'info');
}

let ceoDashboard;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dashboard')) {
        ceoDashboard = new CEODashboard();
    }
});

console.log('✅ CEO Dashboard Loaded');
