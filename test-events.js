const { createClient } = require('@sanity/client');

// Test with hardcoded values (what's in the code)
const client = createClient({
  projectId: 'yf9xyatc',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function testEvents() {
  console.log('🧪 Testing Sanity Connection...\n');
  console.log('Project ID:', 'yf9xyatc');
  console.log('Dataset:', 'production');
  console.log('---\n');

  try {
    const query = '*[_type == "event" && defined(publishedAt)] | order(date desc) { title, date, location, publishedAt }';
    const events = await client.fetch(query);
    
    console.log(`✅ Found ${events.length} events in Sanity!\n`);
    
    if (events.length > 0) {
      console.log('📅 Sample events:');
      events.slice(0, 5).forEach((event, i) => {
        console.log(`  ${i + 1}. ${event.title}`);
        console.log(`     Date: ${event.date}`);
        console.log(`     Location: ${event.location}`);
        console.log('');
      });
      
      // Check upcoming events
      const now = new Date().toISOString();
      const upcoming = events.filter(e => e.date >= now);
      console.log(`🔮 ${upcoming.length} upcoming events`);
      console.log(`📚 ${events.length - upcoming.length} past events\n`);
      
      // Check by location
      const suydam = events.filter(e => e.location === 'suydam');
      const bogart = events.filter(e => e.location === 'bogart');
      console.log(`📍 Suydam: ${suydam.length} events`);
      console.log(`📍 Bogart: ${bogart.length} events\n`);
      
      console.log('✅ Everything looks good! Events are in Sanity.');
      console.log('\n❗️ If you don\'t see them on the website:');
      console.log('   1. Add environment variables to Vercel:');
      console.log('      - NEXT_PUBLIC_SANITY_PROJECT_ID = yf9xyatc');
      console.log('      - NEXT_PUBLIC_SANITY_DATASET = production');
      console.log('      - NEXT_PUBLIC_SANITY_API_VERSION = 2024-01-01');
      console.log('   2. Redeploy on Vercel');
      console.log('   3. Visit https://temp-erf.vercel.app/events\n');
    } else {
      console.log('❌ No events found. Something went wrong.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEvents();
