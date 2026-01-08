import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;
    console.log("Fetching report for employee:", employeeId);

    // Fetch employee details
    const employee = await prisma.mboUser.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        name: true,
        email: true,
        title: true,
        role: true,
        phone: true,
        salary: true,
        allocatedBonusAmount: true,
        department: {
          select: {
            id: true,
            name: true
          }
        },
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!employee) {
      console.log("Employee not found:", employeeId);
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    // Fetch objectives for this employee
    const objectives = await prisma.mboObjective.findMany({
      where: {
        userId: employeeId
      },
      include: {
        reviews: {
          select: {
            id: true,
            reviewType: true,
            score: true
          }
        }
      }
    });

    // Calculate totals
    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter((obj: any) => 
      obj.reviews?.some((review: any) => review.score !== null && review.score > 0)
    ).length;
    const completionRate = totalObjectives > 0 
      ? Math.round((completedObjectives / totalObjectives) * 100)
      : 0;

    // Calculate average performance score
    let totalScore = 0;
    let scoreCount = 0;
    objectives.forEach((obj: any) => {
      obj.reviews?.forEach((review: any) => {
        if (review.score !== null && review.score > 0) {
          totalScore += review.score;
          scoreCount++;
        }
      });
    });
    const performanceScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    // Fetch latest bonus information
    const bonus = await prisma.mboBonus.findFirst({
      where: {
        employeeId: employeeId
      },
      orderBy: {
        calculatedAt: "desc"
      },
      select: {
        id: true,
        finalAmount: true,
        status: true,
        quarter: true,
        year: true
      }
    });

    const report = {
      employee,
      totalObjectives,
      completedObjectives,
      completionRate,
      performanceScore,
      bonusAmount: bonus?.finalAmount || 0,
      bonusStatus: bonus?.status || "PENDING"
    };

    console.log("Returning report:", JSON.stringify(report, null, 2));

    return NextResponse.json({
      success: true,
      report
    });
  } catch (error) {
    console.error("Error fetching employee report:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: `Failed to fetch employee report: ${errorMessage}` },
      { status: 500 }
    );
  }
}
