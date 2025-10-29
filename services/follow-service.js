/**
 * Follow Service
 * Müşteri-firma takip sistemi
 */

class FollowService {
    constructor() {
        this.followers = this.loadFollowers();
        this.following = this.loadFollowing();
        this.setupEventListeners();
    }

    // Load followers data
    loadFollowers() {
        try {
            return JSON.parse(localStorage.getItem('followers') || '{}');
        } catch (e) {
            console.error('Error loading followers:', e);
            return {};
        }
    }

    // Load following data
    loadFollowing() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const userId = currentUser.id;
            if (!userId) return [];
            
            return JSON.parse(localStorage.getItem(`following_${userId}`) || '[]');
        } catch (e) {
            console.error('Error loading following:', e);
            return [];
        }
    }

    // Save followers
    saveFollowers() {
        localStorage.setItem('followers', JSON.stringify(this.followers));
    }

    // Save following
    saveFollowing(userId) {
        localStorage.setItem(`following_${userId}`, JSON.stringify(this.following));
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for follow/unfollow events from live stream
        if (window.websocketService) {
            window.websocketService.on('follow', (data) => {
                this.handleFollowToggle(data.userId, data.companyId, data.following);
            });
        }
    }

    // Follow a company
    followCompany(companyId, companyName, companyRole) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser.id;

        if (!userId || !companyId) {
            throw new Error('Geçersiz kullanıcı veya firma bilgisi.');
        }

        // Check if already following
        if (this.following.find(f => f.id === companyId)) {
            return false; // Already following
        }

        // Add to following list
        this.following.push({
            id: companyId,
            name: companyName,
            role: companyRole,
            followedAt: new Date().toISOString()
        });

        // Add user to company's followers
        if (!this.followers[companyId]) {
            this.followers[companyId] = [];
        }

        this.followers[companyId].push({
            id: userId,
            name: currentUser.companyName || currentUser.name,
            email: currentUser.email,
            followedAt: new Date().toISOString()
        });

        // Save
        this.saveFollowing(userId);
        this.saveFollowers();

        // Emit event
        this.emitFollowChange('follow', userId, companyId);

        return true;
    }

    // Unfollow a company
    unfollowCompany(companyId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser.id;

        if (!userId || !companyId) {
            throw new Error('Geçersiz kullanıcı veya firma bilgisi.');
        }

        // Remove from following list
        this.following = this.following.filter(f => f.id !== companyId);

        // Remove user from company's followers
        if (this.followers[companyId]) {
            this.followers[companyId] = this.followers[companyId].filter(f => f.id !== userId);
        }

        // Save
        this.saveFollowing(userId);
        this.saveFollowers();

        // Emit event
        this.emitFollowChange('unfollow', userId, companyId);

        return true;
    }

    // Get followers for a company
    getFollowers(companyId) {
        return this.followers[companyId] || [];
    }

    // Get following list for a user
    getFollowing(userId) {
        if (!userId) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            userId = currentUser.id;
        }
        return JSON.parse(localStorage.getItem(`following_${userId}`) || '[]');
    }

    // Check if user is following a company
    isFollowing(companyId) {
        return this.following.some(f => f.id === companyId);
    }

    // Handle follow toggle from live stream
    handleFollowToggle(userId, companyId, isFollowing) {
        if (isFollowing) {
            // Find user and company info
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.id === userId);
            const company = users.find(u => u.id === companyId);

            if (user && company) {
                if (!this.followers[companyId]) {
                    this.followers[companyId] = [];
                }
                
                this.followers[companyId].push({
                    id: userId,
                    name: user.companyName || user.name,
                    email: user.email,
                    followedAt: new Date().toISOString()
                });

                this.saveFollowers();
            }
        }
    }

    // Get live streams for followed companies
    getFollowedLiveStreams(userId) {
        const following = this.getFollowing(userId);
        const activeStreams = [];
        
        // Get all active streams from localStorage
        const streams = this.getAllActiveStreams();
        
        following.forEach(company => {
            const stream = streams.find(s => s.companyId === company.id);
            if (stream) {
                activeStreams.push({
                    ...stream,
                    companyName: company.name,
                    companyRole: company.role
                });
            }
        });

        return activeStreams;
    }

    // Get all active live streams
    getAllActiveStreams() {
        try {
            // Get from localStorage (stored by companies when they start streaming)
            const activeStream = localStorage.getItem('activeLivestream');
            if (!activeStream) return [];

            const stream = JSON.parse(activeStream);
            if (stream.status === 'live') {
                return [stream];
            }
            return [];
        } catch (e) {
            console.error('Error getting active streams:', e);
            return [];
        }
    }

    // Emit follow change event
    emitFollowChange(action, userId, companyId) {
        // Custom event for UI updates
        window.dispatchEvent(new CustomEvent('followChanged', {
            detail: { action, userId, companyId }
        }));

        // WebSocket notification if available
        if (window.websocketService) {
            window.websocketService.emit('follow', {
                userId,
                companyId,
                following: action === 'follow'
            });
        }
    }
}

// Initialize service
window.followService = new FollowService();

console.log('✅ Follow Service initialized');

