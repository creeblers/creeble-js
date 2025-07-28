import { Creeble } from '../src/index.js';

// Initialize the client
const client = new Creeble('napi_your_api_key_here');

// Example: Basic usage
async function basicExample() {
    try {
        // Test connection
        const pingResponse = await client.ping();
        console.log('API Status:', pingResponse);

        // Get project information
        const projectInfo = await client.projects.info('your-endpoint-name');
        console.log('Project Info:', projectInfo);

        // Get project schema
        const schema = await client.projects.schema('your-endpoint-name');
        console.log('Schema:', schema);

        // List all data from endpoint
        const data = await client.data.list('your-endpoint-name');
        console.log('Data:', data);

        // Get specific item by ID
        const item = await client.data.get('your-endpoint-name', 'item-id');
        console.log('Item:', item);

        // Search data
        const searchResults = await client.data.search('your-endpoint-name', 'search term');
        console.log('Search Results:', searchResults);

        // Paginate through data
        const paginatedData = await client.data.paginate('your-endpoint-name', 1, 10);
        console.log('Paginated Data:', paginatedData);

        // Filter data
        const filteredData = await client.data.filter('your-endpoint-name', {
            status: 'active',
            category: 'important'
        });
        console.log('Filtered Data:', filteredData);

        // Sort data
        const sortedData = await client.data.sortBy('your-endpoint-name', 'created_at', 'desc');
        console.log('Sorted Data:', sortedData);

        // Get recent items
        const recentData = await client.data.recent('your-endpoint-name', 5);
        console.log('Recent Data:', recentData);

        // Find single item by field value
        const aboutPage = await client.data.findBy('your-endpoint-name', 'slug', 'about');
        console.log('About Page:', aboutPage);

        // Find specific page by field
        const publishedPost = await client.data.findPageBy('your-endpoint-name', 'status', 'published');
        console.log('Published Post:', publishedPost);

        // Find specific row by field
        const activeProduct = await client.data.findRowBy('your-endpoint-name', 'status', 'active');
        console.log('Active Product:', activeProduct);

    } catch (error) {
        console.error('Error:', error.message);
        
        if (error.name === 'AuthenticationException') {
            console.error('Authentication failed. Check your API key.');
        } else if (error.name === 'RateLimitException') {
            console.error(`Rate limit exceeded. Retry after ${error.retryAfter} seconds.`);
        }
    }
}

// Example: Using endpoint helper
async function endpointExample() {
    try {
        const endpoint = client.endpoint('products');
        
        // List all products
        const products = await endpoint.list();
        console.log('Products:', products);
        
        // Search products
        const searchResults = await endpoint.search('laptop');
        console.log('Search Results:', searchResults);
        
        // Get product by ID
        const product = await endpoint.get('product-123');
        console.log('Product:', product);
        
        // Get recent products
        const recentProducts = await endpoint.recent(5);
        console.log('Recent Products:', recentProducts);
        
        // Sort products by price
        const sortedProducts = await endpoint.sortBy('price', 'asc');
        console.log('Sorted Products:', sortedProducts);
        
        // Find product by SKU
        const productBySku = await endpoint.findBy('sku', 'LAPTOP-001');
        console.log('Product by SKU:', productBySku);
        
        // Find featured product
        const featuredProduct = await endpoint.findRowBy('featured', 'true');
        console.log('Featured Product:', featuredProduct);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run examples
basicExample();
endpointExample();