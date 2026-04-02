import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'API Test Route Working',
    timestamp: new Date().toISOString(),
    status: 'ok'
  });
}