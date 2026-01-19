/**
 * Download file from blob
 * @param {Blob} blob - File blob
 * @param {string} filename - Name of the file to download
 */
export const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Generate filename for export
 * @param {string} module - Module name (attendance, leave, payroll)
 * @param {string} format - File format (csv, pdf)
 * @param {object} filters - Applied filters
 * @returns {string} Generated filename
 */
export const generateFilename = (module, format, filters = {}) => {
    const timestamp = new Date().toISOString().split('T')[0];
    let filename = `${module}-${timestamp}`;

    if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate).toISOString().split('T')[0];
        const end = new Date(filters.endDate).toISOString().split('T')[0];
        filename += `-${start}_to_${end}`;
    } else if (filters.month && filters.year) {
        filename += `-${filters.month}-${filters.year}`;
    }

    filename += `.${format}`;
    return filename;
};

/**
 * Handle export with error handling
 * @param {Function} apiCall - API function to call
 * @param {object} params - Parameters for the API call
 * @param {string} filename - Name for the downloaded file
 * @returns {Promise} Promise that resolves when download completes
 */
export const handleExport = async (apiCall, params, filename) => {
    try {
        const response = await apiCall(params);

        // Check if response is a blob
        if (response.data instanceof Blob) {
            downloadFile(response.data, filename);
            return { success: true, message: 'Export completed successfully' };
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Export error:', error);

        let errorMessage = 'Failed to export data';
        if (error.response) {
            // Server responded with error
            if (error.response.data instanceof Blob) {
                // Try to parse error from blob
                const text = await error.response.data.text();
                try {
                    const errorData = JSON.parse(text);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = text || errorMessage;
                }
            } else if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        return { success: false, message: errorMessage };
    }
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateForExport = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
};

/**
 * Validate export parameters
 * @param {object} params - Parameters to validate
 * @param {array} requiredParams - Array of required parameter names
 * @returns {object} Validation result
 */
export const validateExportParams = (params, requiredParams = []) => {
    const missing = requiredParams.filter(param => !params[param]);

    if (missing.length > 0) {
        return {
            valid: false,
            message: `Missing required parameters: ${missing.join(', ')}`
        };
    }

    return { valid: true };
};

export default {
    downloadFile,
    generateFilename,
    handleExport,
    formatDateForExport,
    validateExportParams
};
