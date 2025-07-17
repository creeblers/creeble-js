import { CreebleException } from './CreebleException.js';

/**
 * Exception thrown when API authentication fails
 */
export class AuthenticationException extends CreebleException {
    constructor(message = 'Authentication failed') {
        super(message, 401);
        this.name = 'AuthenticationException';
    }
}