/**
 * Retry handler with exponential backoff
 */
export class RetryHandler {
    constructor(options = {}) {
        this.maxRetries = options.maxRetries || 3;
        this.baseDelay = options.baseDelay || 1000; // 1 second
        this.maxDelay = options.maxDelay || 30000; // 30 seconds
        this.retryableStatusCodes = options.retryableStatusCodes || [429, 500, 502, 503, 504];
    }

    /**
     * Execute a function with retry logic
     */
    async execute(fn, context = 'request') {
        let lastError;
        
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const result = await fn();
                return result;
            } catch (error) {
                lastError = error;
                
                // Don't retry if it's not a retryable error
                if (!this.shouldRetry(error, attempt)) {
                    throw error;
                }
                
                // Calculate delay with exponential backoff + jitter
                const delay = this.calculateDelay(attempt);
                
                console.warn(`[Creeble] ${context} failed (attempt ${attempt + 1}/${this.maxRetries + 1}), retrying in ${delay}ms...`, {
                    error: error.message,
                    statusCode: error.statusCode
                });
                
                await this.sleep(delay);
            }
        }
        
        throw lastError;
    }

    /**
     * Check if error is retryable
     */
    shouldRetry(error, attempt) {
        // Don't retry if we've exhausted attempts
        if (attempt >= this.maxRetries) {
            return false;
        }

        // Retry on network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return true;
        }

        // Retry on timeout errors
        if (error.name === 'AbortError') {
            return true;
        }

        // Retry on specific HTTP status codes
        if (error.statusCode && this.retryableStatusCodes.includes(error.statusCode)) {
            return true;
        }

        return false;
    }

    /**
     * Calculate delay with exponential backoff and jitter
     */
    calculateDelay(attempt) {
        const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
        const delay = Math.min(exponentialDelay + jitter, this.maxDelay);
        return Math.floor(delay);
    }

    /**
     * Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const defaultRetryHandler = new RetryHandler();