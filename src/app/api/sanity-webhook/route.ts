import { NextRequest, NextResponse } from 'next/server';

/**
 * Sanity Webhook Handler
 * Triggered when an event is created/updated in Sanity CMS
 * Automatically posts to Instagram and Discord
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Sanity webhook received:', JSON.stringify(body, null, 2));

    // Sanity webhook payload structure
    const { _type, _id, title, date, description, location, image } = body;

    // Only process event documents
    if (_type !== 'event') {
      return NextResponse.json({ message: 'Not an event document' }, { status: 200 });
    }

    // Check if this is a new publish event (not an update)
    // You can customize this logic based on your needs
    const isNewEvent = body._rev && body._rev.includes('-1.');

    if (!isNewEvent) {
      console.log('Event update (not new), skipping social media posting');
      return NextResponse.json({ message: 'Event updated, not posting to social' }, { status: 200 });
    }

    // Post to Discord
    await postToDiscord({ title, date, description, location, image, id: _id });

    // Post to Instagram (if configured)
    // Note: Instagram posting requires Instagram Business API and is more complex
    // For now, we'll just log it
    console.log('Instagram posting not yet implemented');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing Sanity webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Post event to Discord via webhook
 */
async function postToDiscord(event: any) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('Discord webhook URL not configured, skipping');
    return;
  }

  try {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const locationLabel = event.location === 'suydam' ? 'Suydam' : 'Bogart';

    // Create Discord embed
    const discordPayload = {
      embeds: [
        {
          title: `🎨 New Event: ${event.title}`,
          description: event.description,
          color: 0x6B21A8, // Purple color
          fields: [
            {
              name: '📅 Date',
              value: formattedDate,
              inline: true,
            },
            {
              name: '📍 Location',
              value: locationLabel,
              inline: true,
            },
          ],
          image: event.image?.asset?.url
            ? { url: event.image.asset.url }
            : undefined,
          footer: {
            text: 'ERF WORLD Events',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      console.error('Failed to post to Discord:', await response.text());
    } else {
      console.log('Successfully posted to Discord');
    }
  } catch (error) {
    console.error('Error posting to Discord:', error);
  }
}

/**
 * Post event to Instagram
 * Note: This requires Instagram Business API and is more complex
 * You would need to:
 * 1. Upload image to Instagram
 * 2. Create container with caption
 * 3. Publish container
 */
async function postToInstagram(event: any) {
  // Instagram posting implementation
  // This is a placeholder - actual implementation requires:
  // - Instagram Business Account
  // - Facebook Page
  // - Instagram Graph API access token
  
  console.log('Instagram posting would happen here');
  
  // Example code structure (not functional without proper setup):
  /*
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const instagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID;
  
  // Step 1: Upload image
  const imageUrl = event.image?.asset?.url;
  
  // Step 2: Create caption
  const caption = `${event.title}\n\n${event.description}\n\n📅 ${formattedDate}\n📍 ${locationLabel}\n\n#ERFWorld #${event.location}`;
  
  // Step 3: Create media container
  const containerResponse = await fetch(
    `https://graph.instagram.com/${instagramAccountId}/media`,
    {
      method: 'POST',
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken,
      }),
    }
  );
  
  // Step 4: Publish container
  const containerId = (await containerResponse.json()).id;
  await fetch(
    `https://graph.instagram.com/${instagramAccountId}/media_publish`,
    {
      method: 'POST',
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    }
  );
  */
}

