const {createClient} = require('@sanity/client');

const client = createClient({
  projectId: 'yf9xyatc',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skIE8ucBP6MuxAkII7TCHij4zo1GAsofgkQpeKBC7O61G13QcOoefZ47gktfXqolCJqLSjazkEfU84BJDcsX0tEPkKZKUBmIoiUqNBPnGxnQA1HsJswfddnqaUvb3LwubpT8VBrHN8R8hFexnD6LhIWVxlPPpzmz6zZK1ENeS0220ICsRAKK',
  useCdn: false,
});

// Corrected event data extracted from actual flyers
const corrections = [
  {
    _id: '5r2rUVRLVnDZPBZpl8UhNN',
    title: 'The Corpse Roof',
    date: '2023-10-19T19:30:00Z',
    description: 'Live music + art show. Thursday Oct 19th, 7:30pm - Midnight.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: 'mA0q6UlqcUFTfarJUJAg8Y',
    title: 'Black Friday Flea Market',
    date: '2023-11-24T15:00:00Z',
    description: 'November 24th, 3PM - 10PM. Live music, DJs all day. 59-14 70th Ave, Ridgewood.',
    location: 'other',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: 'z6Pp1aK3kMpAgHzgebNaYm',
    title: 'Turris Mors',
    date: '2023-12-09T23:00:00Z',
    description: 'December 9th, 11pm - 2am. $13 adv / $15 door. Purgatory BK, 675 Central Ave, Brooklyn.',
    location: 'other',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: '4I4Ipw1sMYwJMolHpjfGDH',
    title: 'Grand Opening - Artist Resident Showcase',
    date: '2024-01-27T16:00:00Z',
    description: 'January 27th, 4PM - 8PM. FREE! 349 Suydam St 3L, Brooklyn.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: '5r2rUVRLVnDZPBZpl8Ui7v',
    title: 'Meadow - Spring Showcase',
    date: '2024-03-16T20:00:00Z',
    description: 'March 16th. Doors 8pm, Show 9pm. The Broadway, 1272 Broadway, Brooklyn. Age 21+. $12 advance / $15 at door.',
    location: 'other',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: '5r2rUVRLVnDZPBZpl8Ujgn',
    title: 'Screen Printing Class',
    date: '2024-04-27T15:00:00Z',
    description: 'Saturday April 27th, 3pm - 6pm. $90 ticket. All materials provided. Limited to 15 slots.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: 'z6Pp1aK3kMpAgHzgebSCW0',
    title: "Rothko's Clothing Swap",
    date: '2024-05-12T15:00:00Z',
    description: 'Sunday May 12th, 3PM. FREE! Bring something or nothing, take clothes.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: '5r2rUVRLVnDZPBZpl8UnDh',
    title: 'Book Making Workshop',
    date: '2024-08-03T12:00:00Z',
    description: 'August 3, 12-2PM. $15/person. Create your own hardcover accordion book. 349 Suydam St #3L.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: 'z6Pp1aK3kMpAgHzgebXoas',
    title: 'Group Critique',
    date: '2024-10-06T18:00:00Z',
    description: 'Sunday Oct 6, 6pm. 349 Suydam St. Bring one artwork/project idea to share and discuss.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: 'mA0q6UlqcUFTfarJUJHY3K',
    title: 'Super Smash Bros Tournament',
    date: '2024-12-16T19:00:00Z',
    description: 'December 16, 7pm. $10 buy in. 349 Suydam St.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: 'mA0q6UlqcUFTfarJUJHZXa',
    title: 'Silky - Valentine\'s Day Market',
    date: '2025-02-01T12:00:00Z',
    description: 'Saturday February 1st, 12PM - 5PM. Leatherqueer market. 349 Suydam St, BK. Masks required.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: 'z6Pp1aK3kMpAgHzgebXwP8',
    title: 'Andean Clay Flute Workshop',
    date: '2025-02-12T18:00:00Z',
    description: 'February 12, 6-7pm. $25. 349 Suydam, Brooklyn.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: 'mA0q6UlqcUFTfarJUJHcNi',
    title: 'Suncatcher Workshop',
    date: '2025-03-13T19:00:00Z',
    description: 'Thursday March 13th, 7-9:30PM. $12 - Supplies included. 349 Suydam St #3L, Brooklyn.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: 'mA0q6UlqcUFTfarJUJOpwQ',
    title: 'Headache - 3rdStory Grand Opening',
    date: '2025-10-11T19:00:00Z',
    endDate: '2025-11-08T22:00:00Z',
    description: 'Opening Saturday October 11, 7-10pm. On view thru November 8th. 349 Suydam St 3R, BK.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: 'zSR4n9tjRkutI7s2sKWhtY',
    title: 'HouseWarming - Pushup Gallery',
    date: '2025-11-09T16:00:00Z',
    description: 'Sunday Nov 9th, 4-10PM. Small works exhibition. 94 Bogart St, Brooklyn.',
    location: 'bogart',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: 'mA0q6UlqcUFTfarJUJP12A',
    title: 'Creative Coworking Night',
    date: '2025-11-13T19:30:00Z',
    description: 'Thursday 11/13, 7:30pm - 10pm. $8 suggested donation. 349 Suydam St #3L.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: 'd66JoR737dB5btLi9x5WIu',
    title: '2026 Vision Board Workshop',
    date: '2025-12-27T13:00:00Z',
    description: 'Saturday 12/27, 1-5:30pm. Materials, snacks and 1 drink included. 349 Suydam St 3L.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  },
  {
    _id: 'z6Pp1aK3kMpAgHzgebiHb8',
    title: 'Party with Jesus',
    date: '2026-01-10T21:00:00Z',
    description: 'January 10th, 9PM - Late. $10-25 tickets. ErF World, Bushwick, BK.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/erf.nyc/'
  }
];

// IDs to delete (duplicates)
const duplicatesToDelete = [
  '4I4Ipw1sMYwJMolHpiqRrv', // duplicate "turris mors"
  'mA0q6UlqcUFTfarJUHo3XC', // duplicate "Book Making Workshop"
];

async function fixEvents() {
  console.log('\n🔧 Starting event corrections...\n');
  
  // First, delete duplicates
  console.log('🗑️  Removing duplicates...');
  for (const id of duplicatesToDelete) {
    try {
      await client.delete(id);
      console.log(`   ✅ Deleted duplicate: ${id}`);
    } catch (err) {
      console.log(`   ⚠️  Could not delete ${id}: ${err.message}`);
    }
  }
  
  // Then update events with corrections
  console.log('\n📝 Updating events with corrections...\n');
  
  for (const correction of corrections) {
    try {
      const patch = client.patch(correction._id);
      
      patch.set({
        title: correction.title,
        date: correction.date,
        description: correction.description,
        location: correction.location,
        instagramUrl: correction.instagramUrl,
      });
      
      if (correction.endDate) {
        patch.set({ endDate: correction.endDate });
      }
      
      await patch.commit();
      console.log(`   ✅ Updated: "${correction.title}"`);
    } catch (err) {
      console.log(`   ❌ Failed: "${correction.title}" - ${err.message}`);
    }
  }
  
  console.log('\n✅ Event corrections complete!\n');
}

fixEvents();
