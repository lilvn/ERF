const {createClient} = require('@sanity/client');

const client = createClient({
  projectId: 'yf9xyatc',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skIE8ucBP6MuxAkII7TCHij4zo1GAsofgkQpeKBC7O61G13QcOoefZ47gktfXqolCJqLSjazkEfU84BJDcsX0tEPkKZKUBmIoiUqNBPnGxnQA1HsJswfddnqaUvb3LwubpT8VBrHN8R8hFexnD6LhIWVxlPPpzmz6zZK1ENeS0220ICsRAKK',
  useCdn: false,
});

// Map of Sanity image URL hash -> correct event data
// These were manually verified by examining each flyer image
const corrections = {
  // Party with Jesus - Jan 10, 2026
  'f8c56a92b3de79b0dd61454a28e5f7b004e6422b': {
    title: 'Party with Jesus',
    date: '2026-01-10T21:00:00Z',
    description: 'January 10th, 9PM - Late. $10-25 tickets on Eventbrite. Featuring DJ PJ. ErF World, Bushwick, BK.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DECi6YOPNHU/'
  },
  // Winter Market Open Call - deadline Jan 10
  '1d05b51b3b06a48eb5472987eec16e8cebc2a770': {
    title: 'Winter Market Open Call',
    date: '2026-01-10T12:00:00Z',
    description: 'Winter Market January 2026, Brooklyn NY. $50/table - form in bio. Submission deadline: 1.10.26',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DDvF9qmvYI-/'
  },
  // 2026 Vision Board Workshop
  '8a0439d015e782fed771dcc3a7ca578808c419fb': {
    title: '2026 Vision Board Workshop',
    date: '2025-12-27T13:00:00Z',
    description: 'Saturday 12/27, 1-5:30pm. Materials, snacks and 1 drink included. 349 Suydam St 3L.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DD3pxNZvJg_/'
  },
  // Next Crit - Dec 21
  '10a278b282ed3ad84eaa32b5e05c6bd2c3964a80': {
    title: 'Next Crit - In Person',
    date: '2025-12-21T18:00:00Z',
    description: 'Sunday Dec 21, 6pm. We will break into small groups. All are welcome! No institution required. Please bring a work in progress for genuine quality feedback! 349 Suydam St 3L.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DDljQrSOcAE/'
  },
  // Raven Grey Designs Jewelry Pop Up
  '94e4d4849d340287281beab677a059a5b94f8eb2': {
    title: 'Raven Grey Designs Jewelry Pop Up',
    date: '2025-12-19T17:00:00Z',
    endDate: '2025-12-20T19:00:00Z',
    description: 'Jewelry pop-up shop. Friday 12/19 5pm-9pm, Saturday 12/20 1pm-7pm. ERF Studios, 94 Bogart St, Brooklyn, NY 11206, 2nd Floor.',
    location: 'bogart',
    instagramUrl: 'https://www.instagram.com/p/DDhwm4kOvNU/'
  },
  // M Shimek - Family Inheritance
  '8dac5ece6030ef761df3b8a2e3fb8d3b5f5cdc3e': {
    title: 'M Shimek - Family Inheritance',
    date: '2025-12-12T19:00:00Z',
    endDate: '2026-01-17T17:00:00Z',
    description: 'Art exhibition at Pushup Gallery. Opening reception December 12, 7-10pm. On view through January 17, 2026.',
    location: 'bogart',
    instagramUrl: 'https://www.instagram.com/p/DDYz9C0uJFE/'
  },
  // Good English Presents
  '674d96dc9abd584133a1b42509bb2a92d3077d4d': {
    title: 'Good English Presents - An Evening at ERF',
    date: '2025-12-05T19:00:00Z',
    description: '$15. Featuring Melaina Kol, People I Love (singles release), Avsha. At 1 Ingraham St, Brooklyn.',
    location: 'other',
    instagramUrl: 'https://www.instagram.com/p/DDH1DGLufwE/'
  },
  // Creative Coworking Night
  'e530dfe1b13e3cf3255c217d7f1ac6855b429a47': {
    title: 'Creative Coworking Night',
    date: '2025-11-13T19:30:00Z',
    description: 'Thursday 11/13, 7:30pm - 10pm. $8 suggested donation. 349 Suydam St #3L.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DCZyxvMuJVf/'
  },
  // HouseWarming - Pushup Gallery
  '6fa14b1a74ca1bae634edd83ae0da441b534fe45': {
    title: 'HouseWarming - Pushup Gallery',
    date: '2025-11-09T16:00:00Z',
    description: 'Sunday Nov 9th, 4-10PM. Small works exhibition. 94 Bogart St, Brooklyn.',
    location: 'bogart',
    instagramUrl: 'https://www.instagram.com/p/DCQpM3RO7LV/'
  },
  // Headache - 3rdStory Grand Opening
  '7fca71706c71dc7360bc6339098eb20a1d5a7419': {
    title: 'Headache - 3rdStory Grand Opening',
    date: '2025-10-11T19:00:00Z',
    endDate: '2025-11-08T17:00:00Z',
    description: 'Opening Saturday October 11, 7-10pm. On view through November 8th. Saturdays & Sundays 11am-5pm. 349 Suydam St 3R, BK.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DBzyHd2ueQC/'
  },
  // Head Shots w/ Johnny Fort
  '9daf6487a971447468884526e954e9493e094dce': {
    title: 'Head Shots w/ Johnny Fort',
    date: '2025-10-05T13:00:00Z',
    description: 'HEAD SHOTS w/ JOHNNY FORT - FILM & DIGITAL. Oct 5, 1-4 PM, $10, with Crit Club after. ErF World, 349 Suydam St #3L, Brooklyn.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DBpzBykO5yc/'
  },
  // Fat Dino's Open Office Hours
  '4689b6c3f45c8f31411103335c0b57d2f68cb918': {
    title: "Fat Dino's Open Office Hours",
    date: '2025-09-08T19:00:00Z',
    description: "FAT DINO'S OPEN OFFICE HOURS. Monday 9/8 @ 7-10PM. Free entry / free coffee. Come network, body-double, and chill with other local creatives + professionals! 349 Suydam St #3L.",
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DBa3v2VOsYy/'
  },
  // Booty Shorts Workshop
  '90126f724ffbafe09d5361d3fcb761f7d701c4a5': {
    title: 'Booty Shorts Workshop',
    date: '2025-08-07T18:30:00Z',
    description: 'Comadre Crafts - BOOTY SHORTS WORKSHOP. Thursday Aug 7th, 6:30-9:30pm, $15 Advance. Bedazzle and personalize your own pair of shorts. ErF World, 349 Suydam Street, Brooklyn NY.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DAr5QDRO6Uo/'
  },
  // Queer Talks - The Art of Being a Diva
  'cd6265b4ee4c7d0b6221c341d1eb8570dbdf00a0': {
    title: 'Queer Talks - The Art of Being a Diva',
    date: '2025-06-26T14:00:00Z',
    description: 'QUEER TALKS: "The Art of Being a Diva: Choosing Yourself as a Lifestyle & Practice." Presentation, snacks, & zines. $15 advance. Doors open @ 2PM, Thursday 6/26, 349 Suydam St #3L.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/C_r5sNZOqrS/'
  },
  // Cathartic Writing Workshop
  '05e32e98e1875089b06a72cb30c8ff96380b40cf': {
    title: 'Cathartic Writing Workshop',
    date: '2025-04-01T19:30:00Z',
    description: 'FAT DINO x ERF WORLD PRESENT... CATHARTIC WRITING. Every Tuesday! $15, 7:30-9:30pm. In person Crit Club.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/C-hNzPWO_Y4/'
  },
  // Suncatcher Workshop
  '065342f2cabbe7fe09be23fe7714e3f3dd1f361f': {
    title: 'Suncatcher Workshop',
    date: '2025-03-13T19:00:00Z',
    description: 'Thursday March 13th, 7-9:30PM. $12 - Supplies included. 349 Suydam St #3L, Brooklyn.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/C-PFLyLOqL3/'
  },
  // Andean Clay Flute Workshop
  'a9ded6fe3c1ca2516701efa398500aad9c6951e1': {
    title: 'Andean Clay Flute Workshop',
    date: '2025-02-12T18:00:00Z',
    description: 'February 12, 6-7pm. $25. 349 Suydam, Brooklyn.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/C9wYv9bOOz4/'
  },
  // Silky - Valentine's Day Market
  'e2cfeb87cf05be67cc41d7736865227ca34ccd6e': {
    title: "Silky - Valentine's Day Market",
    date: '2025-02-01T12:00:00Z',
    description: 'Saturday February 1st, 12PM - 5PM. Leatherqueer market. 349 Suydam St, BK. Masks required.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/C9h8N_VO5F0/'
  },
  // Handmade Rose Bouquets - Feb 1 2026 (future)
  'e3748712c71765dcf47c68bc64c5bbf61bccada5': {
    title: 'Handmade Rose Bouquets',
    date: '2026-02-01T11:00:00Z',
    description: 'Hosted by SEWCIAL CLUB. RSVP on Posh. 02/01/2026, 11AM-7PM. 94 Bogart Street, Brooklyn NY, FL2 #212.',
    location: 'bogart',
    instagramUrl: 'https://www.instagram.com/p/DDxx7q0OV-u/'
  },
  // Lower The Heavens - NYE
  'c08959e3479d039e5ba499a3cae5bf70a20174b2': {
    title: 'Lower The Heavens - A New Years Special',
    date: '2024-12-31T19:00:00Z',
    description: 'December 31, 7pm. All night warehouse party at 1 Ingraham St. Live Ball Drop, Champagne Toast, Balloon Drop, Free Coat Check. $40. Featuring 84 A Lana, WORLD KRYSIS, K2. HOUSE/TECHNO/JUNGLE/DISCO.',
    location: 'other',
    instagramUrl: 'https://www.instagram.com/p/DDR8sYaOqSz/'
  },
  // Vinyasa Yoga & Breath Work
  '8e90f276a0498399e0178f40e03928f5e0043a44': {
    title: 'Vinyasa Yoga & Breath Work',
    date: '2024-12-21T10:00:00Z',
    description: 'Ercomia Presents Vinyasa Yoga & Breath Work with Ali G & Marisol Vibracion. At ERF WORLD, 349 Suydam St.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DDIiJb_OsLM/'
  },
  // DEMO - work by Ryan Fisher
  'ff26c57bdc874464a75184695c9637a3d025d6d2': {
    title: 'DEMO - work by Ryan Fisher',
    date: '2024-12-18T18:00:00Z',
    description: 'December 18th, 6-9pm. Art exhibition at 94 Bogart Street.',
    location: 'bogart',
    instagramUrl: 'https://www.instagram.com/p/DC_j8X6O6_N/'
  },
  // Super Smash Bros Tournament
  'cab9d095fd41f794579a7276878572b86ddb1efa': {
    title: 'Super Smash Bros Tournament',
    date: '2024-12-16T19:00:00Z',
    description: 'December 16, 7pm. $10 buy in. 349 Suydam St.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DCy6OPROqZS/'
  },
  // Roots & Reflections - Urban Forest Collage Workshop
  '91535c1060202c438bfe3db0136b5875219b4e92': {
    title: 'Roots & Reflections - Urban Forest Collage Workshop',
    date: '2024-12-03T19:00:00Z',
    description: 'Roots & Reflections - A Collage Workshop about NYC Urban Forest. Tuesday December 3rd, 7:00-9:00pm. ErF World, 349 Suydam St 3rd Floor. Tickets $10.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DCbLH9tOmWP/'
  },
  // one two twi light
  'cb428a30a1601bc744b79b1c3cef3e4b9d4ac09f': {
    title: 'one two twi light',
    date: '2024-11-21T19:00:00Z',
    description: 'A performance by Anna Victoria Regner at 349 Suydam St 3L, Brooklyn, NY.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DCNpLV6OqHq/'
  },
  // ART MARKET & LIVE SHOWCASE
  'd6ee36cdd764982dcd04404d41f00f091aff2176': {
    title: 'Art Market & Live Showcase',
    date: '2024-11-17T12:00:00Z',
    description: 'Free Admission. Live screenprinting, live 3D scanning, live photography, live 3D printing. Clothing, jewelry, coffee, crochet, paintings, prints, figurines, plushies, tattoos. At ErF World, 349 Suydam St 3L.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/CCFQ0bpOeCf/'
  },
  // Beneath Asphalt and even further down
  '1516f3b370f71799baa0d56271933423ce06a112': {
    title: 'Beneath Asphalt and even further down',
    date: '2024-11-15T18:00:00Z',
    endDate: '2024-11-30T17:00:00Z',
    description: 'Works by Georgina Arroyo. Opening reception 6-8pm. Runs through November 30, 2024. At 349 Suydam St 3L, Brooklyn, NY.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DB_VQ0aOhUE/'
  },
  // group critique Oct 27
  '3b9037e3d7debf30932c91c10e31aba287daebb8': {
    title: 'Group Critique',
    date: '2024-10-27T18:00:00Z',
    description: 'Please bring one artwork/project idea to share and discuss. The goal of this critique is to engage with each other\'s work and offer ideas to push the artwork further. Please bring works/ideas in progress.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DBkKO6TOLvC/'
  },
  // Pumpkin Carving & Costume Contest
  'bf6be793addbfa15f83a91d525afbdcb8a6fea86': {
    title: 'Pumpkin Carving & Costume Contest',
    date: '2024-10-24T18:00:00Z',
    description: 'Halloween event with pumpkin carving and costume contest at ErF World, 349 Suydam St.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DBcuqJdOzwj/'
  },
  // Group Critique Oct 6
  'b6a8f69eeec64acb7c0d0edf34edc1df40e6f99c': {
    title: 'Group Critique - October',
    date: '2024-10-06T18:00:00Z',
    description: 'Sunday Oct 6, 6pm. 349 Suydam St. Bring one artwork/project idea to share and discuss.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/DA-dYy-O0Ga/'
  },
  // ErF World Market & Showcase
  'ae2cddc48a61cad1e9ce1aae61e6576effde5fa5': {
    title: 'ErF World Market & Showcase',
    date: '2024-08-31T12:00:00Z',
    description: 'FOOD, COFFEE & DRINKS, TATTOOING, LIVE PRINTING & SEWING, CLOTHES AND OBJECTS. Free Admission. $35 Vendor Sign up. At Kaleidoscope.bk, 267 Irving Ave, Brooklyn NY 11237.',
    location: 'other',
    instagramUrl: 'https://www.instagram.com/p/C_D8RH6u0K4/'
  },
  // Book Making Workshop
  'ce481c8ea36ffd897a5cbce256e18ef94a92c5e7': {
    title: 'Book Making Workshop',
    date: '2024-08-03T12:00:00Z',
    description: 'August 3, 12-2PM. $15/person. Create your own hardcover accordion book from scratch. All materials included. 349 Suydam St #3L.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/C-AeQ7Wu3x6/'
  },
  // LITTLE DOG - Short Film Screening
  'e5f8da3c19906b4ad3ed54c08337877fb6d6c8af': {
    title: 'LITTLE DOG - Short Film Screening',
    date: '2024-06-30T19:00:00Z',
    description: 'AN ERF SHORT FILM SCREENING',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/C8xpF6QubLn/'
  },
  // Art Market at Maria Hernandez Park
  '03d88da0ade3d476bd9aa203ba159b91c3113212': {
    title: 'Art Market at Maria Hernandez Park',
    date: '2024-06-29T12:00:00Z',
    description: 'Art Market at Maria Hernandez Park hosted by ErF World.',
    location: 'other',
    instagramUrl: 'https://www.instagram.com/p/C8ssOMNOhP0/'
  },
  // Rothko's Clothing Swap
  '1ccf4b40c2dfa595b143a08a5ea412fbcc081213': {
    title: "Rothko's Clothing Swap",
    date: '2024-05-12T15:00:00Z',
    description: 'Sunday May 12th, 3PM. FREE! Bring something or nothing, take clothes. Leftovers donated!',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/C6jbYa8O4y9/'
  },
  // Screen Printing Class
  'f27a5508c558039bca60337d8bf07ca3ffc7196f': {
    title: 'Screen Printing Class',
    date: '2024-04-27T15:00:00Z',
    description: 'Saturday April 27th, 3pm-6pm. $90 ticket. All materials & apparel provided. Burn your own screen, pick your colors, pull your own T-shirt. Limited to 15 slots.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/C5lQ-xnOA4D/'
  },
  // Meadow - Spring Showcase
  '08d48381019bb900899e60de158aee14be44e552': {
    title: 'Meadow - Spring Showcase',
    date: '2024-03-16T20:00:00Z',
    description: 'March 16th. Doors 8pm, Show 9pm. The Broadway, 1272 Broadway, Brooklyn NY 11221. Age 21+. $12 advance / $15 at door. Musical guests: Danny Herrerias, Haley Grey + VVE, Grant Rossi.',
    location: 'other',
    instagramUrl: 'https://www.instagram.com/p/C4VJQ8MOKxy/'
  },
  // Grand Opening - Artist Resident Showcase
  '24729cc98136e2fb27eb98f82bb0b8a823c0ccd9': {
    title: 'Grand Opening - Artist Resident Showcase',
    date: '2024-01-27T16:00:00Z',
    description: 'January 27th, 4PM - 8PM. FREE! 349 Suydam St 3L, Brooklyn.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/C2bQ0xtOyzl/'
  },
  // Turris Mors
  'fda56d22e4a0ca01a955f43f8ab97e084f2828e8': {
    title: 'Turris Mors',
    date: '2023-12-09T23:00:00Z',
    description: 'December 9th, 11pm-2am. $13 adv / $15 door. Featuring Rivan, Ivana, Dr Dill, Mr Her, Metro. Purgatory BK, 675 Central Ave, Brooklyn, NY 11207.',
    location: 'other',
    instagramUrl: 'https://www.instagram.com/p/C0fFLfDON4P/'
  },
  // Black Friday Flea Market
  '37ba4e5041ee672cb8505963a2c7a699b6bab663': {
    title: 'Black Friday Flea Market',
    date: '2023-11-24T15:00:00Z',
    description: 'November 24th, 3PM - 10PM. Live music, DJs all day. 59-14 70th Ave, Ridgewood.',
    location: 'other',
    instagramUrl: 'https://www.instagram.com/p/Cz7Qy7QOhS_/'
  },
  // The Corpse Roof
  'af0ad6dce9f31938eba9212adb6155d7fb4e19bb': {
    title: 'The Corpse Roof',
    date: '2023-10-19T19:30:00Z',
    description: 'Live music + art show. Thursday Oct 19th, 7:30pm - Midnight. DM for address.',
    location: 'suydam',
    instagramUrl: 'https://www.instagram.com/p/CyiQ9yCOz0j/'
  },
};

async function fixAllEvents() {
  console.log('\n🔧 Fixing all events with correct data...\n');
  
  // Get all events with their image URLs
  const query = `*[_type == "event" && defined(publishedAt)] {
    _id,
    title,
    "imageHash": image.asset._ref
  }`;
  
  const events = await client.fetch(query);
  console.log(`Found ${events.length} events to process\n`);
  
  let updated = 0;
  let skipped = 0;
  
  for (const event of events) {
    // Extract hash from image ref (format: image-HASH-WxH-ext)
    const imageRef = event.imageHash;
    if (!imageRef) {
      console.log(`⚠️  No image ref for "${event.title}"`);
      skipped++;
      continue;
    }
    
    // Extract hash (between 'image-' and '-WIDTHxHEIGHT')
    const match = imageRef.match(/image-([a-f0-9]+)-/);
    if (!match) {
      console.log(`⚠️  Could not parse image hash for "${event.title}"`);
      skipped++;
      continue;
    }
    
    const hash = match[1];
    const correction = corrections[hash];
    
    if (!correction) {
      console.log(`⚠️  No correction found for hash ${hash.substring(0,8)}... ("${event.title}")`);
      skipped++;
      continue;
    }
    
    try {
      const patch = client.patch(event._id);
      patch.set({
        title: correction.title,
        date: correction.date,
        description: correction.description,
        location: correction.location,
        instagramUrl: correction.instagramUrl,
      });
      
      if (correction.endDate) {
        patch.set({ endDate: correction.endDate });
      } else {
        patch.unset(['endDate']);
      }
      
      await patch.commit();
      console.log(`✅ Updated: "${correction.title}"`);
      updated++;
    } catch (err) {
      console.log(`❌ Failed: "${event.title}" - ${err.message}`);
    }
  }
  
  console.log(`\n✅ Complete! Updated: ${updated}, Skipped: ${skipped}\n`);
}

fixAllEvents();
