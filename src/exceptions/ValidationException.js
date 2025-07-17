import { CreebleException } from './CreebleException.js';

/**
 * Exception thrown when API validation fails
 */
export class ValidationException extends CreebleException {
    constructor(message = 'Validation failed', errors = {}) {
        super(message, 422);
        this.name = 'ValidationException';
        this.errors = errors;
    }
}