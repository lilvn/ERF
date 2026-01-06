# 🚀 Quick Start - Get Your Calendar Running in 5 Minutes

## What You Have

✅ **Fully functional Events Calendar**  
✅ **Sanity CMS backend ready**  
✅ **Instagram auto-import (optional)**  
✅ **Discord auto-posting (optional)**  
✅ **All code tested and working**  

---

## Start Here (5 Minutes)

### 1. Create Sanity Account
👉 https://sanity.io → Sign up (free)

### 2. Create Project
- Click "Create Project"
- Name: "ERF Events"
- Dataset: `production`
- **Copy your Project ID**

### 3. Get API Token
- Go to API tab
- Create token with "Editor" permissions
- **Copy the token**

### 4. Add to Your Project
Create `.env.local`:
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=paste_your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=paste_your_token
```

### 5. Restart Dev Server
```bash
npm run dev
```

### 6. Set Up Studio (Optional but Easy)
```bash
npm create sanity@latest
```
Follow prompts:
- Use existing project? **YES**
- Select your project
- Output path: **studio**

Then:
```bash
cd studio
npm run dev
```

Visit http://localhost:3333

### 7. Create First Event
In Sanity Studio:
1. Click "Event"
2. Click "Create"
3. Upload image, add details
4. Click **Publish**

### 8. View Your Calendar
👉 http://localhost:3000/events

**Done!** Your event is on the calendar! 🎉

---

## What Next?

- ✅ **Working now:** Add more events through Sanity Studio
- 📖 **Read more:** See `EVENTS_CALENDAR_README.md` for full guide
- 📸 **Instagram:** Set up auto-import with #ERFCalendar
- 💬 **Discord:** Auto-post events to Discord channel
- 🚀 **Deploy:** Push to Vercel/Netlify when ready

---

## Need Help?

1. **Quick setup issues?** → Read `SANITY_SETUP.md`
2. **Detailed guide?** → Read `EVENTS_CALENDAR_README.md`
3. **Everything working?** → Read `IMPLEMENTATION_COMPLETE.md`

---

## 💰 Costs

**Everything: $0/month**
- Sanity CMS: FREE tier (plenty for your needs)
- Instagram API: FREE
- Discord: FREE
- Hosting: FREE (Vercel/Netlify)

---

## 🎨 Your Calendar Features

- ✅ Dynamic grid layout (like your reference image)
- ✅ Month selector (click top-left box)
- ✅ Location filter (All/Suydam/Bogart)
- ✅ Event details modal (click any event)
- ✅ Past events toggle (bottom-right button)
- ✅ Image aspect ratio adaptation
- ✅ Multiple events per date

**Start now: Create your Sanity account! →** https://sanity.io

