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
        const params = {
            find_by: `${field}:${value}`,
            type
        };
        
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