/**
 * Dashboard Component Loader
 * Loads reusable header, menu, and footer components
 */

const DashboardComponents = {
    /**
     * Load all dashboard components
     * @param {string} activeMenuItem - The currently active menu item (dashboard, scholarship, humanitarian, projects, users)
     * @param {string} subtitle - The header subtitle text
     */
    async loadAll(activeMenuItem = '', subtitle = 'প্রশাসক ড্যাশবোর্ড') {
        await this.loadHeader(subtitle);
        await this.loadMenu(activeMenuItem);
        await this.loadFooter();
    },

    /**
     * Load header component
     * @param {string} subtitle - The header subtitle text
     */
    async loadHeader(subtitle = 'প্রশাসক ড্যাশবোর্ড') {
        try {
            const response = await fetch('/admin/components/header.html');
            const html = await response.text();
            const headerContainer = document.getElementById('header-container');
            if (headerContainer) {
                headerContainer.innerHTML = html;

                // Set subtitle
                const subtitleElement = document.getElementById('header-subtitle');
                if (subtitleElement) {
                    subtitleElement.textContent = subtitle;
                }
            }
        } catch (error) {
            console.error('Failed to load header:', error);
        }
    },

    /**
     * Load menu component
     * @param {string} activeMenuItem - The currently active menu item
     */
    async loadMenu(activeMenuItem = '') {
        try {
            const response = await fetch('/admin/components/menu.html');
            const html = await response.text();
            const menuContainer = document.getElementById('menu-container');
            if (menuContainer) {
                menuContainer.innerHTML = html;

                // Set active menu item
                if (activeMenuItem) {
                    const activeLink = document.querySelector(`[data-menu-item="${activeMenuItem}"]`);
                    if (activeLink) {
                        // Remove hover classes and add active classes
                        activeLink.classList.remove('text-gray-600', 'hover:text-green-600');
                        activeLink.classList.add('font-semibold', 'text-green-600', 'border-b-2', 'border-green-600');
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load menu:', error);
        }
    },

    /**
     * Load footer component
     */
    async loadFooter() {
        try {
            const response = await fetch('/admin/components/footer.html');
            const html = await response.text();
            const footerContainer = document.getElementById('footer-container');
            if (footerContainer) {
                footerContainer.innerHTML = html;
            }
        } catch (error) {
            console.error('Failed to load footer:', error);
        }
    }
};
