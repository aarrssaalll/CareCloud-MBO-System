import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const employees = await prisma.mboUser.findMany({
      where: {
        role: {
          in: ["EMPLOYEE", "MANAGER", "SENIOR_MANAGEMENT", "employee", "manager", "senior_manager"]
        }
      },
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
      },
      orderBy: {
        name: "asc"
      }
    });

    return NextResponse.json({
      success: true,
      employees: employees
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

