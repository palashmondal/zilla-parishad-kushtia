/**
 * CRUD Operations Utility
 * Reusable functions for Create, Read, Update, Delete operations
 */

const CRUDManager = {
    /**
     * Show loading spinner
     */
    showLoading(elementId) {
        const el = document.getElementById(elementId);
        if (el) el.classList.remove('hidden');
    },

    /**
     * Hide loading spinner
     */
    hideLoading(elementId) {
        const el = document.getElementById(elementId);
        if (el) el.classList.add('hidden');
    },

    /**
     * Show error message
     */
    showError(message, elementId = 'error-message') {
        const el = document.getElementById(elementId);
        const textEl = document.getElementById('error-text');

        if (el && textEl) {
            textEl.textContent = message;
            el.classList.remove('hidden');

            // Auto-hide after 5 seconds
            setTimeout(() => {
                el.classList.add('hidden');
            }, 5000);
        } else {
            alert(message);
        }
    },

    /**
     * Show success message
     */
    showSuccess(message, elementId = 'success-message') {
        const el = document.getElementById(elementId);
        const textEl = document.getElementById('success-text');

        if (el && textEl) {
            textEl.textContent = message;
            el.classList.remove('hidden');

            // Auto-hide after 3 seconds
            setTimeout(() => {
                el.classList.add('hidden');
            }, 3000);
        } else {
            alert(message);
        }
    },

    /**
     * Hide error message
     */
    hideError(elementId = 'error-message') {
        const el = document.getElementById(elementId);
        if (el) el.classList.add('hidden');
    },

    /**
     * Hide success message
     */
    hideSuccess(elementId = 'success-message') {
        const el = document.getElementById(elementId);
        if (el) el.classList.add('hidden');
    },

    /**
     * Open modal
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Close modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    },

    /**
     * Confirm action
     */
    async confirm(message) {
        return window.confirm(message);
    },

    /**
     * Format date for display (Bengali)
     */
    formatDate(dateString) {
        if (!dateString) return '-';

        const date = new Date(dateString);
        const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

        const day = date.getDate().toString().split('').map(d => bengaliDigits[d]).join('');
        const month = date.getMonth() + 1;
        const year = date.getFullYear().toString().split('').map(d => bengaliDigits[d]).join('');

        const monthNames = [
            'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
            'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
        ];

        return `${day} ${monthNames[month - 1]} ${year}`;
    },

    /**
     * Format number to Bengali
     */
    toBengaliNumber(num) {
        if (num === null || num === undefined) return '-';

        const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return num.toString().split('').map(d => {
            return d === '.' ? '.' : (d === ',' ? ',' : bengaliDigits[parseInt(d)] || d);
        }).join('');
    },

    /**
     * Format currency (Bangladeshi Taka)
     */
    formatCurrency(amount) {
        if (amount === null || amount === undefined) return '-';
        return this.toBengaliNumber(parseFloat(amount).toFixed(2)) + ' টাকা';
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Paginate array
     */
    paginate(array, page, perPage) {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        return array.slice(start, end);
    },

    /**
     * Create pagination UI
     */
    createPagination(totalItems, currentPage, perPage, containerId, onPageChange) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const totalPages = Math.ceil(totalItems / perPage);
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '<div class="flex items-center justify-center gap-2 mt-6">';

        // Previous button
        if (currentPage > 1) {
            html += `<button onclick="${onPageChange}(${currentPage - 1})" class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">পূর্ববর্তী</button>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                html += `<button class="px-4 py-2 bg-green-600 text-white rounded-lg font-bold">${this.toBengaliNumber(i)}</button>`;
            } else if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `<button onclick="${onPageChange}(${i})" class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">${this.toBengaliNumber(i)}</button>`;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += `<span class="px-2">...</span>`;
            }
        }

        // Next button
        if (currentPage < totalPages) {
            html += `<button onclick="${onPageChange}(${currentPage + 1})" class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">পরবর্তী</button>`;
        }

        html += '</div>';
        container.innerHTML = html;
    },

    /**
     * Debounce function for search
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Generic fetch with error handling
     */
    async fetchData(url, options = {}) {
        try {
            const response = await AuthManager.fetch(url, options);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'একটি ত্রুটি ঘটেছে');
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    },

    /**
     * Generic list fetcher
     */
    async fetchList(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${AuthManager.API_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
        return await this.fetchData(url);
    },

    /**
     * Generic create
     */
    async create(endpoint, data) {
        const url = `${AuthManager.API_URL}${endpoint}`;
        return await this.fetchData(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    /**
     * Generic update
     */
    async update(endpoint, id, data) {
        const url = `${AuthManager.API_URL}${endpoint}/${id}`;
        return await this.fetchData(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    /**
     * Generic delete
     */
    async delete(endpoint, id) {
        const confirmed = await this.confirm('আপনি কি নিশ্চিত যে আপনি এটি মুছে ফেলতে চান?');
        if (!confirmed) return null;

        const url = `${AuthManager.API_URL}${endpoint}/${id}`;
        return await this.fetchData(url, {
            method: 'DELETE'
        });
    },

    /**
     * Form data to JSON
     */
    formToJSON(formElement) {
        const formData = new FormData(formElement);
        const json = {};

        for (const [key, value] of formData.entries()) {
            // Handle multiple values (checkboxes)
            if (json[key]) {
                if (!Array.isArray(json[key])) {
                    json[key] = [json[key]];
                }
                json[key].push(value);
            } else {
                json[key] = value;
            }
        }

        return json;
    },

    /**
     * Populate form from data
     */
    populateForm(formElement, data) {
        for (const [key, value] of Object.entries(data)) {
            const input = formElement.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value;
                } else if (input.type === 'radio') {
                    const radio = formElement.querySelector(`[name="${key}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else {
                    input.value = value || '';
                }
            }
        }
    },

    /**
     * Clear form
     */
    clearForm(formElement) {
        formElement.reset();
    }
};
