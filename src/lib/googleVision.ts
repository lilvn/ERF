import vision from '@google-cloud/vision';

/**
 * Google Cloud Vision API service for extracting text from event flyer images
 */

// Initialize Vision API client with API key
const getVisionClient = () => {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  
  if (!apiKey) {
    console.error('GOOGLE_CLOUD_VISION_API_KEY not set');
    return null;
  }

  return new vision.ImageAnnotatorClient({
    apiKey: apiKey,
  });
};

export interface ExtractedEventData {
  title?: string;
  date?: string;
  time?: string;
  location?: 'suydam' | 'bogart';
  description?: string;
  fullText: string;
}

/**
 * Extract text from an image URL using Google Cloud Vision API
 */
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  const client = getVisionClient();
  
  if (!client) {
    throw new Error('Vision API client not initialized');
  }

  try {
    console.log('Analyzing image with Google Vision API:', imageUrl);
    
    // Perform text detection on the image
    const [result] = await client.textDetection(imageUrl);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      console.log('No text detected in image');
      return '';
    }

    // The first annotation contains all detected text
    const fullText = detections[0]?.description || '';
    
    console.log('Extracted text from flyer:', fullText.substring(0, 200) + '...');
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
}

/**
 * Parse extracted text to find event details
 */
export function parseEventDetails(text: string): ExtractedEventData {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  let title: string | undefined;
  let date: string | undefined;
  let time: string | undefined;
  let location: 'suydam' | 'bogart' | undefined;
  let description: string | undefined;

  // Extract title (usually the first significant line or largest text)
  if (lines.length > 0) {
    // Look for a title-like line (usually short and at the top)
    title = lines.find(line => 
      line.length > 3 && 
      line.length < 100 && 
      !line.match(/\d{1,2}[\/\-\.]\d{1,2}/) && // Not a date
      !line.match(/\d{1,2}:\d{2}/) // Not a time
    ) || lines[0];
  }

  // Extract date
  date = extractDate(text);

  // Extract time
  time = extractTime(text);

  // Extract location
  location = extractLocation(text);

  // Extract description (all non-title, non-date, non-time text)
  const descriptionLines = lines.filter(line => {
    if (!title || line === title) return false;
    if (line.length < 5) return false;
    // Keep substantive lines
    return line.length > 10 || line.match(/[a-z]/);
  });
  
  description = descriptionLines.join(' ').substring(0, 500);

  return {
    title,
    date,
    time,
    location,
    description: description || text.substring(0, 500),
    fullText: text,
  };
}

/**
 * Extract date from text using various patterns
 */
function extractDate(text: string): string | undefined {
  // Pattern 1: "January 15, 2026" or "Jan 15, 2026"
  const pattern1 = /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}/i;
  const match1 = text.match(pattern1);
  if (match1) {
    try {
      return new Date(match1[0]).toISOString();
    } catch {
      // Continue to next pattern
    }
  }

  // Pattern 2: "1/15/2026" or "01/15/2026"
  const pattern2 = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/;
  const match2 = text.match(pattern2);
  if (match2) {
    try {
      return new Date(match2[0]).toISOString();
    } catch {
      // Continue to next pattern
    }
  }

  // Pattern 3: "15th January" or "Jan 15th" (assume current year)
  const pattern3 = /(?:\d{1,2}(?:st|nd|rd|th)\s+(?:of\s+)?)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?/i;
  const match3 = text.match(pattern3);
  if (match3) {
    try {
      const currentYear = new Date().getFullYear();
      return new Date(`${match3[0]} ${currentYear}`).toISOString();
    } catch {
      // Continue
    }
  }

  // Pattern 4: "Saturday, Jan 15" (assume current/next year)
  const pattern4 = /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}/i;
  const match4 = text.match(pattern4);
  if (match4) {
    try {
      const currentYear = new Date().getFullYear();
      const dateStr = match4[0].replace(/^[A-Za-z]+,?\s+/, ''); // Remove day of week
      return new Date(`${dateStr} ${currentYear}`).toISOString();
    } catch {
      // Continue
    }
  }

  return undefined;
}

/**
 * Extract time from text
 */
function extractTime(text: string): string | undefined {
  // Pattern 1: "7pm", "7:00pm", "7:00 PM"
  const pattern1 = /\d{1,2}:\d{2}\s*(?:am|pm|AM|PM)/i;
  const match1 = text.match(pattern1);
  if (match1) {
    return match1[0];
  }

  // Pattern 2: "7pm" (no colon)
  const pattern2 = /\d{1,2}\s*(?:am|pm|AM|PM)/i;
  const match2 = text.match(pattern2);
  if (match2) {
    return match2[0];
  }

  // Pattern 3: "19:00" (24-hour format)
  const pattern3 = /\d{2}:\d{2}/;
  const match3 = text.match(pattern3);
  if (match3) {
    return match3[0];
  }

  return undefined;
}

/**
 * Extract location (Suydam or Bogart) from text
 */
function extractLocation(text: string): 'suydam' | 'bogart' | undefined {
  const lowerText = text.toLowerCase();
  
  // Check for Suydam mentions
  if (lowerText.includes('suydam')) {
    return 'suydam';
  }
  
  // Check for Bogart mentions
  if (lowerText.includes('bogart')) {
    return 'bogart';
  }

  // Check for street addresses
  if (lowerText.match(/\d+\s+suydam/i)) {
    return 'suydam';
  }
  
  if (lowerText.match(/\d+\s+bogart/i)) {
    return 'bogart';
  }

  // Default to Suydam if no location found
  return 'suydam';
}

/**
 * Combine date and time into a single ISO string
 */
export function combineDateAndTime(dateStr: string | undefined, timeStr: string | undefined): string {
  if (!dateStr) {
    // If no date found, use current date
    return new Date().toISOString();
  }

  if (!timeStr) {
    // If no time found, use the date as-is
    return dateStr;
  }

  try {
    const date = new Date(dateStr);
    
    // Parse time
    const timeMatch = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2] || '0');
      const period = timeMatch[3]?.toLowerCase();

      // Convert to 24-hour format
      if (period === 'pm' && hours < 12) {
        hours += 12;
      } else if (period === 'am' && hours === 12) {
        hours = 0;
      }

      date.setHours(hours, minutes, 0, 0);
    }

    return date.toISOString();
  } catch (error) {
    console.error('Error combining date and time:', error);
    return dateStr;
  }
}

