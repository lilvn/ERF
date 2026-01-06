# Google Cloud Vision API - Flyer Analysis Setup

## ✨ What This Does

Automatically extracts event details from Instagram flyer images:
- ✅ Event title
- ✅ Date & time
- ✅ Location (Suydam/Bogart)
- ✅ Description/details
- ❌ **Ignores Instagram captions** (not reliable)

## How It Works

```
Instagram post with #ERFCalendar
    ↓
Download flyer image
    ↓
Google Vision API (OCR)
    ↓
Extract text from flyer
    ↓
Parse for event details
    ↓
Create event in Sanity
    ↓
Appears on your calendar!
```

---

## Setup Complete! ✅

You've already:
- ✅ Created Google Cloud account
- ✅ Enabled Cloud Vision API
- ✅ Created API key
- ✅ Added to Vercel environment variables

---

## How to Use

### Post Event on Instagram

1. **Create your event flyer** with:
   - Event title (clear, prominent)
   - Date (e.g., "Jan 15, 2026" or "1/15/26")
   - Time (e.g., "7pm" or "7:00 PM")
   - Location (mention "Suydam" or "Bogart")
   - Any event details/description

2. **Post on Instagram**
   - Upload the flyer image
   - Add `#ERFCalendar` hashtag in caption
   - Caption text doesn't matter (it's ignored!)

3. **Automatic Processing**
   - Instagram webhook triggers
   - Vision API reads flyer text
   - Parses event details
   - Creates event in Sanity
   - Event appears on your calendar!

---

## What Gets Extracted

### Example Flyer

```
OPENING NIGHT
January 15, 2026
7:00 PM

Suydam Studio
123 Suydam St, Brooklyn

Join us for an evening of art,
music, and community celebration
```

### Extracted Data

- **Title:** "OPENING NIGHT"
- **Date:** January 15, 2026
- **Time:** 7:00 PM
- **Location:** Suydam
- **Description:** "Join us for an evening of art, music, and community celebration"

---

## Supported Date Formats

The system recognizes:
- ✅ `January 15, 2026`
- ✅ `Jan 15, 2026`
- ✅ `1/15/2026`
- ✅ `01/15/26`
- ✅ `15th of January`
- ✅ `Saturday, Jan 15`

## Supported Time Formats

- ✅ `7pm` or `7PM`
- ✅ `7:00 pm` or `7:00 PM`
- ✅ `19:00` (24-hour)

## Location Detection

Automatically detects:
- ✅ "Suydam" anywhere in flyer
- ✅ "Bogart" anywhere in flyer
- ✅ "123 Suydam St" (with address)
- ✅ Defaults to Suydam if no location found

---

## Design Tips for Best Results

### ✅ DO:
- Use clear, readable fonts
- Make event title prominent/large
- Include explicit date & time
- Mention location name clearly
- Keep text horizontal
- Use good contrast (dark text on light background)

### ❌ AVOID:
- Tiny text that's hard to read
- Rotated/angled text
- Very decorative fonts (hard for OCR)
- Text over busy backgrounds
- Dates/times only in graphics (not text)

---

## Troubleshooting

### Event Not Created from Instagram Post

**Check:**
1. Does post have `#ERFCalendar` hashtag?
2. Is it an image (not video/carousel)?
3. Does flyer have readable text?
4. Check Vercel function logs for errors

### Wrong Event Details Extracted

**Common causes:**
- Multiple dates on flyer (uses first one found)
- Unclear text/fonts
- Location not mentioned
- No explicit time

**Fix:**
- Edit event in Sanity Studio after import
- Make flyers with clearer text for future

### No Text Extracted

**Causes:**
- Flyer is all graphics/logos
- Text is too small
- Poor image quality
- Text is rotated/distorted

**Fix:**
- Use flyers with clear, readable text
- Ensure text is large enough

---

## Cost

**Google Cloud Vision API:**
- FREE tier: 1,000 images/month
- Your usage: ~10-50 events/month
- **Cost: $0/month** ✅

Even at 100 events/month, you're still free!

---

## Manual Override

If auto-import doesn't work perfectly:

1. **Let it import** (even if details are wrong)
2. **Edit in Sanity Studio:**
   - Fix title
   - Correct date/time
   - Adjust location
   - Update description
3. **Publish** updated event

Still faster than manual entry!

---

## Testing

### Test with an Old Instagram Post

1. Find an old event flyer post
2. Add `#ERFCalendar` to the caption
3. Wait ~1 minute
4. Check your calendar
5. Verify details were extracted correctly

### Manually Test Vision API

You can test text extraction in Sanity Studio or write a test script to verify OCR is working.

---

## Advanced: Improving Accuracy

If you want better extraction, you can:

1. **Add custom parsing rules** in `/src/lib/googleVision.ts`
2. **Train patterns** for your specific flyer style
3. **Add fallbacks** for missing data
4. **Enhance date/time parsing** for your formats

The code is modular and easy to customize!

---

## Files Modified

- `/src/lib/googleVision.ts` - Vision API service
- `/src/app/api/instagram-webhook/route.ts` - Updated to use Vision
- `package.json` - Added @google-cloud/vision

---

## Environment Variables Required

Vercel must have:
```
GOOGLE_CLOUD_VISION_API_KEY=your_api_key_here
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_VERIFY_TOKEN=your_verify_token
```

---

## Next Steps

1. ✅ Deploy to Vercel (auto-deploys when pushed)
2. ⏳ Set up Instagram webhook (see main docs)
3. 🎯 Post event with #ERFCalendar
4. 🎉 Watch it appear on your calendar!

Your flyer analysis system is ready! Post an event with `#ERFCalendar` and watch the magic happen. ✨

