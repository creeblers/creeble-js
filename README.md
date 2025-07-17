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

## API Reference

### Creeble Class

Main client class for interacting with the Creeble API.

#### Constructor
- `new Creeble(apiKey, baseUrl?, options?)`

#### Methods
- `ping()` - Test API connection
- `version()` - Get API version info
- `endpoint(name)` - Get endpoint helper

### Data Class

Access data endpoints.

#### Methods
- `get(endpoint, params?)` - Get all data
- `getById(endpoint, id)` - Get item by ID
- `paginate(endpoint, page?, limit?, params?)` - Get paginated data
- `search(endpoint, query, params?)` - Search data
- `filter(endpoint, filters?, params?)` - Filter data

### Projects Class

Access project information.

#### Methods
- `info()` - Get project information
- `endpoints()` - Get available endpoints

## Models

### DataItem
Represents a data item with helper methods.

### ProjectInfo
Represents project information with helper methods.

## Examples

See the `examples/` directory for more usage examples.

## License

MIT