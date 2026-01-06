# Events Calendar - Setup & Usage Guide

## ✅ What's Been Built

Your Events calendar system is now complete with:

1. **Dynamic Calendar UI** - Grid layout that adapts to image aspect ratios
2. **Sanity CMS Integration** - Backend for managing events
3. **Instagram Auto-Import** - Posts with #ERFCalendar automatically become events
4. **Discord Auto-Posting** - New events posted to Discord
5. **Location Filtering** - Filter by All/Suydam/Bogart
6. **Month Navigation** - Click month box to select different months
7. **Event Modal** - Click event to see full details
8. **Past Events Toggle** - Switch between upcoming and past events

---

## 🚀 Quick Start

### Step 1: Set Up Sanity CMS

1. **Create Sanity Account & Project**
   - Go to https://sanity.io and sign up (free)
   - Create new project: "ERF Events"
   - Dataset name: `production`
   - Copy your **Project ID**

2. **Get API Token**
   - Go to https://sanity.io/manage
   - Select your project → API tab
   - Create token named "Next.js" with **Editor** permissions
   - Copy the token (you only see it once!)

3. **Configure Environment Variables**
   
   Create `.env.local` in your project root:

   ```env
   # REQUIRED - Sanity CMS
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
   SANITY_API_TOKEN=your_token_here

   # OPTIONAL - Instagram Integration (see below)
   INSTAGRAM_ACCESS_TOKEN=
   INSTAGRAM_APP_SECRET=
   INSTAGRAM_VERIFY_TOKEN=

   # OPTIONAL - Discord Integration (see below)
   DISCORD_WEBHOOK_URL=
   ```

4. **Restart Your Dev Server**
   ```bash
   npm run dev
   ```

5. **Visit Events Page**
   - Go to http://localhost:3000/events
   - You'll see an empty calendar (no events yet)

---

## 📝 Adding Events

### Method 1: Sanity Studio (Easiest)

The easiest way to manage events is through Sanity Studio:

1. **Set Up Sanity Studio**
   ```bash
   npm create sanity@latest
   ```
   
   When prompted:
   - Use existing project: select your project
   - Dataset: `production`
   - Output path: `studio`

2. **Configure Studio**
   
   Edit `studio/sanity.config.ts`:
   ```typescript
   import {defineConfig} from 'sanity'
   import {structureTool} from 'sanity/structure'
   import {visionTool} from '@sanity/vision'
   import {schema} from '../sanity/schema'

   export default defineConfig({
     name: 'default',
     title: 'ERF Events',
     projectId: 'your_project_id',
     dataset: 'production',
     plugins: [structureTool(), visionTool()],
     schema: {
       types: schema.types,
     },
   })
   ```

3. **Run Sanity Studio**
   ```bash
   cd studio
   npm run dev
   ```
   
   Open http://localhost:3333

4. **Create Your First Event**
   - Click "Event" in left sidebar
   - Click "Create new Event"
   - Fill in:
     - **Title**: "Opening Night"
     - **Slug**: Click "Generate" (auto-fills)
     - **Image**: Upload event image
     - **Date**: Select date and time
     - **Description**: Event details
     - **Location**: Choose Suydam or Bogart
   - Click **Publish**

5. **Check Your Website**
   - Refresh http://localhost:3000/events
   - Your event should appear on the calendar!

### Method 2: Instagram Auto-Import

Post on Instagram with `#ERFCalendar` to automatically import as event.

**Setup Required** (see Instagram Integration section below)

---

## 🎨 Calendar Features

### Month Navigation
- Click the **month box** (top-left) to open month selector
- Shows all months with events
- Displays event count per month
- Default: shows month with next upcoming event

### Location Filter
- Three buttons: **ALL EVENTS**, **SUYDAM**, **BOGART**
- Instantly filters calendar by location

### Event Details
- Click any event image to open modal
- Shows:
  - Full-size image
  - Event title
  - Date & time
  - Location
  - Full description
  - Instagram link (if imported from Instagram)

### Past Events
- Click **PAST EVENTS** button (bottom-right)
- Toggles between upcoming and past events

### Calendar Grid
- Each row = 1 week
- Column widths adapt to image aspect ratios
- Multiple events per day stack vertically
- Date headers show day of week, month, date, year

---

## 📸 Instagram Integration (Optional)

Auto-import Instagram posts with `#ERFCalendar` as events.

### Setup Steps:

1. **Create Facebook App**
   - Go to https://developers.facebook.com
   - Create App → Business type
   - Add **Instagram Basic Display** product

2. **Connect Instagram Business Account**
   - Your Instagram must be a **Business** or **Creator** account
   - Connect it to a Facebook Page
   - Get Instagram User ID

3. **Get Access Token**
   - Use Facebook Graph API Explorer
   - Get token with `instagram_basic` permissions
   - Make it long-lived (60 days)

4. **Set Up Webhook**
   - In your Facebook App settings:
   - Webhooks → Instagram → Subscribe
   - Callback URL: `https://yourdomain.com/api/instagram-webhook`
   - Verify Token: create a random string (save it)
   - Subscribe to `media` field

5. **Add to .env.local**
   ```env
   INSTAGRAM_ACCESS_TOKEN=your_long_lived_token
   INSTAGRAM_APP_SECRET=from_facebook_app_settings
   INSTAGRAM_VERIFY_TOKEN=your_random_string
   ```

6. **Deploy Your Site**
   - Instagram webhooks only work on public URLs (not localhost)
   - Deploy to Vercel/Netlify first
   - Add environment variables in deployment settings

### How It Works:

1. Post on Instagram with `#ERFCalendar` in caption
2. Instagram sends webhook to your site
3. Your site:
   - Checks for `#ERFCalendar` hashtag
   - Downloads the image
   - Cleans up caption (removes @ and # symbols)
   - Tries to detect date from caption
   - Tries to detect location (Suydam/Bogart)
   - Creates event in Sanity
4. Event appears on your calendar!

**Caption Tips:**
```
Opening Night at Suydam! 🎨
Jan 15, 2026 at 7pm
Join us for an amazing evening

#ERFCalendar #art #brooklyn
```
- Include date explicitly for accurate parsing
- Mention "Suydam" or "Bogart" for auto-location
- System removes @ mentions and hashtags automatically

---

## 💬 Discord Integration (Optional)

Auto-post new events to Discord channel.

### Setup Steps:

1. **Create Discord Webhook**
   - Open Discord server
   - Server Settings → Integrations → Webhooks
   - Click "New Webhook"
   - Name it "ERF Events"
   - Select channel (#events)
   - Copy webhook URL

2. **Add to .env.local**
   ```env
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
   ```

3. **Configure Sanity Webhook**
   - Go to https://sanity.io/manage
   - Select project → API → Webhooks
   - Create webhook:
     - Name: "Discord Posting"
     - URL: `https://yourdomain.com/api/sanity-webhook`
     - Dataset: `production`
     - Trigger on: `Create` + `event` document type
     - HTTP method: `POST`
     - API version: `v2021-03-25`

### How It Works:

1. Create/publish event in Sanity Studio
2. Sanity triggers webhook
3. Your API route posts to Discord with:
   - Event title
   - Description
   - Date & location
   - Event image
   - Purple embed design

---

## 🎯 Usage Tips

### Best Practices:

1. **Image Sizes**
   - Recommended: 1080x1080px (square) or 1080x1350px (portrait)
   - Sanity auto-optimizes for web
   - Supports any aspect ratio

2. **Event Dates**
   - Always include exact date and time
   - System shows upcoming events by default
   - Past events accessible via toggle

3. **Descriptions**
   - Use line breaks for readability
   - Include relevant details (time, dress code, tickets, etc.)
   - Keep first line concise (becomes title for Instagram imports)

4. **Locations**
   - Only two options: Suydam or Bogart
   - If you need more locations, edit `/sanity/schema.ts`

### Managing Events:

- **Edit Event**: Open Sanity Studio → find event → make changes → publish
- **Delete Event**: Studio → event → delete button (top-right)
- **Unpublish**: Studio → event → unpublish button (makes invisible on site)
- **Duplicate**: Studio → event → duplicate button → edit → publish

---

## 🔧 Customization

### Change Calendar Colors:

Edit `/src/components/Events/EventsCalendar.tsx`:
```typescript
// Line with bg-purple-800
className="bg-purple-800 text-white"  // Change purple-800 to your color
```

### Change Calendar Size:

Edit `/src/app/events/page.tsx`:
```typescript
style={{ height: '600px' }}  // Change 600px to desired height
```

### Add More Locations:

Edit `/sanity/schema.ts`:
```typescript
options: {
  list: [
    { title: 'Suydam', value: 'suydam' },
    { title: 'Bogart', value: 'bogart' },
    { title: 'Your New Location', value: 'new-location' },
  ],
}
```

Then edit `/src/components/Events/LocationFilter.tsx` to add the button.

---

## 🐛 Troubleshooting

### "No events this month"
- Check Sanity Studio: are events published?
- Check date: is event in selected month?
- Check console for errors: `npm run dev`

### Events not appearing from Instagram
- Check webhook is configured correctly
- Check .env.local has all Instagram variables
- Check Instagram post has `#ERFCalendar`
- Check server logs: `npm run dev` (Instagram webhooks need public URL)

### Images not loading
- Check Sanity API token has correct permissions
- Check NEXT_PUBLIC_SANITY_PROJECT_ID is correct
- Clear browser cache

### Linter errors
- Run: `npm run lint`
- Most common: missing dependencies in useEffect

---

## 📁 File Structure

```
/src
  /app
    /events
      page.tsx              ← Main events page
    /api
      /instagram-webhook
        route.ts            ← Receives Instagram posts
      /sanity-webhook
        route.ts            ← Posts to Discord
  /components
    /Events
      EventsCalendar.tsx    ← Calendar grid
      MonthSelector.tsx     ← Month picker
      LocationFilter.tsx    ← Location buttons
      EventModal.tsx        ← Event detail popup
      PastEventsButton.tsx  ← Past/upcoming toggle
  /lib
    sanity.ts               ← Sanity client & queries
    optimizeContent.ts      ← Text cleanup for Instagram

/sanity
  schema.ts                 ← Event data model
  env.ts                    ← Sanity environment config
```

---

## 🚀 Next Steps

1. ✅ Set up Sanity CMS (required)
2. ✅ Create your first event in Sanity Studio
3. ✅ Test the calendar on your site
4. ⏳ Set up Instagram integration (optional)
5. ⏳ Set up Discord integration (optional)
6. ⏳ Deploy to production (Vercel/Netlify)
7. ⏳ Configure webhooks on live site

---

## 💰 Costs Reminder

- **Sanity CMS**: FREE (3 users, 10GB bandwidth, 5GB storage)
- **Discord Webhooks**: FREE
- **Instagram API**: FREE (requires Facebook Business account)
- **Everything**: $0/month for typical usage

---

## 🆘 Need Help?

- **Sanity Docs**: https://www.sanity.io/docs
- **Instagram API**: https://developers.facebook.com/docs/instagram-api
- **Next.js Docs**: https://nextjs.org/docs
- **Discord Webhooks**: https://discord.com/developers/docs/resources/webhook

---

## 🎉 You're All Set!

Your Events calendar is ready to use. Start by setting up Sanity CMS and creating your first event!

