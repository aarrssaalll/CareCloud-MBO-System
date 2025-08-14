import { NextRequest, NextResponse } from 'next/server';
import { MboDataAccess } from '@/lib/database/mbo-data-access';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const dataAccess = new MboDataAccess();

    switch (type) {
      case 'users':
        const users = await dataAccess.getAllUsers();
        return NextResponse.json({
          success: true,
          data: users,
        });

      case 'departments':
        const departments = await dataAccess.getAllDepartments();
        return NextResponse.json({
          success: true,
          data: departments,
        });

      case 'teams':
        const teams = await dataAccess.getAllTeams();
        return NextResponse.json({
          success: true,
          data: teams,
        });

      case 'department-performance':
        const deptMetrics = await dataAccess.getDepartmentPerformanceMetrics();
        return NextResponse.json({
          success: true,
          data: deptMetrics,
        });

      case 'team-performance':
        const departmentId = searchParams.get('departmentId');
        const teamMetrics = await dataAccess.getTeamPerformanceMetrics(departmentId || undefined);
        return NextResponse.json({
          success: true,
          data: teamMetrics,
        });

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid type parameter',
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch data',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
