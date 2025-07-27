import { ValidationException } from '../exceptions/index.js';

/**
 * Forms endpoint for submitting data to Creeble forms
 */
export class Forms {
    constructor(client) {
        this.client = client;
    }

    /**
     * Get form schema and settings
     */
    async getForm(endpoint, formSlug) {
        return await this.client.get(`/v1/${endpoint}/forms/${formSlug}`);
    }

    /**
     * Submit data to a form
     */
    async submit(endpoint, formSlug, formData) {
        return await this.client.post(`/v1/${endpoint}/forms/${formSlug}`, formData);
    }

    /**
     * Get form information including fields and validation rules
     */
    async getSchema(endpoint, formSlug) {
        const response = await this.getForm(endpoint, formSlug);
        return response.schema || response;
    }

    /**
     * Validate form data locally before submission
     */
    validateFormData(schema, formData) {
        const errors = {};
        
        // Check required fields
        if (schema.properties) {
            Object.entries(schema.properties).forEach(([fieldName, fieldConfig]) => {
                if (fieldConfig.required && !formData[fieldName]) {
                    errors[fieldName] = [`The ${fieldName} field is required.`];
                }
                
                // Validate field types
                if (formData[fieldName]) {
                    const value = formData[fieldName];
                    
                    switch (fieldConfig.type) {
                        case 'email':
                            if (!this.isValidEmail(value)) {
                                errors[fieldName] = errors[fieldName] || [];
                                errors[fieldName].push(`The ${fieldName} must be a valid email address.`);
                            }
                            break;
                            
                        case 'url':
                            if (!this.isValidUrl(value)) {
                                errors[fieldName] = errors[fieldName] || [];
                                errors[fieldName].push(`The ${fieldName} must be a valid URL.`);
                            }
                            break;
                            
                        case 'number':
                            if (isNaN(value)) {
                                errors[fieldName] = errors[fieldName] || [];
                                errors[fieldName].push(`The ${fieldName} must be a number.`);
                            }
                            break;
                            
                        case 'phone_number':
                            if (!this.isValidPhone(value)) {
                                errors[fieldName] = errors[fieldName] || [];
                                errors[fieldName].push(`The ${fieldName} must be a valid phone number.`);
                            }
                            break;
                    }
                }
            });
        }
        
        return {
            valid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Submit form with validation
     */
    async submitWithValidation(endpoint, formSlug, formData) {
        // Get form schema first
        const form = await this.getForm(endpoint, formSlug);
        
        // Validate locally
        const validation = this.validateFormData(form.schema, formData);
        if (!validation.valid) {
            throw new ValidationException('Form validation failed', validation.errors);
        }
        
        // Submit if valid
        return await this.submit(endpoint, formSlug, formData);
    }

    /**
     * Email validation helper
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * URL validation helper
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Phone validation helper
     */
    isValidPhone(phone) {
        // Basic phone validation - can be enhanced based on requirements
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }
}