import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seniorManagerId = searchParams.get('seniorManagerId');
    
    if (!seniorManagerId) {
      return NextResponse.json({
        success: false,
        error: 'seniorManagerId is required'
      }, { status: 400 });
    }
    
    // Test the team API
    const teamResponse = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/senior-management/team?seniorManagerId=${seniorManagerId}`,
      { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const teamResult = await teamResponse.json();
    
    // Test the objectives API
    const objectivesResponse = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/senior-management/assigned-objectives?seniorManagerId=${seniorManagerId}`,
      { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const objectivesResult = await objectivesResponse.json();
    
    return NextResponse.json({
      success: true,
      data: {
        seniorManagerId,
        teamAPI: {
          status: teamResponse.status,
          result: teamResult
        },
        objectivesAPI: {
          status: objectivesResponse.status,
          result: objectivesResult
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Test API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test APIs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}