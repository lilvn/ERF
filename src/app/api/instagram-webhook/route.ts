import { NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity';
import { validateInstagramWebhook } from '@/lib/optimizeContent';
import { extractTextFromImage, parseEventDetails, combineDateAndTime } from '@/lib/googleVision';

/**
 * Instagram Webhook Handler
 * Listens for Instagram posts with #ERFCalendar hashtag and imports them as events
 */

// GET handler for webhook verification (Instagram requires this)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.INSTAGRAM_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Instagram webhook verified');
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error('Instagram webhook verification failed');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}

// POST handler for receiving Instagram webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256') || '';
    const secret = process.env.INSTAGRAM_APP_SECRET || '';

    // Validate webhook signature
    if (secret && !validateInstagramWebhook(signature, body, secret)) {
      console.error('Invalid Instagram webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    
    // Process webhook payload
    console.log('Instagram webhook received:', JSON.stringify(data, null, 2));

    // Instagram webhook structure: data.entry[].changes[].value
    if (data.entry && Array.isArray(data.entry)) {
      for (const entry of data.entry) {
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            if (change.field === 'media' && change.value) {
              await processInstagramMedia(change.value);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing Instagram webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Process Instagram media and check for #ERFCalendar hashtag
 */
async function processInstagramMedia(mediaData: any) {
  try {
    const mediaId = mediaData.id;
    const caption = mediaData.caption || '';
    
    // Check if caption contains #ERFCalendar
    if (!caption.includes('#ERFCalendar')) {
      console.log(`Instagram post ${mediaId} does not have #ERFCalendar, skipping`);
      return;
    }

    console.log(`Processing Instagram post ${mediaId} with #ERFCalendar`);

    // Get Instagram access token from env
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('INSTAGRAM_ACCESS_TOKEN not set');
      return;
    }

    // Fetch full media details from Instagram Graph API
    const mediaUrl = `https://graph.instagram.com/${mediaId}?fields=id,caption,media_type,media_url,permalink,timestamp,children{media_url,media_type}&access_token=${accessToken}`;
    const response = await fetch(mediaUrl);
    
    if (!response.ok) {
      console.error('Failed to fetch Instagram media details:', await response.text());
      return;
    }

    const media = await response.json();

    // Process IMAGE or CAROUSEL_ALBUM types
    if (media.media_type !== 'IMAGE' && media.media_type !== 'CAROUSEL_ALBUM') {
      console.log(`Instagram post ${mediaId} is not an image or carousel, skipping`);
      return;
    }

    // Collect all image URLs (for carousel albums, get all children images)
    const imageUrls: string[] = [];
    
    if (media.media_type === 'CAROUSEL_ALBUM' && media.children?.data) {
      // Filter only images from carousel (skip videos)
      const imageChildren = media.children.data.filter((child: any) => child.media_type === 'IMAGE');
      imageUrls.push(...imageChildren.map((child: any) => child.media_url));
    } else if (media.media_type === 'IMAGE') {
      imageUrls.push(media.media_url);
    }

    if (imageUrls.length === 0) {
      console.log('No images found in post, skipping');
      return;
    }

    console.log(`Found ${imageUrls.length} image(s) in post`);
    console.log('Analyzing first flyer image with Google Vision API...');

    // Extract text from the first image using Google Vision
    let extractedText: string;
    try {
      extractedText = await extractTextFromImage(imageUrls[0]);
    } catch (error) {
      console.error('Failed to extract text from image:', error);
      // If Vision API fails, skip this event
      return;
    }

    if (!extractedText || extractedText.trim().length === 0) {
      console.log('No text extracted from flyer, skipping');
      return;
    }

    // Parse event details from extracted text
    const eventDetails = parseEventDetails(extractedText);
    
    console.log('Parsed event details:', {
      title: eventDetails.title,
      date: eventDetails.date,
      time: eventDetails.time,
      location: eventDetails.location,
    });

    // Upload all images to Sanity
    console.log(`Uploading ${imageUrls.length} image(s) to Sanity...`);
    const imageAssets = await Promise.all(imageUrls.map(url => uploadImageToSanity(url)));

    // Combine date and time
    const eventDate = combineDateAndTime(eventDetails.date, eventDetails.time);

    // Use detected location or default to suydam
    const location = eventDetails.location || 'suydam';

    // Use extracted title or create from first line of text
    const title = eventDetails.title || 'Event from Instagram';

    // Create event in Sanity with main image and additional images
    const event: any = {
      _type: 'event',
      title,
      slug: {
        _type: 'slug',
        current: `instagram-${mediaId}`,
      },
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAssets[0]._id,
        },
      },
      date: eventDate,
      description: eventDetails.description || eventDetails.fullText.substring(0, 500),
      location,
      instagramUrl: media.permalink,
      importedFromInstagram: true,
      publishedAt: new Date().toISOString(),
    };

    // Add additional images if there are more than one
    if (imageAssets.length > 1) {
      event.images = imageAssets.slice(1).map(asset => ({
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      }));
    }

    if (!writeClient) {
      console.error('Sanity writeClient not initialized');
      return;
    }
    
    const result = await writeClient.create(event);
    console.log('Event created in Sanity:', result._id);

  } catch (error) {
    console.error('Error processing Instagram media:', error);
  }
}

/**
 * Upload image from URL to Sanity
 */
async function uploadImageToSanity(imageUrl: string) {
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();
  const imageBlob = Buffer.from(imageBuffer);

  if (!writeClient) {
    throw new Error('Sanity writeClient not initialized');
  }

  // Upload to Sanity assets
  const asset = await writeClient.assets.upload('image', imageBlob, {
    filename: `instagram-${Date.now()}.jpg`,
  });

  return asset;
}

