import { NextRequest, NextResponse } from 'next/server';
import { MboDataSeeder } from '../../../lib/database/mbo-seeder';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting MBO database initialization...');
    
    const seeder = new MboDataSeeder();
    const result = await seeder.seedOrganizationalData();
    
    return NextResponse.json({
      success: true,
      message: 'MBO database initialized successfully',
      data: result,
    });
  } catch (error) {
    console.error('❌ Error initializing MBO database:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to initialize MBO database',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'MBO Database Seeder API',
    endpoints: {
      'POST /api/mbo/seed': 'Initialize MBO database with organizational structure',
    },
  });
}
