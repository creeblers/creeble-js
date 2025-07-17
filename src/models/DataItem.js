import { BaseModel } from './BaseModel.js';

/**
 * Represents a data item from the Creeble API
 */
export class DataItem extends BaseModel {
    constructor(data = {}) {
        super(data);
    }

    /**
     * Get the item ID
     */
    getId() {
        return this.get('id');
    }

    /**
     * Get the item title
     */
    getTitle() {
        return this.get('title', this.get('name', 'Untitled'));
    }

    /**
     * Get the item description
     */
    getDescription() {
        return this.get('description', '');
    }

    /**
     * Get the item properties
     */
    getProperties() {
        return this.get('properties', {});
    }

    /**
     * Get a specific property value
     */
    getProperty(key, defaultValue = null) {
        const properties = this.getProperties();
        return properties[key] || defaultValue;
    }

    /**
     * Get the item URL
     */
    getUrl() {
        return this.get('url');
    }

    /**
     * Get the created date
     */
    getCreatedAt() {
        const created = this.get('created_time', this.get('created_at'));
        return created ? new Date(created) : null;
    }

    /**
     * Get the last modified date
     */
    getLastModified() {
        const modified = this.get('last_edited_time', this.get('updated_at'));
        return modified ? new Date(modified) : null;
    }
}