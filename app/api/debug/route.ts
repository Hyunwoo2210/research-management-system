import { NextResponse } from "next/server";

export async function GET() {
  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET ? 'SET' : 'NOT SET',
      UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID ? 'SET' : 'NOT SET',
      UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN ? 'SET' : 'NOT SET',
      timestamp: new Date().toISOString()
    };
    
    console.log('Environment check:', envCheck);
    
    return NextResponse.json(envCheck);
  } catch (error) {
    console.error('Debug check failed:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
