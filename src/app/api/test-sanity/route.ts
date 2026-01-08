import { NextResponse } from 'next/server';
import { getAllEvents } from '@/lib/sanity';

export async function GET() {
  try {
    const events = await getAllEvents();
    return NextResponse.json({
      success: true,
      count: events.length,
      events: events.slice(0, 3), // Return first 3 events as sample
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'NOT SET',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'NOT SET',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'NOT SET',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'NOT SET',
    }, { status: 500 });
  }
}
