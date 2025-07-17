/**
 * Projects endpoint for accessing project information via Creeble API
 */
export class Projects {
    constructor(client) {
        this.client = client;
    }

    /**
     * Get project information by endpoint
     */
    async info(endpoint) {
        return await this.client.get(`/v1/${endpoint}/info`);
    }

    /**
     * Get project schema/structure
     */
    async schema(endpoint) {
        return await this.client.get(`/v1/${endpoint}/schema`);
    }

    /**
     * Get project statistics
     */
    async stats(endpoint) {
        return await this.client.get(`/v1/${endpoint}/stats`);
    }

    /**
     * Get available fields for a project
     */
    async fields(endpoint) {
        const schema = await this.schema(endpoint);
        return schema.fields || [];
    }

    /**
     * Check if project endpoint exists and is accessible
     */
    async exists(endpoint) {
        try {
            await this.info(endpoint);
            return true;
        } catch (error) {
            return false;
        }
    }
}