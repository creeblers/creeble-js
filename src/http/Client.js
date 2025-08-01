import { CreebleException, AuthenticationException, ValidationException, RateLimitException } from '../exceptions/index.js';

/**
 * HTTP Client for Creeble API
 */
export class Client {
    constructor(apiKey, baseUrl, options = {}) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.options = {
            timeout: 30000,
            ...options
        };
        
        // Interceptors for request/response middleware
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        this.errorInterceptors = [];
        
        // Simple in-memory cache
        this.cache = new Map();
        this.cacheEnabled = options.enableCache !== false;
        this.defaultCacheTTL = options.cacheTTL || 300000; // 5 minutes
    }
    
    /**
     * Add request interceptor
     */
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
        return this.requestInterceptors.length - 1;
    }
    
    /**
     * Add response interceptor
     */
    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor);
        return this.responseInterceptors.length - 1;
    }
    
    /**
     * Add error interceptor
     */
    addErrorInterceptor(interceptor) {
        this.errorInterceptors.push(interceptor);
        return this.errorInterceptors.length - 1;
    }
    
    /**
     * Remove interceptor by index
     */
    removeInterceptor(type, index) {
        const interceptors = this[`${type}Interceptors`];
        if (interceptors && interceptors[index]) {
            interceptors.splice(index, 1);
        }
    }

    /**
     * Make a GET request
     */
    async get(uri, params = {}) {
        if (typeof uri !== 'string') {
            throw new CreebleException('URI must be a string');
        }
        
        const url = new URL(`${this.baseUrl}/api${uri}`);
        if (Object.keys(params).length > 0) {
            Object.keys(params).forEach(key => {
                const value = params[key];
                // Handle arrays and objects properly
                if (Array.isArray(value)) {
                    value.forEach(v => url.searchParams.append(`${key}[]`, v));
                } else if (value !== null && value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return this.makeRequest('GET', url);
    }

    /**
     * Make a POST request
     */
    async post(uri, data = {}) {
        const url = new URL(`${this.baseUrl}/api${uri}`);
        return this.makeRequest('POST', url, {
            body: JSON.stringify(data)
        });
    }

    /**
     * Make a PUT request
     */
    async put(uri, data = {}) {
        const url = new URL(`${this.baseUrl}/api${uri}`);
        return this.makeRequest('PUT', url, {
            body: JSON.stringify(data)
        });
    }

    /**
     * Make a DELETE request
     */
    async delete(uri) {
        const url = new URL(`${this.baseUrl}/api${uri}`);
        return this.makeRequest('DELETE', url);
    }

    /**
     * Make an HTTP request
     */
    async makeRequest(method, url, requestOptions = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

        const options = {
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'creeble-js/1.0',
                'X-API-Key': this.apiKey,
                ...requestOptions.headers
            },
            signal: controller.signal,
            ...requestOptions
        };

        try {
            const response = await fetch(url, options);
            clearTimeout(timeoutId);

            if (!response.ok) {
                await this.handleErrorResponse(response);
            }

            return await this.parseResponse(response);
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new CreebleException('Request timeout');
            }
            
            if (error instanceof CreebleException) {
                throw error;
            }
            
            throw new CreebleException(`Request failed: ${error.message}`);
        }
    }

    /**
     * Parse the response from Creeble API
     */
    async parseResponse(response) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            try {
                return await response.json();
            } catch (error) {
                throw new CreebleException('Invalid JSON response from API');
            }
        }
        
        return await response.text();
    }

    /**
     * Handle error responses (4xx and 5xx errors)
     */
    async handleErrorResponse(response) {
        const statusCode = response.status;
        let errorData = {};
        
        try {
            errorData = await response.json();
        } catch {
            // Ignore JSON parse errors for error responses
        }
        
        const message = errorData.message || response.statusText || 'Unknown error';

        switch (statusCode) {
            case 401:
                throw new AuthenticationException(message);
            case 422:
                throw new ValidationException(message, errorData.errors || {});
            case 429:
                const retryAfter = response.headers.get('Retry-After');
                throw new RateLimitException(message, parseInt(retryAfter) || 0);
            case 500:
            case 502:
            case 503:
            case 504:
                throw new CreebleException(`Server error: ${message}`, statusCode);
            default:
                throw new CreebleException(message, statusCode);
        }
    }
}