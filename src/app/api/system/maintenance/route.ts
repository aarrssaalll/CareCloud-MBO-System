import { NextRequest, NextResponse } from 'next/server';

// Store maintenance mode in a simple in-memory store or use environment variables
// For production, this should be stored in a database
let maintenanceMode = false;

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching maintenance mode status...');
    
    // Check environment variable or use stored value
    const envMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
    const currentStatus = maintenanceMode || envMaintenanceMode;

    return NextResponse.json({
      success: true,
      maintenanceMode: currentStatus
    });

  } catch (error) {
    console.error('❌ Error fetching maintenance mode:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance mode status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enabled } = body;

    console.log(`🔧 Setting maintenance mode to: ${enabled}`);

    // Update the in-memory store
    maintenanceMode = enabled;

    // In production, you would save this to a database
    // For now, we'll use localStorage on client or environment variable

    return NextResponse.json({
      success: true,
      maintenanceMode: enabled,
      message: enabled 
        ? 'Maintenance mode enabled. Only HR and Senior Managers can login.' 
        : 'Maintenance mode disabled. All users can login.'
    });

  } catch (error) {
    console.error('❌ Error setting maintenance mode:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set maintenance mode' },
      { status: 500 }
    );
  }
}
