/**
 * Admin Dashboard JavaScript
 * Admin panel için ana JavaScript dosyası
 */

// Global variables
let currentPage = 1;
let pageSize = 50;
let currentFilters = {
    search: '',
    role: '',
    status: ''
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin Dashboard yükleniyor...');
    
    // Check admin authentication
    checkAdminAuth();
    
    // Initialize navigation
    initNavigation();
    
    // Load initial data
    loadDashboardStats();
    loadUsers();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ Admin Dashboard yüklendi');
});

/**
 * Check admin authentication
 */
function checkAdminAuth() {
    try {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) {
            window.location.href = 'index.html';
            return;
        }
        
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
        
        // Set admin email
        const adminEmailElement = document.getElementById('adminUserEmail');
        if (adminEmailElement) {
            adminEmailElement.textContent = user.email || 'Admin';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'index.html';
    }
}

/**
 * Initialize navigation
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });
}

/**
 * Switch section
 */
function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from nav links
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.classList.add('active');
    }
    
    // Set active nav link
    const navLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
    
    // Load section data
    if (sectionName === 'users') {
        loadUsers();
    } else if (sectionName === 'dashboard') {
        loadDashboardStats();
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // User search
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }
    
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAllUsers');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#usersTableBody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
}

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
    try {
        const apiUrl = window.getAPIBaseURL ? window.getAPIBaseURL() : '/api';
        
        // Load user stats
        try {
            const userStatsResponse = await fetch(`${apiUrl}/admin/users/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (userStatsResponse.ok) {
                const userStats = await userStatsResponse.json();
                if (userStats.ok) {
                    document.getElementById('statTotalUsers').textContent = userStats.total || 0;
                }
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
        
        // Load stream stats
        try {
            const streamStatsResponse = await fetch(`${apiUrl}/admin/streams/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (streamStatsResponse.ok) {
                const streamStats = await streamStatsResponse.json();
                if (streamStats.ok) {
                    document.getElementById('statTotalStreams').textContent = streamStats.total || 0;
                    document.getElementById('statActiveStreams').textContent = streamStats.active || 0;
                }
            }
        } catch (error) {
            console.error('Error loading stream stats:', error);
        }
        
        // Load error stats (if endpoint exists)
        try {
            const errorStatsResponse = await fetch(`${apiUrl}/errors/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (errorStatsResponse.ok) {
                const errorStats = await errorStatsResponse.json();
                document.getElementById('statTotalErrors').textContent = errorStats.total || 0;
            } else {
                // Fallback if endpoint doesn't exist
                document.getElementById('statTotalErrors').textContent = '0';
            }
        } catch (error) {
            console.error('Error loading error stats:', error);
            document.getElementById('statTotalErrors').textContent = '0';
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

/**
 * Load users list
 */
async function loadUsers() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="loading-spinner"></div> Yükleniyor...</td></tr>';
    
    try {
        const apiUrl = window.getAPIBaseURL ? window.getAPIBaseURL() : '/api';
        const params = new URLSearchParams({
            limit: pageSize,
            offset: (currentPage - 1) * pageSize,
            ...currentFilters
        });
        
        const response = await fetch(`${apiUrl}/admin/users?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load users');
        }
        
        const data = await response.json();
        
        if (!data.ok || !data.users || data.users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Üye bulunamadı</td></tr>';
            return;
        }
        
        // Render users table
        tableBody.innerHTML = data.users.map(user => `
            <tr>
                <td><input type="checkbox" value="${user.email}"></td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.companyName || '-')}</td>
                <td><span class="status-badge">${escapeHtml(user.role || 'user')}</span></td>
                <td><span class="status-badge status-${user.status || 'inactive'}">${getStatusText(user.status)}</span></td>
                <td>${formatDate(user.createdAt)}</td>
                <td>${formatDate(user.lastLogin) || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-icon btn-outline" onclick="editUser('${user.email}')" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-icon btn-outline" onclick="deleteUser('${user.email}')" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                        ${user.status === 'banned' || user.status === 'suspended' ? 
                            `<button class="btn btn-icon btn-outline" onclick="activateUser('${user.email}')" title="Aktifleştir">
                                <i class="fas fa-check"></i>
                            </button>` : 
                            `<button class="btn btn-icon btn-outline" onclick="banUser('${user.email}')" title="Banla">
                                <i class="fas fa-ban"></i>
                            </button>`
                        }
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Render pagination
        renderPagination(data.total, pageSize, currentPage);
        
    } catch (error) {
        console.error('Error loading users:', error);
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Hata: ' + error.message + '</td></tr>';
    }
}

/**
 * Render pagination
 */
function renderPagination(total, pageSize, currentPage) {
    const pagination = document.getElementById('usersPagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">
        <i class="fas fa-chevron-left"></i> Önceki
    </button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<button disabled>...</button>`;
        }
    }
    
    // Next button
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">
        Sonraki <i class="fas fa-chevron-right"></i>
    </button>`;
    
    pagination.innerHTML = html;
}

/**
 * Go to page
 */
function goToPage(page) {
    currentPage = page;
    loadUsers();
}

/**
 * Apply filters
 */
function applyFilters() {
    currentFilters.search = document.getElementById('userSearch').value || '';
    currentFilters.role = document.getElementById('userRoleFilter').value || '';
    currentFilters.status = document.getElementById('userStatusFilter').value || '';
    currentPage = 1;
    loadUsers();
}

/**
 * Reset filters
 */
function resetFilters() {
    document.getElementById('userSearch').value = '';
    document.getElementById('userRoleFilter').value = '';
    document.getElementById('userStatusFilter').value = '';
    currentFilters = {
        search: '',
        role: '',
        status: ''
    };
    currentPage = 1;
    loadUsers();
}

/**
 * Show create user modal
 */
function showCreateUserModal() {
    const modal = document.getElementById('createUserModal');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Handle create user
 */
async function handleCreateUser(e) {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('createUserEmail').value.trim(),
        password: document.getElementById('createUserPassword').value,
        companyName: document.getElementById('createUserCompany').value.trim(),
        role: document.getElementById('createUserRole').value,
        firstName: document.getElementById('createUserFirstName').value.trim(),
        lastName: document.getElementById('createUserLastName').value.trim(),
        phone: document.getElementById('createUserPhone').value.trim()
    };
    
    try {
        const apiUrl = window.getAPIBaseURL ? window.getAPIBaseURL() : '/api';
        const response = await fetch(`${apiUrl}/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.ok) {
            alert('Üye başarıyla oluşturuldu');
            closeModal('createUserModal');
            document.getElementById('createUserForm').reset();
            loadUsers();
            loadDashboardStats();
        } else {
            alert('Hata: ' + (data.message || 'Üye oluşturulamadı'));
        }
    } catch (error) {
        console.error('Error creating user:', error);
        alert('Hata: ' + error.message);
    }
}

/**
 * Edit user
 */
async function editUser(email) {
    try {
        const apiUrl = window.getAPIBaseURL ? window.getAPIBaseURL() : '/api';
        const response = await fetch(`${apiUrl}/admin/users/${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load user');
        }
        
        const data = await response.json();
        if (!data.ok || !data.user) {
            throw new Error('User not found');
        }
        
        const user = data.user;
        
        // Fill edit form
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserCompany').value = user.companyName || '';
        document.getElementById('editUserRole').value = user.role || 'musteri';
        document.getElementById('editUserStatus').value = user.status || 'active';
        document.getElementById('editUserFirstName').value = user.firstName || '';
        document.getElementById('editUserLastName').value = user.lastName || '';
        document.getElementById('editUserPhone').value = user.phone || '';
        
        // Show modal
        const modal = document.getElementById('editUserModal');
        if (modal) {
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading user:', error);
        alert('Hata: ' + error.message);
    }
}

/**
 * Handle edit user
 */
async function handleEditUser(e) {
    e.preventDefault();
    
    const email = document.getElementById('editUserEmail').value;
    const formData = {
        companyName: document.getElementById('editUserCompany').value.trim(),
        role: document.getElementById('editUserRole').value,
        status: document.getElementById('editUserStatus').value,
        firstName: document.getElementById('editUserFirstName').value.trim(),
        lastName: document.getElementById('editUserLastName').value.trim(),
        phone: document.getElementById('editUserPhone').value.trim()
    };
    
    try {
        const apiUrl = window.getAPIBaseURL ? window.getAPIBaseURL() : '/api';
        const response = await fetch(`${apiUrl}/admin/users/${encodeURIComponent(email)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.ok) {
            alert('Üye başarıyla güncellendi');
            closeModal('editUserModal');
            loadUsers();
        } else {
            alert('Hata: ' + (data.message || 'Üye güncellenemedi'));
        }
    } catch (error) {
        console.error('Error updating user:', error);
        alert('Hata: ' + error.message);
    }
}

/**
 * Delete user
 */
async function deleteUser(email) {
    if (!confirm(`"${email}" adresli üyeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
        return;
    }
    
    try {
        const apiUrl = window.getAPIBaseURL ? window.getAPIBaseURL() : '/api';
        const response = await fetch(`${apiUrl}/admin/users/${encodeURIComponent(email)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok && data.ok) {
            alert('Üye başarıyla silindi');
            loadUsers();
            loadDashboardStats();
        } else {
            alert('Hata: ' + (data.message || 'Üye silinemedi'));
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Hata: ' + error.message);
    }
}

/**
 * Ban user
 */
async function banUser(email) {
    if (!confirm(`"${email}" adresli üyeyi banlamak istediğinize emin misiniz?`)) {
        return;
    }
    
    try {
        const apiUrl = window.getAPIBaseURL ? window.getAPIBaseURL() : '/api';
        const response = await fetch(`${apiUrl}/admin/users/${encodeURIComponent(email)}/ban`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok && data.ok) {
            alert('Üye başarıyla banlandı');
            loadUsers();
        } else {
            alert('Hata: ' + (data.message || 'Üye banlanamadı'));
        }
    } catch (error) {
        console.error('Error banning user:', error);
        alert('Hata: ' + error.message);
    }
}

/**
 * Activate user
 */
async function activateUser(email) {
    try {
        const apiUrl = window.getAPIBaseURL ? window.getAPIBaseURL() : '/api';
        const response = await fetch(`${apiUrl}/admin/users/${encodeURIComponent(email)}/activate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok && data.ok) {
            alert('Üye başarıyla aktifleştirildi');
            loadUsers();
        } else {
            alert('Hata: ' + (data.message || 'Üye aktifleştirilemedi'));
        }
    } catch (error) {
        console.error('Error activating user:', error);
        alert('Hata: ' + error.message);
    }
}

/**
 * Export users
 */
async function exportUsers() {
    try {
        if (window.adminDashboardService) {
            const success = await window.adminDashboardService.exportData('users', 'csv');
            if (success) {
                alert('Üyeler başarıyla export edildi');
            } else {
                alert('Export başarısız');
            }
        }
    } catch (error) {
        console.error('Error exporting users:', error);
        alert('Hata: ' + error.message);
    }
}

/**
 * Refresh stats
 */
function refreshStats() {
    loadDashboardStats();
    loadUsers();
}

/**
 * Close modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Logout
 */
function logout() {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

/**
 * Utility functions
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

function getStatusText(status) {
    const statusMap = {
        'active': 'Aktif',
        'inactive': 'Pasif',
        'banned': 'Banlı',
        'suspended': 'Askıda'
    };
    return statusMap[status] || status;
}

