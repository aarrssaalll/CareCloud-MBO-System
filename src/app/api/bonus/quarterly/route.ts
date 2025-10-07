import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { quarter, year } = await request.json();

    if (!quarter || !year) {
      return NextResponse.json({
        success: false,
        error: 'Quarter and year are required'
      }, { status: 400 });
    }

    // Redirect to enhanced bonus calculation endpoint
    const enhancedUrl = new URL('/api/bonus/enhanced', request.url);
    
    const enhancedResponse = await fetch(enhancedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        calculateAll: true,
        quarter,
        year
      })
    });

    const result = await enhancedResponse.json();
    return NextResponse.json(result, { status: enhancedResponse.status });

  } catch (error) {
    console.error('Error in quarterly bonus calculation:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quarter = searchParams.get('quarter');
    const year = searchParams.get('year');

    if (!quarter || !year) {
      return NextResponse.json({
        success: false,
        error: 'Quarter and year are required'
      }, { status: 400 });
    }

    // Redirect to enhanced bonus calculation endpoint
    const enhancedUrl = new URL(`/api/bonus/enhanced?quarter=${quarter}&year=${year}`, request.url);
    
    const enhancedResponse = await fetch(enhancedUrl);
    const result = await enhancedResponse.json();
    
    return NextResponse.json(result, { status: enhancedResponse.status });

  } catch (error) {
    console.error('Error fetching quarterly bonus summary:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}