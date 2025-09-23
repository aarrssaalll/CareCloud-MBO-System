import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // For now, return dynamic sample notifications until notification table is fully implemented
    const sampleNotifications = [
      {
        id: `notif_${Date.now()}_1`,
        type: 'info',
        title: 'Welcome to CareCloud MBO',
        message: 'Your performance tracking system is ready. Start by reviewing your current objectives.',
        timestamp: new Date().toISOString(),
        read: false,
        actionRequired: false
      },
      {
        id: `notif_${Date.now()}_2`,
        type: 'success',
        title: 'System Update',
        message: 'Live data integration has been activated. All dashboards now show real-time database information.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        read: false,
        actionRequired: false
      },
      {
        id: `notif_${Date.now()}_3`,
        type: 'warning',
        title: 'Objective Review Reminder',
        message: 'You have objectives that may need your attention or completion. Check your performance dashboard.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        read: true,
        actionRequired: true
      }
    ];
    
    return NextResponse.json(sampleNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
