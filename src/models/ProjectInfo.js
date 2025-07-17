import { BaseModel } from './BaseModel.js';

/**
 * Represents project information from the Creeble API
 */
export class ProjectInfo extends BaseModel {
    constructor(data = {}) {
        super(data);
    }

    /**
     * Get the project ID
     */
    getId() {
        return this.get('id');
    }

    /**
     * Get the project name
     */
    getName() {
        return this.get('name', 'Unnamed Project');
    }

    /**
     * Get the project description
     */
    getDescription() {
        return this.get('description', '');
    }

    /**
     * Get the project status
     */
    getStatus() {
        return this.get('status', 'inactive');
    }

    /**
     * Check if project is active
     */
    isActive() {
        return this.getStatus() === 'active';
    }

    /**
     * Get available endpoints
     */
    getEndpoints() {
        return this.get('endpoints', []);
    }

    /**
     * Get the project created date
     */
    getCreatedAt() {
        const created = this.get('created_at');
        return created ? new Date(created) : null;
    }
}