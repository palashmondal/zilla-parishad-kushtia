const pool = require('../../config/database');

const progressStepsModel = {
    /**
     * Get all progress steps for a given implementation method
     * @param {string} method - Implementation method ('cppc', 'tender', 'rfq')
     * @returns {Promise<Array>} Array of progress steps ordered by step_order
     */
    async getStepsByMethod(method) {
        try {
            const sql = `
                SELECT id, implementation_method, step_order, bengali_description,
                       base_percentage, is_dynamic_calculation,
                       dynamic_min_percentage, dynamic_max_percentage
                FROM progress_step_definitions
                WHERE implementation_method = ?
                ORDER BY step_order ASC
            `;
            const [rows] = await pool.query(sql, [method]);
            return rows || [];
        } catch (err) {
            console.error('Error fetching progress steps:', err);
            return [];
        }
    },

    /**
     * Get a specific progress step by ID
     * @param {number} stepId - Progress step ID
     * @returns {Promise<Object|null>} Progress step object or null if not found
     */
    async getStepById(stepId) {
        try {
            const sql = `
                SELECT id, implementation_method, step_order, bengali_description,
                       base_percentage, is_dynamic_calculation,
                       dynamic_min_percentage, dynamic_max_percentage
                FROM progress_step_definitions
                WHERE id = ?
            `;
            const [rows] = await pool.query(sql, [stepId]);
            return rows && rows.length > 0 ? rows[0] : null;
        } catch (err) {
            console.error('Error fetching progress step:', err);
            return null;
        }
    },

    /**
     * Get all progress steps (for admin/reference)
     * @returns {Promise<Array>} All progress step definitions
     */
    async getAllSteps() {
        try {
            const sql = `
                SELECT id, implementation_method, step_order, bengali_description,
                       base_percentage, is_dynamic_calculation,
                       dynamic_min_percentage, dynamic_max_percentage
                FROM progress_step_definitions
                ORDER BY implementation_method, step_order
            `;
            const [rows] = await pool.query(sql);
            return rows || [];
        } catch (err) {
            console.error('Error fetching all progress steps:', err);
            return [];
        }
    },

    /**
     * Get all unique implementation methods
     * @returns {Promise<Array>} List of implementation methods
     */
    async getMethods() {
        try {
            const sql = `
                SELECT DISTINCT implementation_method
                FROM progress_step_definitions
                ORDER BY implementation_method
            `;
            const [rows] = await pool.query(sql);
            return rows ? rows.map(r => r.implementation_method) : [];
        } catch (err) {
            console.error('Error fetching implementation methods:', err);
            return [];
        }
    }
};

module.exports = progressStepsModel;
