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