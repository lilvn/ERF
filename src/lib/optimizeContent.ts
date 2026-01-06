/**
 * Content Optimization for Instagram Imports
 * Removes @ mentions, # hashtags, and formats text for website display
 */

export interface OptimizedContent {
  description: string;
  detectedDate?: string;
  detectedLocation?: 'suydam' | 'bogart';
}

/**
 * Optimize Instagram caption for website display
 */
export function optimizeInstagramCaption(caption: string): OptimizedContent {
  let description = caption;
  
  // Remove hashtags (but keep the words)
  description = description.replace(/#(\w+)/g, '$1');
  
  // Remove @ mentions (keep just the username without @)
  description = description.replace(/@(\w+)/g, '$1');
  
  // Clean up extra whitespace
  description = description.replace(/\s+/g, ' ').trim();
  
  // Try to detect location from caption
  let detectedLocation: 'suydam' | 'bogart' | undefined;
  const lowerCaption = caption.toLowerCase();
  
  if (lowerCaption.includes('suydam')) {
    detectedLocation = 'suydam';
  } else if (lowerCaption.includes('bogart')) {
    detectedLocation = 'bogart';
  }
  
  // Try to detect date from caption
  const detectedDate = extractDate(caption);
  
  return {
    description,
    detectedDate,
    detectedLocation,
  };
}

/**
 * Extract date from text using various patterns
 */
function extractDate(text: string): string | undefined {
  // Pattern 1: "Jan 15, 2026" or "January 15, 2026"
  const pattern1 = /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}/i;
  const match1 = text.match(pattern1);
  if (match1) {
    return new Date(match1[0]).toISOString();
  }
  
  // Pattern 2: "1/15/2026" or "01/15/2026"
  const pattern2 = /\d{1,2}\/\d{1,2}\/\d{4}/;
  const match2 = text.match(pattern2);
  if (match2) {
    return new Date(match2[0]).toISOString();
  }
  
  // Pattern 3: "15th of January" (requires current year assumption)
  const pattern3 = /(\d{1,2})(?:st|nd|rd|th)\s+of\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)/i;
  const match3 = text.match(pattern3);
  if (match3) {
    const currentYear = new Date().getFullYear();
    return new Date(`${match3[0]} ${currentYear}`).toISOString();
  }
  
  return undefined;
}

/**
 * Validate Instagram webhook signature
 */
export function validateInstagramWebhook(signature: string, body: string, secret: string): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}

