# Creeble JavaScript SDK

A JavaScript SDK for interacting with the Creeble API.

## Installation

Since this is a local package, you can import it directly:

```javascript
import { Creeble } from './src/index.js';
```

## Quick Start

```javascript
import { Creeble } from 'creeble-js';

// Initialize the client
const client = new Creeble('napi_your_api_key_here');

// Test connection
const status = await client.ping();
console.log(status);

// Get data from an endpoint
const data = await client.data.get('your-endpoint-name');
console.log(data);
```

## Configuration

```javascript
const client = new Creeble(
    'napi_your_api_key_here',
    'https://your-domain.com', // Optional: custom base URL
    {
        timeout: 30000 // Optional: request timeout in milliseconds
    }
);
```

## Data Access

### Get All Data
```javascript
const data = await client.data.get('endpoint-name');
```

### Get by ID
```javascript
const item = await client.data.getById('endpoint-name', 'item-id');
```

### Pagination
```javascript
const page1 = await client.data.paginate('endpoint-name', 1, 20);
const page2 = await client.data.paginate('endpoint-name', 2, 20);
```

### Search
```javascript
const results = await client.data.search('endpoint-name', 'search term');
```

### Filter
```javascript
const filtered = await client.data.filter('endpoint-name', {
    status: 'active',
    category: 'important'
});
```

### Using Endpoint Helper
```javascript
const endpoint = client.endpoint('products');

const products = await endpoint.get();
const product = await endpoint.getById('123');
const searchResults = await endpoint.search('laptop');
```

## Project Information

```javascript
// Get current project info
const info = await client.projects.info();

// Get available endpoints
const endpoints = await client.projects.endpoints();
```

## Error Handling

```javascript
try {
    const data = await client.data.get('endpoint-name');
} catch (error) {
    if (error.name === 'AuthenticationException') {
        console.error('Invalid API key');
    } else if (error.name === 'RateLimitException') {
        console.error(`Rate limited. Retry after ${error.retryAfter} seconds`);
    } else if (error.name === 'ValidationException') {
        console.error('Validation errors:', error.errors);
    } else {
        console.error('API error:', error.message);
    }
}
```

## Forms

Submit data to Creeble forms (databases with bracketed titles like [Contact Form]).

### Get Form Information
```javascript
// Get form schema and settings
const form = await client.forms.getForm('project-endpoint', 'contact');
console.log(form.schema); // Field definitions
console.log(form.form_settings); // Form configuration
```

### Submit Form Data
```javascript
// Simple form submission
const response = await client.forms.submit('project-endpoint', 'contact', {
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello!'
});

console.log('Submission ID:', response.submission_id);
```

### Submit with Validation
```javascript
// Validate before submitting
try {
    const response = await client.forms.submitWithValidation('project-endpoint', 'contact', {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1234567890'
    });
    console.log('Form submitted successfully!');
} catch (error) {
    if (error.errors) {
        console.error('Validation errors:', error.errors);
    }
}
```

### Working with Form Model
```javascript
// Use the Form model for easier access
const formData = await client.forms.getForm('project-endpoint', 'contact');
const form = new Form(formData);

console.log('Form name:', form.name);
console.log('Required fields:', form.getRequiredFields());
console.log('Is email required?', form.isFieldRequired('email'));

// Get empty form template
const template = form.getEmptyFormData();
```

## API Reference

### Creeble Class

Main client class for interacting with the Creeble API.

#### Constructor
- `new Creeble(apiKey, baseUrl?, options?)`

#### Properties
- `data` - Data endpoint methods
- `projects` - Project information methods
- `forms` - Form submission methods

#### Methods
- `ping()` - Test API connection
- `version()` - Get API version info
- `endpoint(name)` - Get endpoint helper

### Data Class

Access data endpoints.

#### Methods
- `list(endpoint, params?)` - Get all data
- `get(endpoint, id)` - Get item by ID
- `paginate(endpoint, page?, limit?, params?)` - Get paginated data
- `search(endpoint, query, params?)` - Search data
- `filter(endpoint, filters?)` - Filter data
- `sortBy(endpoint, field, direction?, filters?)` - Sort data
- `recent(endpoint, limit?)` - Get recent items
- `exists(endpoint, id)` - Check if item exists

### Projects Class

Access project information.

#### Methods
- `info()` - Get project information
- `endpoints()` - Get available endpoints

### Forms Class

Handle form submissions.

#### Methods
- `getForm(endpoint, formSlug)` - Get form schema and settings
- `submit(endpoint, formSlug, formData)` - Submit form data
- `getSchema(endpoint, formSlug)` - Get form schema only
- `submitWithValidation(endpoint, formSlug, formData)` - Submit with client-side validation
- `validateFormData(schema, formData)` - Validate form data locally

## Models

### DataItem
Represents a data item with helper methods.

### ProjectInfo
Represents project information with helper methods.

### Form
Represents a form configuration with schema and settings.

#### Properties
- `name` - Form name
- `slug` - Form URL slug
- `isEnabled` - Whether form is enabled
- `schema` - Form field schema
- `fields` - Form field definitions
- `settings` - Form configuration settings
- `successMessage` - Success message text
- `submitButtonText` - Submit button text
- `description` - Form description
- `requiresCaptcha` - Whether captcha is required

#### Methods
- `getRequiredFields()` - Get array of required field names
- `getField(fieldName)` - Get field definition
- `hasField(fieldName)` - Check if field exists
- `getFieldType(fieldName)` - Get field type
- `isFieldRequired(fieldName)` - Check if field is required
- `getFieldOptions(fieldName)` - Get options for select/multi-select fields
- `getEmptyFormData()` - Generate empty form data object
- `toObject()` - Convert to plain object

## Examples

See the `examples/` directory for more usage examples.

## License

MIT