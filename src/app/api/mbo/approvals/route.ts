import { NextRequest, NextResponse } from 'next/server';
import { MboDataAccess } from '../../../../lib/database/mbo-data-access';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const approverId = searchParams.get('approverId');

    if (!approverId) {
      return NextResponse.json({
        success: false,
        message: 'Approver ID is required',
      }, { status: 400 });
    }

    const dataAccess = new MboDataAccess();
    const approvals = await dataAccess.getPendingApprovals(approverId);

    return NextResponse.json({
      success: true,
      data: approvals,
    });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch approvals',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const approval = await request.json();

    const dataAccess = new MboDataAccess();
    const approvalId = await dataAccess.createApproval(approval);

    return NextResponse.json({
      success: true,
      message: 'Approval created successfully',
      data: { id: approvalId },
    });
  } catch (error) {
    console.error('Error creating approval:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create approval',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { approvalId, status, comments } = await request.json();

    if (!approvalId || !status) {
      return NextResponse.json({
        success: false,
        message: 'Approval ID and status are required',
      }, { status: 400 });
    }

    const dataAccess = new MboDataAccess();
    await dataAccess.updateApprovalStatus(approvalId, status, comments);

    return NextResponse.json({
      success: true,
      message: `Approval ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error('Error updating approval:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update approval',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
