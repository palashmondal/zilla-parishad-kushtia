/**
 * Authentication Utility
 * Handles token management, role checking, and auto-redirect
 */

const AuthManager = {
    // API base URL
    API_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : '/api',

    // Token keys
    TOKEN_KEY: 'zpk_admin_token',
    USER_KEY: 'zpk_admin_user',

    /**
     * Get stored token
     */
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    /**
     * Get stored user info
     */
    getUser() {
        const userJson = localStorage.getItem(this.USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    },

    /**
     * Store token and user info
     */
    setAuth(token, user) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    },

    /**
     * Clear authentication data
     */
    clearAuth() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    },

    /**
     * Check if user is logged in
     */
    isAuthenticated() {
        return !!this.getToken();
    },

    /**
     * Check if user has admin role
     */
    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    },

    /**
     * Get user role
     */
    getRole() {
        const user = this.getUser();
        return user ? user.role : null;
    },

    /**
     * Verify token is still valid
     * Returns promise that resolves to user object or null
     */
    async verifyToken() {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${this.API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                this.clearAuth();
                return null;
            }

            const user = await response.json();
            // Update stored user info
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Token verification failed:', error);
            this.clearAuth();
            return null;
        }
    },

    /**
     * Require authentication - redirect to login if not authenticated
     * Call this on page load for protected pages
     */
    async requireAuth() {
        const user = await this.verifyToken();
        if (!user) {
            window.location.href = '/admin/login.html';
            return null;
        }
        return user;
    },

    /**
     * Require admin role - redirect to dashboard if not admin
     * Call this on page load for admin-only pages
     */
    async requireAdmin() {
        const user = await this.requireAuth();
        if (!user) return null;

        if (user.role !== 'admin') {
            alert('এই পাতা শুধুমাত্র প্রশাসকদের জন্য। আপনাকে ড্যাশবোর্ডে পুনঃনির্দেশিত করা হচ্ছে।');
            window.location.href = '/admin/';
            return null;
        }
        return user;
    },

    /**
     * Logout - clear auth and redirect to login
     */
    logout() {
        this.clearAuth();
        window.location.href = '/admin/login.html';
    },

    /**
     * Make authenticated API request
     * Returns response object
     */
    async fetch(url, options = {}) {
        const token = this.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        // If unauthorized, clear auth and redirect to login
        if (response.status === 401) {
            this.clearAuth();
            window.location.href = '/admin/login.html';
            throw new Error('Authentication required');
        }

        return response;
    },

    /**
     * Toggle UI elements based on role
     * Elements with data-role="admin" will only show for admins
     * Elements with data-role="user" will only show for regular users
     */
    applyRoleBasedUI() {
        const user = this.getUser();
        if (!user) return;

        // Show/hide admin-only elements
        document.querySelectorAll('[data-role="admin"]').forEach(el => {
            if (user.role === 'admin') {
                el.style.display = '';
                el.removeAttribute('disabled');
            } else {
                el.style.display = 'none';
                el.setAttribute('disabled', 'true');
            }
        });

        // Show/hide user-only elements
        document.querySelectorAll('[data-role="user"]').forEach(el => {
            if (user.role === 'user') {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
    },

    /**
     * Display user info in UI
     * Elements with data-user-field="field_name" will be populated
     */
    displayUserInfo() {
        const user = this.getUser();
        if (!user) return;

        document.querySelectorAll('[data-user-field]').forEach(el => {
            const field = el.getAttribute('data-user-field');
            if (user[field]) {
                if (el.tagName === 'IMG') {
                    el.src = user[field];
                } else {
                    el.textContent = user[field];
                }
            }
        });

        // Special handling for profile pictures
        document.querySelectorAll('[data-user-avatar]').forEach(el => {
            if (user.photo_path) {
                el.src = user.photo_path;
            } else {
                // Generate avatar with initials
                const initials = user.full_name
                    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                    : user.username.substring(0, 2).toUpperCase();
                el.alt = initials;
                // Use a placeholder with initials
                el.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username)}&background=16a34a&color=fff&size=128`;
            }
        });

        // Special handling for role badges (now showing designation)
        document.querySelectorAll('[data-user-role-badge]').forEach(el => {
            el.textContent = user.designation || (user.role === 'admin' ? 'প্রশাসক' : 'ব্যবহারকারী');
        });
    },

    /**
     * Initialize profile dropdown
     */
    initProfileDropdown() {
        const dropdown = document.getElementById('profile-dropdown');
        const dropdownMenu = document.getElementById('profile-dropdown-menu');

        if (!dropdown || !dropdownMenu) return;

        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdownMenu.classList.add('hidden');
            }
        });
    },

    /**
     * Initialize auth on page load
     * Call this at the end of every admin page
     */
    async init(requireAdminRole = false) {
        const user = requireAdminRole
            ? await this.requireAdmin()
            : await this.requireAuth();

        if (user) {
            this.displayUserInfo();
            this.applyRoleBasedUI();
            this.initProfileDropdown();
        }

        return user;
    }
};

// Add logout button handler globally
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-logout-btn]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('আপনি কি লগআউট করতে চান?')) {
                AuthManager.logout();
            }
        });
    });
});
