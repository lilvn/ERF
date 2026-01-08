import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'NOT SET',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'NOT SET',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || 'NOT SET',
    message: 'Environment variables check'
  });
}
