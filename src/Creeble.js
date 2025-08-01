import { Client } from './http/Client.js';
import { Data } from './endpoints/Data.js';
import { Projects } from './endpoints/Projects.js';
import { Forms } from './endpoints/Forms.js';
import { logger } from './utils/Logger.js';
import { defaultRetryHandler } from './utils/RetryHandler.js';

/**
 * Main Creeble API client class
 */
export class Creeble {
    constructor(apiKey, baseUrl = 'https://creeble.io', options = {}) {
        if (!apiKey) {
            throw new Error('API key is required');
        }

        // Configure logging
        if (options.debug) {
            logger.setEnabled(true);
            logger.setLevel(options.logLevel || 'debug');
        }

        // Store configuration
        this.config = {
            apiKey,
            baseUrl,
            debug: options.debug || false,
            ...options
        };

        this.client = new Client(apiKey, baseUrl, options);
        this.data = new Data(this.client);
        this.projects = new Projects(this.client);
        this.forms = new Forms(this.client);
        this.logger = logger;
        this.retryHandler = options.retryHandler || defaultRetryHandler;

        // Setup default request/response interceptors
        this.setupDefaultInterceptors();
    }

    /**
     * Setup default interceptors for logging and retry
     */
    setupDefaultInterceptors() {
        // Request logging interceptor
        this.client.addRequestInterceptor(async ({ url, options }) => {
            this.logger.logRequest(options.method || 'GET', url.toString());
            return { url, options };
        });

        // Response logging interceptor
        this.client.addResponseInterceptor((response) => {
            // Log successful responses
            return response;
        });

        // Error interceptor for retry logic
        this.client.addErrorInterceptor(async (error) => {
            this.logger.error('Request failed', error);
            return error;
        });
    }

    /**
     * Enable/disable debug mode
     */
    setDebug(enabled, level = 'debug') {
        this.config.debug = enabled;
        this.logger.setEnabled(enabled);
        if (level) {
            this.logger.setLevel(level);
        }
    }

    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
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
            getRowsByDatabasePaginated: (databaseName, options = {}) => this.getRowsByDatabasePaginated(name, databaseName, options),
            getAllRowsByDatabase: (databaseName, filters = {}) => this.getAllRowsByDatabase(name, databaseName, filters),
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
        const response = await this.data.list(endpoint, { 
            type: 'rows', 
            database: databaseName 
        });
        return response.data || [];
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
        // Use server-side filtering when possible
        try {
            return await this.data.findBy(endpoint, field, value, 'rows');
        } catch (error) {
            // Fallback to database filtering + client-side search
            const rows = await this.getRowsByDatabase(endpoint, databaseName);
            return rows.find(row => {
                const fieldValue = row.properties?.[field]?.value;
                return fieldValue === value;
            }) || null;
        }
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
     * Get all rows from a specific database with pagination support
     * @param {string} endpoint - The endpoint name
     * @param {string} databaseName - The database name
     * @param {Object} options - Additional options (page, limit, filters)
     * @returns {Promise<Array>} Array of rows from the specified database
     */
    async getRowsByDatabasePaginated(endpoint, databaseName, options = {}) {
        const { page = 1, limit = 20, ...filters } = options;
        const params = {
            type: 'rows',
            database: databaseName,
            page,
            limit,
            ...filters
        };
        
        const response = await this.data.list(endpoint, params);
        return response;
    }

    /**
     * Get ALL rows from a specific database across all pages
     * @param {string} endpoint - The endpoint name
     * @param {string} databaseName - The database name
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Array of all rows from the specified database
     */
    async getAllRowsByDatabase(endpoint, databaseName, filters = {}) {
        return await this.data.getAllPages(endpoint, { 
            type: 'rows', 
            database: databaseName,
            ...filters 
        });
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
