/**
 * Route Guard Service
 * Protects routes that require authentication
 */

(function() {
    'use strict';

    const protectedRoutes = [
        '/admin-dashboard.html',
        '/live-stream.html',
        '/panels/'
    ];

    const publicRoutes = [
        '/index.html',
        '/',
        '/privacy-policy.html',
        '/terms.html',
        '/cookie-policy.html'
    ];

    /**
     * Check if current route is protected
     */
    function isProtectedRoute(path) {
        return protectedRoutes.some(route => path.includes(route));
    }

    /**
     * Check if user is authenticated
     */
    function isAuthenticated() {
        // Check auth service first
        if (window.authService) {
            // Auth service will verify token
            return window.authService.isAuthenticated();
        }
        
        // Fallback: Check localStorage
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            try {
                const user = JSON.parse(currentUser);
                return user && user.email && user.role;
            } catch (e) {
                return false;
            }
        }
        
        return false;
    }

    /**
     * Get user role
     */
    function getUserRole() {
        if (window.authService && window.authService.getCurrentUser) {
            const user = window.authService.getCurrentUser();
            return user ? user.role : null;
        }
        
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            try {
                const user = JSON.parse(currentUser);
                return user.role;
            } catch (e) {
                return null;
            }
        }
        
        return null;
    }

    /**
     * Check if user has access to route
     */
    function hasAccess(path, userRole) {
        // Admin can access everything
        if (userRole === 'admin' && path.includes('admin-dashboard.html')) {
            return true;
        }
        
        // Live stream - all authenticated users
        if (path.includes('live-stream.html')) {
            return true;
        }
        
        // Panel routes - check role
        if (path.includes('panels/')) {
            if (path.includes('hammaddeci') && userRole === 'hammaddeci') return true;
            if (path.includes('uretici') && userRole === 'uretici') return true;
            if (path.includes('toptanci') && userRole === 'toptanci') return true;
            if (path.includes('satici') && userRole === 'satici') return true;
            if (path.includes('musteri') && userRole === 'musteri') return true;
            return false;
        }
        
        return true;
    }

    /**
     * Redirect to login
     */
    function redirectToLogin() {
        const currentPath = window.location.pathname + window.location.search;
        const loginUrl = window.location.origin + '/index.html?redirect=' + encodeURIComponent(currentPath);
        window.location.href = loginUrl;
    }

    /**
     * Redirect to dashboard based on role
     */
    function redirectToDashboard() {
        const userRole = getUserRole();
        const basePath = window.location.pathname.replace(/\/[^/]*$/, '/');
        
        if (userRole === 'admin') {
            window.location.href = basePath + 'admin-dashboard.html';
        } else {
            window.location.href = basePath + 'live-stream.html';
        }
    }

    /**
     * Protect route
     */
    function protectRoute() {
        const currentPath = window.location.pathname;
        
        // Skip if public route
        if (publicRoutes.some(route => currentPath === route || currentPath.endsWith(route))) {
            return;
        }
        
        // Check if protected route
        if (isProtectedRoute(currentPath)) {
            // Check authentication
            if (!isAuthenticated()) {
                console.log('🔒 Protected route - redirecting to login');
                redirectToLogin();
                return;
            }
            
            // Check access
            const userRole = getUserRole();
            if (!hasAccess(currentPath, userRole)) {
                console.log('🚫 Access denied - redirecting to dashboard');
                redirectToDashboard();
                return;
            }
        }
    }

    /**
     * Handle redirect parameter
     */
    function handleRedirect() {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');
        
        if (redirectUrl && isAuthenticated()) {
            // Remove redirect parameter
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
            
            // Redirect to original page
            window.location.href = redirectUrl;
        }
    }

    /**
     * Initialize route guard
     */
    function init() {
        // Wait for DOM and auth service to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(protectRoute, 100); // Small delay for auth service
                handleRedirect();
            });
        } else {
            setTimeout(protectRoute, 100);
            handleRedirect();
        }
    }

    // Export
    window.routeGuard = {
        protectRoute: protectRoute,
        isAuthenticated: isAuthenticated,
        getUserRole: getUserRole,
        hasAccess: hasAccess,
        redirectToLogin: redirectToLogin,
        redirectToDashboard: redirectToDashboard
    };

    // Auto-initialize
    init();

})();

