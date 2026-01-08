const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

const client = createClient({
  projectId: 'yf9xyatc',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skIE8ucBP6MuxAkII7TCHij4zo1GAsofgkQpeKBC7O61G13QcOoefZ47gktfXqolCJqLSjazkEfU84BJDcsX0tEPkKZKUBmIoiUqNBPnGxnQA1HsJswfddnqaUvb3LwubpT8VBrHN8R8hFexnD6LhIWVxlPPpzmz6zZK1ENeS0220ICsRAKK',
  useCdn: false,
});

const events = [
  {
    title: "group critique",
    date: "2024-10-27",
    time: "6:00 PM",
    location: "Suydam",
    description: "Please bring one artwork/project idea to share and discuss. The goal of this critique is to engage with each other's work and offer ideas to push the artwork further. Please bring works/ideas in progress.",
    imagePath: "2024-10-24_01-55-01_UTC_1.jpg"
  },
  {
    title: "Winter Market Open Call",
    date: "2026-01-10",
    time: "TBD",
    location: "Brooklyn",
    description: "$50/table - form in bio. Submission deadline: 1.10.26",
    imagePath: "2026-01-04_18-03-14_UTC.jpg"
  },
  {
    title: "Contrary to all the grand proposals",
    date: "2026-01-10",
    time: "7:00 PM",
    location: "Suydam",
    description: "Exhibition featuring Imogen Aukland, Jake Bernstein, Jared Friedman, Eun Yong Lee, Erin O'Flynn, David Thonis. Open Saturdays, Sundays 11am-5pm and by appointment. Runs through February 7, 2026.",
    imagePath: "2026-01-03_04-46-52_UTC.jpg"
  },
  {
    title: "Handmade Rosé Bouquets",
    date: "2025-02-01",
    time: "11:00 AM",
    location: "Bogart",
    description: "Hosted by SEWCIAL CLUB. RSVP on Posh.",
    imagePath: "2025-12-29_17-20-44_UTC_1.jpg"
  },
  {
    title: "LOWER THE HEAVENS - A New Years Special",
    date: "2024-12-31",
    time: "7:00 PM",
    location: "Other",
    description: "All night warehouse party. Live Ball Drop, Champagne Toast, Balloon Drop, Free Coat Check. $40. Featuring @84 A Lana, WORLD KRYSIS, K2. HOUSE/TECHNO/JUNGLE/DISCO. At 1 Ingraham St.",
    imagePath: "2025-12-20_20-35-28_UTC.jpg"
  },
  {
    title: "Next Crit - in person",
    date: "2025-12-21",
    time: "6:00 PM",
    location: "Suydam",
    description: "We will break into small groups. All are welcome! No institution required. Please bring a work in progress for genuine quality feedback!",
    imagePath: "2025-12-17_13-57-23_UTC.jpg"
  },
  {
    title: "RAVEN GREY DESIGNS JEWELRY POP UP",
    date: "2025-12-19",
    time: "5:00 PM",
    location: "Bogart",
    description: "Jewelry pop-up shop. Friday 5-9pm, Saturday 1-7pm.",
    imagePath: "2025-12-15_19-43-41_UTC.jpg"
  },
  {
    title: "DEMO - work by Ryan Fisher",
    date: "2024-12-18",
    time: "6:00 PM",
    location: "Bogart",
    description: "Art exhibition at 94 Bogart Street.",
    imagePath: "2025-12-12_15-44-36_UTC.jpg"
  },
  {
    title: "M Shimek - FAMILY INHERITANCE",
    date: "2025-12-12",
    time: "7:00 PM",
    location: "Bogart",
    description: "Art exhibition at Pushup Gallery. Opening reception 7-10pm. Runs through January 17, 2026.",
    imagePath: "2025-11-29_14-35-50_UTC.jpg"
  },
  {
    title: "Good English Presents An Evening at ERF",
    date: "2025-12-05",
    time: "7:00 PM",
    location: "Other",
    description: "$15. Featuring Melaina Kol, People I Love (singles release), Avsha. At 1 Ingraham st Brooklyn.",
    imagePath: "2025-12-01_20-46-58_UTC.jpg"
  },
  {
    title: "Vinyasa Yoga & Breath Work",
    date: "2024-12-21",
    time: "12:00 PM",
    location: "Suydam",
    description: "Ercomia Presents Vinyasa Yoga & Breath Work with Ali G & Marisol Vibracion at ERF WORLD, 349 SUYDAM ST.",
    imagePath: "2024-11-26_16-20-00_UTC.jpg"
  },
  {
    title: "one two twi light",
    date: "2024-11-21",
    time: "7:00 PM",
    location: "Suydam",
    description: "A performance by Anna Victoria Regner at 349 Suydam St. 3L, Brooklyn, NY.",
    imagePath: "2024-11-03_15-19-58_UTC.jpg"
  },
  {
    title: "ART MARKET & LIVE SHOWCASE",
    date: "2024-11-17",
    time: "4:00 PM",
    location: "Suydam",
    description: "Vendor Sign up. Free Admission. LIVE SCREENPRINTING | LIVE 3D SCANNING | LIVE PHOTOGRAPHY | LIVE 3D PRINTING. CLOTHING | JEWELRY | COFFEE | CROCHET | PAINTINGS | PRINTS | FIGURINES | PLUSHIES | TATTOOS. At ErF World, 349 Suydam St. 3L.",
    imagePath: "2024-11-11_23-29-44_UTC.jpg"
  },
  {
    title: "Beneath Asphalt and even further down",
    date: "2024-11-15",
    time: "6:00 PM",
    location: "Suydam",
    description: "Works by Georgina Arroyo. Opening reception 6-8pm. Runs through November 30, 2024. At 349 Suydamn St, 3L, Brooklyn, NY.",
    imagePath: "2024-10-30_01-24-23_UTC.jpg"
  },
  {
    title: "Pumpkin Carving & Costume Contest",
    date: "2024-10-24",
    time: "3:00 PM",
    location: "Suydam",
    description: "Halloween event with pumpkin carving and costume contest at ErF World, 349 Suydam st.",
    imagePath: "2024-10-09_15-22-46_UTC.jpg"
  },
  {
    title: "LITTLE DOG - Short Film Screening",
    date: "2024-06-30",
    time: "6:00 PM",
    location: "Suydam",
    description: "AN ERF SHORT FILM SCREENING",
    imagePath: "2024-06-28_22-51-38_UTC.jpg"
  },
  {
    title: "Art Market at Maria Hernandez Park",
    date: "2024-06-29",
    time: "3:00 PM",
    location: "Other",
    description: "Art Market at Maria Hernandez Park hosted by ErF World.",
    imagePath: "2024-06-22_20-04-00_UTC.jpg"
  },
  {
    title: "turris mors",
    date: "2023-12-09",
    time: "11:00 PM",
    location: "Other",
    description: "$13 adv $15 door. Featuring RIV4N, IVANA, DR DILL, MR. HER, METRO. ErF WORLD PRESENTS. At Purgatory BK, 675 Central Ave, Brooklyn, NY 11207.",
    imagePath: "2023-12-05_18-51-38_UTC.jpg"
  },
  {
    title: "ErF World Market & Showcase",
    date: "2024-08-31",
    time: "4:00 PM",
    location: "Other",
    description: "FOOD, COFFEE & DRINKS, TATOOING, LIVE PRINTING & SEWING, CLOTHES AND OBJECTS, LOTS TO SEE. Free Admission. $35 Vendor Sign up. At Kaleidoscope.bk, 267 Irving Ave, Brooklyn NY 11237.",
    imagePath: "2024-08-26_20-30-22_UTC.jpg"
  },
  {
    title: "Book Making Workshop",
    date: "2024-08-03",
    time: "12:00 PM",
    location: "Suydam",
    description: "Hosted by @SUPGEEMUN. In this two hour workshop you will create your own hard cover accordion book from scratch! We will explore a variety of bookmaking tools and techniques all while creating the perfect pocket sketchbook, journal or photo book. All materials included! $15/PERSON. VENMO @SUPGEEMUN TO SECURE YOUR SPOT. At ERF WORLD 349 SUYDAM ST #3L.",
    imagePath: "2024-07-23_12-27-40_UTC.jpg"
  }
];

async function uploadEvent(event) {
  try {
    // Read the image file
    const imagePath = path.join(__dirname, '../instagram_downloads/erf.nyc', event.imagePath);
    
    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️  Image not found: ${event.imagePath}`);
      return null;
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Upload image to Sanity
    console.log(`📤 Uploading image for "${event.title}"...`);
    const imageAsset = await client.assets.upload('image', imageBuffer, {
      filename: event.imagePath,
    });
    
    // Create slug from title
    const slug = event.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Create event document
    console.log(`📝 Creating event "${event.title}"...`);
    const eventDoc = await client.create({
      _type: 'event',
      title: event.title,
      slug: {
        _type: 'slug',
        current: slug + '-' + event.date.replace(/-/g, ''),
      },
      date: event.date,
      description: event.description,
      location: event.location,
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id,
        },
      },
    });
    
    console.log(`✅ Event created: "${event.title}" (ID: ${eventDoc._id})`);
    return eventDoc;
  } catch (error) {
    console.error(`❌ Error uploading "${event.title}":`, error.message);
    return null;
  }
}

async function main() {
  console.log(`🚀 Starting upload of ${events.length} events...\\n`);
  
  for (const event of events) {
    await uploadEvent(event);
    console.log('---');
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\\n🎉 All events processed!');
}

main().catch(console.error);
