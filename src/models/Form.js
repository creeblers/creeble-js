import { BaseModel } from './BaseModel.js';

/**
 * Form model representing a Creeble form configuration
 */
export class Form extends BaseModel {
    constructor(data) {
        super(data);
    }

    /**
     * Get form name
     */
    get name() {
        return this.data.form_name || this.data.name;
    }

    /**
     * Get form slug
     */
    get slug() {
        return this.data.form_slug || this.data.slug;
    }

    /**
     * Check if form is enabled
     */
    get isEnabled() {
        return this.data.is_form_enabled || this.data.enabled || false;
    }

    /**
     * Get form schema
     */
    get schema() {
        return this.data.schema || {};
    }

    /**
     * Get form fields
     */
    get fields() {
        return this.schema.properties || {};
    }

    /**
     * Get form settings
     */
    get settings() {
        return this.data.form_settings || this.data.settings || {};
    }

    /**
     * Get success message
     */
    get successMessage() {
        return this.settings.success_message || 'Thank you for your submission!';
    }

    /**
     * Get submit button text
     */
    get submitButtonText() {
        return this.settings.submit_button_text || 'Submit';
    }

    /**
     * Get form description
     */
    get description() {
        return this.settings.description || '';
    }

    /**
     * Check if captcha is required
     */
    get requiresCaptcha() {
        return this.settings.requires_captcha || false;
    }

    /**
     * Get required fields
     */
    getRequiredFields() {
        const required = [];
        Object.entries(this.fields).forEach(([fieldName, fieldConfig]) => {
            if (fieldConfig.required) {
                required.push(fieldName);
            }
        });
        return required;
    }

    /**
     * Get field by name
     */
    getField(fieldName) {
        return this.fields[fieldName] || null;
    }

    /**
     * Check if field exists
     */
    hasField(fieldName) {
        return fieldName in this.fields;
    }

    /**
     * Get field type
     */
    getFieldType(fieldName) {
        const field = this.getField(fieldName);
        return field ? field.type : null;
    }

    /**
     * Check if field is required
     */
    isFieldRequired(fieldName) {
        const field = this.getField(fieldName);
        return field ? field.required || false : false;
    }

    /**
     * Get select field options
     */
    getFieldOptions(fieldName) {
        const field = this.getField(fieldName);
        if (!field || !['select', 'multi_select'].includes(field.type)) {
            return [];
        }
        return field.options || [];
    }

    /**
     * Generate empty form data object
     */
    getEmptyFormData() {
        const formData = {};
        Object.keys(this.fields).forEach(fieldName => {
            formData[fieldName] = '';
        });
        return formData;
    }

    /**
     * Convert to plain object
     */
    toObject() {
        return {
            name: this.name,
            slug: this.slug,
            enabled: this.isEnabled,
            schema: this.schema,
            settings: this.settings,
            fields: this.fields
        };
    }
}