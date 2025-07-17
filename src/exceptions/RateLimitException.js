import { CreebleException } from './CreebleException.js';

/**
 * Exception thrown when API rate limit is exceeded
 */
export class RateLimitException extends CreebleException {
    constructor(message = 'Rate limit exceeded', retryAfter = 0) {
        super(message, 429);
        this.name = 'RateLimitException';
        this.retryAfter = retryAfter;
    }
}