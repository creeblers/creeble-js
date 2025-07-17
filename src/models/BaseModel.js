/**
 * Base model class for API responses
 */
export class BaseModel {
    constructor(data = {}) {
        Object.assign(this, data);
    }

    /**
     * Convert model to plain object
     */
    toObject() {
        return { ...this };
    }

    /**
     * Convert model to JSON string
     */
    toJSON() {
        return JSON.stringify(this.toObject());
    }

    /**
     * Check if a property exists
     */
    has(property) {
        return this.hasOwnProperty(property) && this[property] !== undefined;
    }

    /**
     * Get a property with optional default value
     */
    get(property, defaultValue = null) {
        return this.has(property) ? this[property] : defaultValue;
    }
}