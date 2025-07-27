import { Client } from './http/Client.js';
import { Data } from './endpoints/Data.js';
import { Projects } from './endpoints/Projects.js';
import { Forms } from './endpoints/Forms.js';

/**
 * Main Creeble API client class
 */
export class Creeble {
    constructor(apiKey, baseUrl = 'https://creeble.io', options = {}) {
        if (!apiKey) {
            throw new Error('API key is required');
        }

        this.client = new Client(apiKey, baseUrl, options);
        this.data = new Data(this.client);
        this.projects = new Projects(this.client);
        this.forms = new Forms(this.client);
    }

    /**
     * Test the API connection
     */
    async ping() {
        return await this.client.get('/ping');
    }

    /**
     * Get API version information
     */
    async version() {
        return await this.client.get('/version');
    }

    /**
     * Access data endpoints directly
     */
    endpoint(name) {
        return {
            list: (params = {}) => this.data.list(name, params),
            get: (id) => this.data.get(name, id),
            search: (query, filters = {}) => this.data.search(name, query, filters),
            paginate: (page = 1, limit = 20, filters = {}) => this.data.paginate(name, page, limit, filters),
            filter: (filters) => this.data.filter(name, filters),
            sortBy: (field, direction = 'asc', filters = {}) => this.data.sortBy(name, field, direction, filters),
            recent: (limit = 10) => this.data.recent(name, limit),
            exists: (id) => this.data.exists(name, id)
        };
    }
}
