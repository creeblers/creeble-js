/**
 * Data endpoint for fetching content from Creeble projects
 */
export class Data {
    constructor(client) {
        this.client = client;
    }

    /**
     * List all items from a project endpoint
     */
    async list(endpoint, params = {}) {
        return await this.client.get(`/v1/${endpoint}`, params);
    }

    /**
     * Get a specific item by ID
     */
    async get(endpoint, id) {
        return await this.client.get(`/v1/${endpoint}/${id}`);
    }

    /**
     * Search for items with specific criteria
     */
    async search(endpoint, query, filters = {}) {
        const params = { ...filters, search: query };
        return await this.list(endpoint, params);
    }

    /**
     * Get items with pagination
     */
    async paginate(endpoint, page = 1, limit = 20, filters = {}) {
        const params = {
            ...filters,
            page,
            limit
        };
        
        return await this.list(endpoint, params);
    }

    /**
     * Get all pages by automatically paginating through results
     * @param {string} endpoint - The endpoint name
     * @param {Object} filters - Additional filters to apply
     * @param {number} limit - Items per page (default: 20)
     * @returns {Promise<Array>} All items from all pages
     */
    async getAllPages(endpoint, filters = {}, limit = 20) {
        let allItems = [];
        let currentPage = 1;
        let hasMorePages = true;

        while (hasMorePages) {
            const response = await this.paginate(endpoint, currentPage, limit, filters);
            
            if (response.data && Array.isArray(response.data)) {
                allItems = allItems.concat(response.data);
            }

            // Check if there are more pages using the new pagination fields
            if (response.pagination) {
                hasMorePages = response.pagination.has_more_pages === true;
                currentPage = response.pagination.next_page || currentPage + 1;
            } else {
                // Fallback for older API responses
                hasMorePages = response.data && response.data.length === limit;
                currentPage++;
            }
        }

        return allItems;
    }

    /**
     * Get the next page of results
     * @param {Object} currentResponse - Current API response with pagination info
     * @param {Object} filters - Additional filters to apply
     * @returns {Promise<Object|null>} Next page response or null if no more pages
     */
    async getNextPage(currentResponse, filters = {}) {
        if (!currentResponse.pagination || !currentResponse.pagination.has_more_pages) {
            return null;
        }

        const nextPage = currentResponse.pagination.next_page;
        if (!nextPage) return null;

        return await this.paginate(
            currentResponse.meta.endpoint, 
            nextPage, 
            currentResponse.pagination.per_page,
            filters
        );
    }

    /**
     * Get the previous page of results
     * @param {Object} currentResponse - Current API response with pagination info
     * @param {Object} filters - Additional filters to apply
     * @returns {Promise<Object|null>} Previous page response or null if no previous page
     */
    async getPrevPage(currentResponse, filters = {}) {
        if (!currentResponse.pagination || !currentResponse.pagination.prev_page) {
            return null;
        }

        const prevPage = currentResponse.pagination.prev_page;
        return await this.paginate(
            currentResponse.meta.endpoint,
            prevPage,
            currentResponse.pagination.per_page,
            filters
        );
    }

    /**
     * Check if there are more pages available
     * @param {Object} response - API response with pagination info
     * @returns {boolean} True if more pages are available
     */
    hasMorePages(response) {
        return response.pagination && response.pagination.has_more_pages === true;
    }

    /**
     * Check if this is the last page
     * @param {Object} response - API response with pagination info
     * @returns {boolean} True if this is the last page
     */
    isLastPage(response) {
        return response.pagination && response.pagination.is_last_page === true;
    }

    /**
     * Filter items by specific fields
     */
    async filter(endpoint, filters) {
        return await this.list(endpoint, filters);
    }

    /**
     * Sort items by a specific field
     */
    async sortBy(endpoint, field, direction = 'asc', filters = {}) {
        const params = {
            ...filters,
            sort: field,
            order: direction
        };
        
        return await this.list(endpoint, params);
    }

    /**
     * Get recent items
     */
    async recent(endpoint, limit = 10) {
        return await this.sortBy(endpoint, 'created_at', 'desc', { limit });
    }

    /**
     * Find a single item by field value
     */
    async findBy(endpoint, field, value, type = 'pages') {
        if (!endpoint || !field || value === undefined || value === null) {
            throw new Error('Endpoint, field, and value are required for findBy');
        }
        
        const params = {
            find_by: `${field}:${value}`,
            type
        };
        
        try {
            const response = await this.list(endpoint, params);
            
            // If single result returned directly, return it
            if (response.data && !Array.isArray(response.data)) {
                return response.data;
            }
            
            // If array returned, return first item or null
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                return response.data[0];
            }
            
            return null;
        } catch (error) {
            // Re-throw with more context
            throw new Error(`Failed to find item by ${field}:${value} in ${endpoint} - ${error.message}`);
        }
    }

    /**
     * Find a single page by field value
     */
    async findPageBy(endpoint, field, value) {
        return await this.findBy(endpoint, field, value, 'pages');
    }

    /**
     * Find a single row by field value
     */
    async findRowBy(endpoint, field, value) {
        return await this.findBy(endpoint, field, value, 'rows');
    }

    /**
     * Check if an item exists
     */
    async exists(endpoint, id) {
        try {
            await this.get(endpoint, id);
            return true;
        } catch (error) {
            return false;
        }
    }
}