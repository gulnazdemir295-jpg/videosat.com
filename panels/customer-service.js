// Customer Service Management JavaScript
class CustomerServiceManager {
    constructor() {
        this.tickets = this.loadTickets();
        this.chats = this.loadChats();
        this.feedback = this.loadFeedback();
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTickets();
        this.renderChats();
        this.renderFeedback();
        this.updateOverview();
        this.loadDashboardData();
        this.setDefaultDates();
        this.setupModalCloseListeners();
    }

    setupModalCloseListeners() {
        const modals = ['addTicketModal', 'liveChatModal'];
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
        document.getElementById('ticketSearch')?.addEventListener('input', (e) => this.filterTickets(e.target.value));
        document.getElementById('ticketFilter')?.addEventListener('change', (e) => this.filterTicketsByStatus(e.target.value));
        document.getElementById('priorityFilter')?.addEventListener('change', (e) => this.filterTicketsByPriority(e.target.value));
        document.getElementById('categoryFilter')?.addEventListener('change', (e) => this.filterTicketsByCategory(e.target.value));

        document.getElementById('addTicketForm')?.addEventListener('submit', (e) => this.handleAddTicket(e));
        document.getElementById('liveChatForm')?.addEventListener('submit', (e) => this.handleStartChat(e));

        document.getElementById('ticketPeriod')?.addEventListener('change', () => this.updateTicketStatusChart());
        document.getElementById('satisfactionPeriod')?.addEventListener('change', () => this.updateSatisfactionTrendChart());
    }

    setDefaultDates() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        ['feedbackStartDate','analyticsStartDate'].forEach(id => { const el = document.getElementById(id); if (el) el.value = startOfMonth.toISOString().split('T')[0]; });
        ['feedbackEndDate','analyticsEndDate'].forEach(id => { const el = document.getElementById(id); if (el) el.value = today.toISOString().split('T')[0]; });
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

    // Load mocks
    loadTickets() {
        const saved = localStorage.getItem('csTickets');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'T-1247', customer: 'Ahmet Yılmaz', subject: 'Ödeme başarısız', category: 'billing', priority: 'high', status: 'open', createdAt: '2024-10-29 13:45' },
            { id: 'T-1246', customer: 'Ayşe Demir', subject: 'Canlı yayın donuyor', category: 'technical', priority: 'urgent', status: 'in-progress', createdAt: '2024-10-29 12:10' },
            { id: 'T-1245', customer: 'Mehmet Kaya', subject: 'Siparişim nerede?', category: 'general', priority: 'medium', status: 'resolved', createdAt: '2024-10-28 18:22' },
            { id: 'T-1244', customer: 'Zeynep Öz', subject: 'İade talebi', category: 'billing', priority: 'low', status: 'closed', createdAt: '2024-10-27 10:05' }
        ];
    }

    loadChats() {
        const saved = localStorage.getItem('csChats');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'C-1012', customer: 'Ali Çelik', topic: 'Genel Soru', priority: 'medium', startedAt: '2024-10-29 14:25', status: 'active' },
            { id: 'C-1011', customer: 'Fatma Şahin', topic: 'Teknik Destek', priority: 'high', startedAt: '2024-10-29 14:05', status: 'active' },
            { id: 'C-1010', customer: 'Ece Koç', topic: 'Faturalama', priority: 'medium', startedAt: '2024-10-29 13:50', status: 'waiting' }
        ];
    }

    loadFeedback() {
        const saved = localStorage.getItem('csFeedback');
        if (saved) return JSON.parse(saved);
        return [
            { id: 1, customer: 'Ahmet', rating: 5, comment: 'Çok hızlı çözüldü, teşekkürler!', date: '2024-10-29' },
            { id: 2, customer: 'Ayşe', rating: 4, comment: 'İletişim harikaydı.', date: '2024-10-28' },
            { id: 3, customer: 'Mehmet', rating: 3, comment: 'Biraz bekledim ama çözüldü.', date: '2024-10-28' }
        ];
    }

    saveTickets() { localStorage.setItem('csTickets', JSON.stringify(this.tickets)); }
    saveChats() { localStorage.setItem('csChats', JSON.stringify(this.chats)); }
    saveFeedback() { localStorage.setItem('csFeedback', JSON.stringify(this.feedback)); }

    // Overview
    updateOverview() {
        const total = this.tickets.length;
        const resolved = this.tickets.filter(t => ['resolved','closed'].includes(t.status)).length;
        const satisfaction = (this.feedback.reduce((s,f)=>s+f.rating,0) / (this.feedback.length * 5)) * 100;
        document.getElementById('totalTickets').textContent = this.formatNumber(total);
        document.getElementById('resolvedTickets').textContent = this.formatNumber(resolved);
        document.getElementById('customerSatisfaction').textContent = satisfaction.toFixed(1) + '%';
        document.getElementById('avgResponseTime').textContent = '2.3s';
    }

    // Renderers
    renderTickets() {
        const tbody = document.getElementById('ticketsTableBody');
        if (!tbody) return;
        tbody.innerHTML = this.tickets.map(t => `
            <tr>
                <td><code>${t.id}</code></td>
                <td>${t.customer}</td>
                <td>${t.subject}</td>
                <td><span class=\"category-badge ${t.category}\">${this.getCategoryName(t.category)}</span></td>
                <td><span class=\"priority-badge ${t.priority}\">${this.getPriorityName(t.priority)}</span></td>
                <td><span class=\"status-badge ${t.status}\">${this.getStatusName(t.status)}</span></td>
                <td>${t.createdAt}</td>
                <td>
                    <div class=\"action-buttons\">
                        <button class=\"btn btn-outline btn-xs\" onclick=\"csManager.viewTicket('${t.id}')\"><i class=\"fas fa-eye\"></i></button>
                        <button class=\"btn btn-outline btn-xs\" onclick=\"csManager.advanceTicket('${t.id}')\"><i class=\"fas fa-step-forward\"></i></button>
                        <button class=\"btn btn-danger btn-xs\" onclick=\"csManager.closeTicket('${t.id}')\"><i class=\"fas fa-times\"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderChats() {
        const list = document.getElementById('activeChatList');
        if (!list) return;
        list.innerHTML = this.chats.map(c => `
            <div class=\"chat-item ${c.status}\">
                <div class=\"chat-meta\">
                    <strong>${c.customer}</strong>
                    <small>${c.topic} • ${c.priority}</small>
                </div>
                <div class=\"chat-status\">
                    <span class=\"status-badge ${c.status}\">${this.getStatusName(c.status)}</span>
                    <button class=\"btn btn-outline btn-xs\" onclick=\"csManager.endChat('${c.id}')\"><i class=\"fas fa-stop\"></i></button>
                </div>
            </div>
        `).join('');
        document.getElementById('activeChats').textContent = this.chats.filter(c=>c.status==='active').length;
        document.getElementById('waitingChats').textContent = this.chats.filter(c=>c.status==='waiting').length;
        document.getElementById('avgChatResponse').textContent = '1.8s';
        document.getElementById('chatSatisfaction').textContent = '96.2%';
    }

    renderFeedback() {
        const container = document.getElementById('feedbackItems');
        if (!container) return;
        container.innerHTML = this.feedback.map(f => `
            <div class=\"feedback-item\">
                <div class=\"feedback-header\">
                    <strong>${f.customer}</strong>
                    <span class=\"rating\">${'★'.repeat(f.rating)}${'☆'.repeat(5-f.rating)}</span>
                </div>
                <div class=\"feedback-comment\">${f.comment}</div>
                <small class=\"feedback-date\">${this.formatDate(f.date)}</small>
            </div>
        `).join('');
        document.getElementById('totalRatings').textContent = this.formatNumber(this.feedback.length);
        const avg = this.feedback.reduce((s,f)=>s+f.rating,0)/this.feedback.length;
        document.getElementById('avgRating').textContent = avg.toFixed(1) + '/5';
        const positive = this.feedback.filter(f=>f.rating>=4).length / this.feedback.length * 100;
        document.getElementById('positiveComments').textContent = positive.toFixed(1) + '%';
        document.getElementById('responseRate').textContent = '94.7%';
    }

    loadDashboardData() {
        this.updateRecentTickets();
        this.updateSupportAlerts();
        this.updateTicketStatusChart();
        this.updateSatisfactionTrendChart();
    }

    updateRecentTickets() {
        const container = document.getElementById('recentTicketsList');
        if (!container) return;
        const recent = this.tickets.slice(0,5);
        container.innerHTML = recent.map(t => `
            <div class=\"ticket-item ${t.status}\">
                <div class=\"ticket-info\">
                    <div class=\"ticket-id\">${t.id}</div>
                    <div class=\"ticket-customer\">${t.customer}</div>
                </div>
                <div class=\"ticket-details\">
                    <div class=\"ticket-subject\">${t.subject}</div>
                    <div class=\"ticket-badges\">
                        <span class=\"category-badge ${t.category}\">${this.getCategoryName(t.category)}</span>
                        <span class=\"priority-badge ${t.priority}\">${this.getPriorityName(t.priority)}</span>
                    </div>
                </div>
                <div class=\"ticket-status\"><span class=\"status-badge ${t.status}\">${this.getStatusName(t.status)}</span></div>
            </div>
        `).join('');
    }

    updateSupportAlerts() {
        const container = document.getElementById('supportAlertsList');
        if (!container) return;
        const alerts = [
            { type: 'warning', message: 'Acil öncelikli 2 ticket bekliyor', time: '5 dk' },
            { type: 'info', message: 'Haftalık memnuniyet anketi başladı', time: '1 saat' },
            { type: 'success', message: 'Çözüm oranı %95 üzerinde', time: 'Bugün' }
        ];
        container.innerHTML = alerts.map(a => `
            <div class=\"alert-item ${a.type}\">
                <div class=\"alert-icon\"><i class=\"fas fa-${this.getAlertIcon(a.type)}\"></i></div>
                <div class=\"alert-content\">
                    <div class=\"alert-message\">${a.message}</div>
                    <div class=\"alert-details\"><span class=\"alert-time\">${a.time}</span></div>
                </div>
            </div>
        `).join('');
    }

    // Charts (mock)
    updateTicketStatusChart() {
        const ctx = document.getElementById('ticketStatusChart');
        if (!ctx || typeof Chart === 'undefined') return;

        if (this.ticketStatusChart) {
            this.ticketStatusChart.destroy();
        }

        const statuses = ['Açık', 'İşlemde', 'Çözüldü', 'Kapalı'];
        const counts = statuses.map(status => {
            const statusKey = {
                'Açık': 'open',
                'İşlemde': 'in-progress',
                'Çözüldü': 'resolved',
                'Kapalı': 'closed'
            }[status];
            return this.tickets.filter(t => t.status === statusKey).length;
        });

        this.ticketStatusChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: statuses,
                datasets: [{
                    label: 'Ticket Sayısı',
                    data: counts,
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(107, 114, 128, 0.8)'
                    ],
                    borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(251, 191, 36, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(107, 114, 128, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateSatisfactionTrendChart() {
        const ctx = document.getElementById('satisfactionTrendChart');
        if (!ctx || typeof Chart === 'undefined') return;

        if (this.satisfactionTrendChart) {
            this.satisfactionTrendChart.destroy();
        }

        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
        const avgSatisfaction = months.map(() => 3.5 + Math.random() * 1.5);

        this.satisfactionTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Ortalama Memnuniyet',
                    data: avgSatisfaction,
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
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
                                return 'Memnuniyet: ' + context.parsed.y.toFixed(1) + '/5';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 2,
                        max: 5,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1);
                            }
                        }
                    }
                }
            }
        });
    }
    loadAnalyticsData() { console.log('Analytics data loaded'); }

    // Ticket actions
    viewTicket(id) {
        const t = this.tickets.find(x=>x.id===id); if (!t) return;
        alert(`Ticket ${t.id}\nMüşteri: ${t.customer}\nKonu: ${t.subject}\nDurum: ${this.getStatusName(t.status)}`);
    }
    advanceTicket(id) {
        const order = ['open','in-progress','resolved','closed'];
        const t = this.tickets.find(x=>x.id===id); if (!t) return;
        const idx = order.indexOf(t.status);
        t.status = order[Math.min(idx+1, order.length-1)];
        this.saveTickets(); this.renderTickets(); this.updateRecentTickets(); this.updateOverview();
        showAlert('Ticket durumu güncellendi', 'success');
    }
    closeTicket(id) {
        const t = this.tickets.find(x=>x.id===id); if (!t) return;
        t.status = 'closed';
        this.saveTickets(); this.renderTickets(); this.updateRecentTickets(); this.updateOverview();
        showAlert('Ticket kapatıldı', 'success');
    }

    handleAddTicket(e) {
        e.preventDefault();
        const newT = {
            id: 'T-' + (1000 + Math.floor(Math.random()*9000)),
            customer: document.getElementById('ticketCustomer').value,
            subject: document.getElementById('ticketSubject').value,
            category: document.getElementById('ticketCategory').value,
            priority: document.getElementById('ticketPriority').value,
            status: 'open',
            createdAt: new Date().toLocaleString('tr-TR')
        };
        this.tickets.unshift(newT);
        this.saveTickets(); this.renderTickets(); this.updateRecentTickets(); this.updateOverview();
        closeModal('addTicketModal'); showAlert('Ticket oluşturuldu', 'success'); e.target.reset();
    }

    // Chat actions
    startLiveChat() { showAlert('Canlı destek başlatılıyor...', 'info'); }
    handleStartChat(e){
        e.preventDefault();
        const chat = {
            id: 'C-' + (1000 + Math.floor(Math.random()*9000)),
            customer: document.getElementById('chatCustomerName').value,
            topic: this.getTopicName(document.getElementById('chatTopic').value),
            priority: document.getElementById('chatPriority').value,
            startedAt: new Date().toLocaleString('tr-TR'),
            status: 'active'
        };
        this.chats.unshift(chat); this.saveChats(); this.renderChats();
        closeModal('liveChatModal'); showAlert('Chat başlatıldı', 'success'); e.target.reset();
    }
    endChat(id){ const c = this.chats.find(x=>x.id===id); if(!c) return; c.status='closed'; this.saveChats(); this.renderChats(); showAlert('Chat sonlandırıldı','success'); }

    // Feedback
    generateFeedbackReport(){ showAlert('Geri bildirim raporu oluşturuluyor...', 'info'); }

    // Export
    exportCustomerServiceData(){
        const data = { tickets:this.tickets, chats:this.chats, feedback:this.feedback, exportDate:new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href=url; a.download=`customer-service-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        showAlert('Müşteri hizmetleri verileri dışa aktarıldı','success');
    }

    // Filters
    filterTickets(q){
        const filtered = this.tickets.filter(t => `${t.id} ${t.customer} ${t.subject}`.toLowerCase().includes(q.toLowerCase()));
        this.renderFilteredTickets(filtered);
    }
    filterTicketsByStatus(s){ if(!s){this.renderTickets();return;} this.renderFilteredTickets(this.tickets.filter(t=>t.status===s)); }
    filterTicketsByPriority(p){ if(!p){this.renderTickets();return;} this.renderFilteredTickets(this.tickets.filter(t=>t.priority===p)); }
    filterTicketsByCategory(c){ if(!c){this.renderTickets();return;} this.renderFilteredTickets(this.tickets.filter(t=>t.category===c)); }

    renderFilteredTickets(rows){
        const tbody = document.getElementById('ticketsTableBody'); if(!tbody) return;
        tbody.innerHTML = rows.map(t => `
            <tr>
                <td><code>${t.id}</code></td>
                <td>${t.customer}</td>
                <td>${t.subject}</td>
                <td><span class=\"category-badge ${t.category}\">${this.getCategoryName(t.category)}</span></td>
                <td><span class=\"priority-badge ${t.priority}\">${this.getPriorityName(t.priority)}</span></td>
                <td><span class=\"status-badge ${t.status}\">${this.getStatusName(t.status)}</span></td>
                <td>${t.createdAt}</td>
                <td>
                    <div class=\"action-buttons\">
                        <button class=\"btn btn-outline btn-xs\" onclick=\"csManager.viewTicket('${t.id}')\"><i class=\"fas fa-eye\"></i></button>
                        <button class=\"btn btn-outline btn-xs\" onclick=\"csManager.advanceTicket('${t.id}')\"><i class=\"fas fa-step-forward\"></i></button>
                        <button class=\"btn btn-danger btn-xs\" onclick=\"csManager.closeTicket('${t.id}')\"><i class=\"fas fa-times\"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Utils
    formatNumber(n){ return new Intl.NumberFormat('tr-TR').format(n); }
    formatDate(d){ return new Date(d).toLocaleDateString('tr-TR'); }

    getCategoryName(c){ return ({technical:'Teknik',billing:'Faturalama',general:'Genel',complaint:'Şikayet'})[c] || c; }
    getPriorityName(p){ return ({low:'Düşük',medium:'Orta',high:'Yüksek',urgent:'Acil'})[p] || p; }
    getStatusName(s){ return ({'open':'Açık','in-progress':'İşlemde','resolved':'Çözüldü','closed':'Kapalı','active':'Aktif','waiting':'Bekliyor'})[s] || s; }
    getAlertIcon(t){ return ({warning:'exclamation-triangle',info:'info-circle',success:'check-circle',error:'times-circle'})[t] || 'info-circle'; }
    getTopicName(t){ return ({technical:'Teknik Destek',billing:'Faturalama',general:'Genel Soru',complaint:'Şikayet'})[t] || t; }
}

// Globals
function showTab(t){ csManager.showTab(t); }
function showAddTicketModal(){ csManager ? document.getElementById('addTicketModal').style.display='block' : null; }
function showLiveChatModal(){ csManager ? document.getElementById('liveChatModal').style.display='block' : null; }
function exportCustomerServiceData(){ csManager.exportCustomerServiceData(); }
function generateAnalyticsReport(){ showAlert('Analitik raporu oluşturuluyor...', 'info'); }
function downloadAnalytics(type){ showAlert(`${type} raporu yakında`, 'info'); }
function startLiveChat(){ csManager.startLiveChat(); }

let csManager; document.addEventListener('DOMContentLoaded', ()=> { csManager = new CustomerServiceManager(); });

console.log('✅ Customer Service System Loaded');

