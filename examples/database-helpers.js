import { Creeble } from '../src/index.js';

// Initialize the client
const client = new Creeble('napi_your_api_key_here');
const endpointName = 'your-endpoint-name';

async function exampleDatabaseHelpers() {
    try {
        console.log('=== Database Helper Examples ===\n');

        // 1. Get available databases
        console.log('1. Getting available databases...');
        const databaseNames = await client.getDatabaseNames(endpointName);
        console.log('Available databases:', databaseNames);
        console.log();

        // 2. Get all rows from a specific database
        console.log('2. Getting rows from Posts database...');
        const posts = await client.getRowsByDatabase(endpointName, 'Posts');
        console.log(`Found ${posts.length} posts`);
        posts.forEach(post => {
            console.log(`- ${post.title} (${post.properties?.slug?.value || 'no-slug'})`);
        });
        console.log();

        // 3. Get a specific row by field
        console.log('3. Finding specific post by slug...');
        const specificPost = await client.getRowByField(endpointName, 'Posts', 'slug', 'my-post-slug');
        if (specificPost) {
            console.log('Found post:', specificPost.title);
        } else {
            console.log('Post not found');
        }
        console.log();

        // 4. Get all rows from all databases
        console.log('4. Getting all rows from all databases...');
        const allRows = await client.getAllRows(endpointName);
        console.log(`Total rows across all databases: ${allRows.length}`);
        
        // Group by database
        const byDatabase = {};
        allRows.forEach(row => {
            if (!byDatabase[row.database]) {
                byDatabase[row.database] = [];
            }
            byDatabase[row.database].push(row);
        });
        
        Object.entries(byDatabase).forEach(([dbName, rows]) => {
            console.log(`- ${dbName}: ${rows.length} rows`);
        });
        console.log();

        // 5. Transform to simpler format
        console.log('5. Transforming posts to simpler format...');
        const simplePosts = posts.map(post => Creeble.simplifyItem(post));
        console.log('Simplified post example:');
        if (simplePosts[0]) {
            console.log(JSON.stringify(simplePosts[0], null, 2));
        }
        console.log();

        // 6. Using endpoint helper methods
        console.log('6. Using endpoint helper methods...');
        const endpoint = client.endpoint(endpointName);
        
        const endpointPosts = await endpoint.getRowsByDatabase('Posts');
        console.log(`Posts via endpoint helper: ${endpointPosts.length}`);
        
        const endpointDbNames = await endpoint.getDatabaseNames();
        console.log('Database names via endpoint helper:', endpointDbNames);
        console.log();

        // 7. Filter and transform workflow
        console.log('7. Complete workflow example...');
        const publishedPosts = allRows
            .filter(row => row.database === 'Posts')
            .filter(row => row.properties?.published?.value === true)
            .map(post => ({
                title: post.title,
                slug: post.properties?.slug?.value,
                excerpt: post.properties?.excerpt?.value,
                content: post.html_content,
                published_date: post.properties?.published_date?.value
            }));
        
        console.log(`Found ${publishedPosts.length} published posts`);
        publishedPosts.forEach(post => {
            console.log(`- ${post.title} (${post.slug})`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the example
exampleDatabaseHelpers();