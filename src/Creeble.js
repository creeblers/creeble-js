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
            findBy: (field, value, type = 'pages') => this.data.findBy(name, field, value, type),
            findPageBy: (field, value) => this.data.findPageBy(name, field, value),
            findRowBy: (field, value) => this.data.findRowBy(name, field, value),
            exists: (id) => this.data.exists(name, id),
            // New helper methods
            getRowsByDatabase: (databaseName) => this.getRowsByDatabase(name, databaseName),
            getDatabases: () => this.getDatabases(name),
            getDatabaseNames: () => this.getDatabaseNames(name),
            getRowByField: (databaseName, field, value) => this.getRowByField(name, databaseName, field, value),
            getAllRows: () => this.getAllRows(name),
            // Pagination helpers
            getAllPages: (filters = {}, limit = 20) => this.data.getAllPages(name, filters, limit),
            getNextPage: (currentResponse, filters = {}) => this.data.getNextPage(currentResponse, filters),
            getPrevPage: (currentResponse, filters = {}) => this.data.getPrevPage(currentResponse, filters),
            hasMorePages: (response) => this.data.hasMorePages(response),
            isLastPage: (response) => this.data.isLastPage(response)
        };
    }

    /**
     * Get all rows from a specific database by name
     * @param {string} endpoint - The endpoint name
     * @param {string} databaseName - The database name (e.g., 'Posts', 'Pages', 'Products', etc.)
     * @returns {Promise<Array>} Array of rows from the specified database
     */
    async getRowsByDatabase(endpoint, databaseName) {
        const response = await this.data.list(endpoint, { type: 'rows' });
        const rows = response.data || [];
        return rows.filter(row => row.database === databaseName);
    }

    /**
     * Get all available databases in an endpoint
     * @param {string} endpoint - The endpoint name
     * @returns {Promise<Array>} Array of database schemas
     */
    async getDatabases(endpoint) {
        const response = await this.data.list(endpoint, { type: 'pages' });
        return response.data || [];
    }

    /**
     * Get database names from an endpoint
     * @param {string} endpoint - The endpoint name
     * @returns {Promise<Array>} Array of database names
     */
    async getDatabaseNames(endpoint) {
        const databases = await this.getDatabases(endpoint);
        return databases.map(db => db.title);
    }

    /**
     * Get a single row by field value from a specific database
     * @param {string} endpoint - The endpoint name
     * @param {string} databaseName - The database name
     * @param {string} field - The field name to search by
     * @param {any} value - The value to search for
     * @returns {Promise<Object|null>} The found row or null
     */
    async getRowByField(endpoint, databaseName, field, value) {
        const rows = await this.getRowsByDatabase(endpoint, databaseName);
        return rows.find(row => {
            const fieldValue = row.properties?.[field]?.value;
            return fieldValue === value;
        }) || null;
    }

    /**
     * Get all rows (all databases combined)
     * @param {string} endpoint - The endpoint name
     * @returns {Promise<Array>} Array of all rows
     */
    async getAllRows(endpoint) {
        const response = await this.data.list(endpoint, { type: 'rows' });
        return response.data || [];
    }

    /**
     * Transform Notion properties to a simpler format
     * @param {Object} item - The raw item from the API
     * @returns {Object} Simplified item
     */
    static simplifyItem(item) {
        const simplified = {
            id: item.id,
            title: item.title,
            database: item.database,
            database_id: item.database_id,
            content: item.html_content,
            created_at: item.created_at,
            updated_at: item.updated_at,
            notion_url: item.notion_url
        };

        // Flatten properties
        if (item.properties) {
            Object.entries(item.properties).forEach(([key, prop]) => {
                simplified[key] = prop.value || prop.html || null;
            });
        }

        return simplified;
    }
}
