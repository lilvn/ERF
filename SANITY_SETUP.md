# Quick Sanity Setup (5 Minutes)

## 1. Create Sanity Project

1. Go to https://sanity.io/login
2. Sign up with GitHub/Google or email
3. Click "Create new project"
4. Name: "ERF Events"
5. Dataset: `production`
6. **Copy your Project ID** (looks like: abc123xyz)

## 2. Get API Token

1. Click your project in dashboard
2. Go to "API" tab in left menu
3. Click "Tokens" section
4. Click "+ Add API Token"
5. Name: "Next.js Website"
6. Permissions: **Editor**
7. **Copy the token** (only shown once!)

## 3. Add to Your Project

Create `.env.local` file in your project root:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your_token_here
```

Replace `abc123xyz` and `your_token_here` with your actual values.

## 4. Restart Dev Server

```bash
npm run dev
```

## 5. Set Up Sanity Studio (Management Interface)

```bash
npm create sanity@latest
```

When prompted:
- **Use existing project?** YES
- **Select project:** Your project name
- **Dataset:** production
- **Output path:** studio
- **Package manager:** npm

```bash
cd studio
```

Edit `sanity.config.ts` to import your schema:

```typescript
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schema} from '../sanity/schema'

export default defineConfig({
  name: 'default',
  title: 'ERF Events',
  projectId: 'your-project-id',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: schema.types,
  },
})
```

```bash
npm run dev
```

Open http://localhost:3333

## 6. Create Your First Event

1. Click "Event" in left sidebar
2. Click "+ Create new Event"
3. Fill in:
   - Title: "Test Event"
   - Slug: Click "Generate"
   - Image: Upload any image
   - Date: Pick a date
   - Description: "Test description"
   - Location: Choose "Suydam" or "Bogart"
4. Click **Publish** (top-right)

## 7. Check Your Website

Visit http://localhost:3000/events

Your event should appear on the calendar! 🎉

---

## Troubleshooting

**"Cannot find module 'sanity'"**
```bash
cd studio
npm install
```

**"Invalid project ID"**
- Check `.env.local` has correct project ID
- Restart dev server: `npm run dev`

**"401 Unauthorized"**
- Check API token has "Editor" permissions
- Check token is in `.env.local`
- Restart dev server

**Events not showing**
- Make sure you clicked **Publish** in Sanity Studio
- Check console for errors
- Try hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)

---

## Next Steps

- Read full guide: `EVENTS_CALENDAR_README.md`
- Set up Instagram integration (optional)
- Set up Discord integration (optional)
- Deploy to production
