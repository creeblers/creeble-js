import { Creeble } from '../src/index.js';

// Initialize the client
const client = new Creeble('napi_your_api_key_here');

async function performanceOptimizationExamples() {
    console.log('=== Performance Optimization Examples ===\n');

    const endpoint = 'your-endpoint-name';

    try {
        // 1. ⚡ FASTEST: Lightweight listing (IDs and titles only)
        console.log('1. Lightning Fast: Get IDs and titles only');
        console.time('Lightweight List');
        const lightweightData = await client.data.listLightweight(endpoint);
        console.timeEnd('Lightweight List');
        console.log(`Found ${lightweightData.data.length} items (minimal payload)`);
        console.log('Sample:', lightweightData.data[0]);
        console.log();

        // 2. 🎯 TARGETED: Get specific fields only
        console.log('2. Targeted Fields: Get only what you need');
        console.time('Specific Fields');
        const targetedData = await client.data.listFields(endpoint, ['id', 'title', 'created_at']);
        console.timeEnd('Specific Fields');
        console.log(`Found ${targetedData.data.length} items with selected fields`);
        console.log();

        // 3. 🚀 SMART: Auto-optimized pagination strategy
        console.log('3. Smart Pagination: Auto-choose best strategy');
        console.time('Smart Pagination');
        const smartData = await client.data.getAllPagesOptimized(endpoint, {}, {
            preferConcurrent: true,
            maxItems: 500  // Safety limit
        });
        console.timeEnd('Smart Pagination');
        console.log(`Smart strategy fetched ${smartData.length} total items`);
        console.log();

        // 4. ⚡ CONCURRENT: Parallel requests (fastest for large datasets)
        console.log('4. Concurrent Requests: Maximum speed for large datasets');
        console.time('Concurrent Pagination');
        const concurrentData = await client.data.getAllPagesConcurrent(endpoint, {}, 3);
        console.timeEnd('Concurrent Pagination');
        console.log(`Concurrent strategy fetched ${concurrentData.length} total items`);
        console.log();

        // 5. 🎯 FILTERED + CONCURRENT: Best of both worlds
        console.log('5. Filtered + Concurrent: Database filtering + parallel requests');
        console.time('Filtered Concurrent');
        const filteredConcurrentData = await client.data.getAllPagesConcurrent(endpoint, {
            type: 'rows',
            database: 'Posts'  // Server-side filtering
        });
        console.timeEnd('Filtered Concurrent');
        console.log(`Filtered concurrent fetched ${filteredConcurrentData.length} posts`);
        console.log();

        // 6. 📊 PERFORMANCE COMPARISON
        console.log('6. Performance Comparison: Different strategies');
        
        const strategies = [
            {
                name: 'Sequential (Default)',
                fn: () => client.data.getAllPages(endpoint)
            },
            {
                name: 'Concurrent (Fast)',
                fn: () => client.data.getAllPagesConcurrent(endpoint)
            },
            {
                name: 'Smart Auto-choose',
                fn: () => client.data.getAllPagesOptimized(endpoint)
            }
        ];

        for (const strategy of strategies) {
            console.time(strategy.name);
            try {
                const result = await strategy.fn();
                console.timeEnd(strategy.name);
                console.log(`  └─ Fetched ${result.length} items`);
            } catch (error) {
                console.timeEnd(strategy.name);
                console.log(`  └─ Error: ${error.message}`);
            }
        }
        console.log();

        // 7. 🔧 ENDPOINT HELPER METHODS
        console.log('7. Using Endpoint Helper for Cleaner Code');
        const posts = client.endpoint(endpoint);
        
        console.time('Helper Methods');
        // Get lightweight data
        const lightPosts = await posts.listLightweight({ type: 'rows', database: 'Posts' });
        // Get optimized all pages
        const allPosts = await posts.getAllPagesOptimized({ type: 'rows', database: 'Posts' });
        console.timeEnd('Helper Methods');
        
        console.log(`Helper methods: ${lightPosts.data.length} light, ${allPosts.length} total`);
        console.log();

        // 8. 📈 MEMORY EFFICIENT: Stream-like processing
        console.log('8. Memory Efficient: Process pages as they come');
        let processedCount = 0;
        let currentPage = 1;
        let hasMore = true;

        console.time('Stream Processing');
        while (hasMore) {
            const pageResponse = await client.data.paginate(endpoint, currentPage, 25, {
                type: 'rows',
                fields: 'id,title'  // Minimal fields
            });

            // Process each item immediately (memory efficient)
            pageResponse.data.forEach(item => {
                // Do something with each item
                processedCount++;
            });

            hasMore = pageResponse.pagination?.has_more_pages || false;
            currentPage++;

            // Break after reasonable limit for demo
            if (currentPage > 10) break;
        }
        console.timeEnd('Stream Processing');
        console.log(`Stream processed ${processedCount} items efficiently`);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Performance tips summary
function printPerformanceTips() {
    console.log('\n🚀 Performance Tips Summary:');
    console.log('1. Use listLightweight() for dropdowns/selectors');
    console.log('2. Use listFields() to specify only needed fields');
    console.log('3. Use getAllPagesOptimized() for automatic strategy selection');
    console.log('4. Use getAllPagesConcurrent() for large datasets (100+ items)');
    console.log('5. Always use server-side filtering (database, type params)');
    console.log('6. Use streaming/pagination for very large datasets');
    console.log('7. Leverage caching with consistent parameters');
    console.log('8. Use endpoint helpers for cleaner code');
}

// Run examples
performanceOptimizationExamples().then(() => {
    printPerformanceTips();
});