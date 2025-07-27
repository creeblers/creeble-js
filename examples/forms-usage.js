import Creeble from '../src/index.js';

// Initialize Creeble client
const creeble = new Creeble('your-api-key', 'https://creeble.io');

// Example 1: Get form schema
async function getFormSchema() {
    try {
        const form = await creeble.forms.getForm('test-project', 'contact');
        console.log('Form name:', form.form_name);
        console.log('Form fields:', form.schema.properties);
        console.log('Form settings:', form.form_settings);
    } catch (error) {
        console.error('Error fetching form:', error);
    }
}

// Example 2: Submit form data
async function submitForm() {
    try {
        const formData = {
            name: 'John Doe',
            email: 'john@example.com',
            message: 'Hello, I have a question about your service.'
        };

        const response = await creeble.forms.submit('test-project', 'contact', formData);
        console.log('Form submitted successfully!');
        console.log('Submission ID:', response.submission_id);
        console.log('Created at:', response.created_at);
    } catch (error) {
        console.error('Error submitting form:', error);
        if (error.errors) {
            console.error('Validation errors:', error.errors);
        }
    }
}

// Example 3: Submit form with validation
async function submitFormWithValidation() {
    try {
        const formData = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '+1234567890',
            message: 'I would like to schedule a demo.'
        };

        // This method validates the form data before submitting
        const response = await creeble.forms.submitWithValidation('test-project', 'contact', formData);
        console.log('Form submitted successfully with validation!');
        console.log('Response:', response);
    } catch (error) {
        console.error('Form submission failed:', error);
        if (error.errors) {
            console.error('Validation errors:', error.errors);
        }
    }
}

// Example 4: Working with Form model
async function workWithFormModel() {
    try {
        const formData = await creeble.forms.getForm('test-project', 'contact');
        const form = new creeble.Form(formData);

        console.log('Form name:', form.name);
        console.log('Form slug:', form.slug);
        console.log('Is enabled:', form.isEnabled);
        console.log('Required fields:', form.getRequiredFields());
        console.log('Success message:', form.successMessage);

        // Check specific field
        if (form.hasField('email')) {
            console.log('Email field type:', form.getFieldType('email'));
            console.log('Email is required:', form.isFieldRequired('email'));
        }

        // Get empty form data template
        const emptyForm = form.getEmptyFormData();
        console.log('Empty form template:', emptyForm);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Example 5: Handle form with select options
async function handleSelectField() {
    try {
        const formData = await creeble.forms.getForm('test-project', 'survey');
        const form = new creeble.Form(formData);

        // Get options for select field
        const categoryOptions = form.getFieldOptions('category');
        console.log('Category options:', categoryOptions);

        // Submit with selected option
        const submission = {
            name: 'User Name',
            email: 'user@example.com',
            category: categoryOptions[0]?.name || 'General',
            feedback: 'Great service!'
        };

        const response = await creeble.forms.submit('test-project', 'survey', submission);
        console.log('Survey submitted:', response);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Example 6: Custom validation before submission
async function customValidation() {
    try {
        const form = await creeble.forms.getForm('test-project', 'application');
        
        const formData = {
            name: 'John Smith',
            email: 'invalid-email', // Invalid email
            phone: '123', // Too short
            website: 'not-a-url' // Invalid URL
        };

        // Validate locally
        const validation = creeble.forms.validateFormData(form.schema, formData);
        
        if (!validation.valid) {
            console.log('Validation failed!');
            console.log('Errors:', validation.errors);
            return;
        }

        // Only submit if valid
        const response = await creeble.forms.submit('test-project', 'application', formData);
        console.log('Application submitted:', response);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run examples
(async () => {
    console.log('=== Form Schema Example ===');
    await getFormSchema();
    
    console.log('\n=== Form Submission Example ===');
    await submitForm();
    
    console.log('\n=== Form Model Example ===');
    await workWithFormModel();
})();