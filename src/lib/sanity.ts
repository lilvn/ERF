import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { apiVersion, dataset, projectId } from '../../sanity/env';

// Lazy client initialization to avoid build-time errors
let _client: ReturnType<typeof createClient> | null = null;
let _writeClient: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!_client && projectId) {
    _client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: 'published',
    });
  }
  return _client;
}

function getWriteClient() {
  if (!_writeClient && projectId) {
    _writeClient = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: process.env.SANITY_API_TOKEN,
      perspective: 'published',
    });
  }
  return _writeClient;
}

// Export lazy-initialized clients
export const client = getClient();
export const writeClient = getWriteClient();

// Image URL builder
export function urlFor(source: any) {
  const c = getClient();
  if (!c) return { url: () => '' };
  const builder = imageUrlBuilder(c);
  return builder.image(source);
}

// Type definitions for Event
export interface SanityEvent {
  _id: string;
  _type: 'event';
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: {
    current: string;
  };
  image: {
    asset: {
      _ref: string;
      _type: 'reference';
      _id?: string;
      url?: string;
      metadata?: {
        dimensions?: {
          width: number;
          height: number;
          aspectRatio: number;
        };
      };
    };
    hotspot?: {
      x: number;
      y: number;
      height: number;
      width: number;
    };
  };
  date: string;
  description: string;
  location: 'suydam' | 'bogart';
  instagramUrl?: string;
  importedFromInstagram?: boolean;
  postedToDiscord?: boolean;
  publishedAt?: string;
}

// GROQ Queries
export const EVENTS_QUERY = `*[_type == "event" && defined(publishedAt)] | order(date desc) {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  slug,
  image {
    asset-> {
      _id,
      url,
      metadata {
        dimensions {
          width,
          height,
          aspectRatio
        }
      }
    },
    hotspot
  },
  date,
  description,
  location,
  instagramUrl,
  importedFromInstagram,
  postedToDiscord,
  publishedAt
}`;

export const EVENTS_BY_LOCATION_QUERY = `*[_type == "event" && defined(publishedAt) && location == $location] | order(date desc) {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  slug,
  image {
    asset-> {
      _id,
      url,
      metadata {
        dimensions {
          width,
          height,
          aspectRatio
        }
      }
    },
    hotspot
  },
  date,
  description,
  location,
  instagramUrl,
  importedFromInstagram,
  postedToDiscord,
  publishedAt
}`;

export const EVENTS_BY_MONTH_QUERY = `*[_type == "event" && defined(publishedAt) && date >= $startDate && date < $endDate] | order(date asc) {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  slug,
  image {
    asset-> {
      _id,
      url,
      metadata {
        dimensions {
          width,
          height,
          aspectRatio
        }
      }
    },
    hotspot
  },
  date,
  description,
  location,
  instagramUrl,
  importedFromInstagram,
  postedToDiscord,
  publishedAt
}`;

export const UPCOMING_EVENTS_QUERY = `*[_type == "event" && defined(publishedAt) && date >= $now] | order(date asc) {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  slug,
  image {
    asset-> {
      _id,
      url,
      metadata {
        dimensions {
          width,
          height,
          aspectRatio
        }
      }
    },
    hotspot
  },
  date,
  description,
  location,
  instagramUrl,
  importedFromInstagram,
  postedToDiscord,
  publishedAt
}`;

// Helper functions
export async function getAllEvents(): Promise<SanityEvent[]> {
  if (!client) return [];
  return await client.fetch(EVENTS_QUERY);
}

export async function getEventsByLocation(location: 'suydam' | 'bogart'): Promise<SanityEvent[]> {
  if (!client) return [];
  return await client.fetch(EVENTS_BY_LOCATION_QUERY, { location });
}

export async function getEventsByMonth(year: number, month: number): Promise<SanityEvent[]> {
  if (!client) return [];
  const startDate = new Date(year, month, 1).toISOString();
  const endDate = new Date(year, month + 1, 1).toISOString();
  return await client.fetch(EVENTS_BY_MONTH_QUERY, { startDate, endDate });
}

export async function getUpcomingEvents(): Promise<SanityEvent[]> {
  if (!client) return [];
  const now = new Date().toISOString();
  return await client.fetch(UPCOMING_EVENTS_QUERY, { now });
}

// Get all months that have events
export async function getMonthsWithEvents(): Promise<{ year: number; month: number; count: number }[]> {
  if (!client) return [];
  
  const query = `*[_type == "event" && defined(publishedAt)] {
    "year": string::split(date, "-")[0],
    "month": string::split(date, "-")[1]
  }`;
  
  const results = await client.fetch(query);
  
  // Group by year/month and count
  const monthMap = new Map<string, number>();
  results.forEach((item: { year: string; month: string }) => {
    const key = `${item.year}-${item.month}`;
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  });
  
  // Convert to array and sort
  return Array.from(monthMap.entries())
    .map(([key, count]) => {
      const [year, month] = key.split('-');
      return { year: parseInt(year), month: parseInt(month) - 1, count };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
}

