import { NextRequest, NextResponse } from "next/server";
import { createBatch } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { org_ids, emp_ids, start_date, end_date } = body;

    if (!org_ids || !emp_ids || !start_date || !end_date) {
      return NextResponse.json(
        { status: 0, message: "Missing required fields: org_ids, emp_ids, start_date, end_date" },
        { status: 400 }
      );
    }

    const empIdList = String(emp_ids).split(",").filter(Boolean);
    if (empIdList.length === 0) {
      return NextResponse.json(
        { status: 0, message: "Please select at least one employee" },
        { status: 400 }
      );
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return NextResponse.json(
        { status: 0, message: "Invalid date range" },
        { status: 400 }
      );
    }

    const days = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    if (days > 30) {
      return NextResponse.json(
        { status: 0, message: "Date range cannot exceed 30 days" },
        { status: 400 }
      );
    }

    const batch = createBatch({
      org_ids: String(org_ids),
      emp_ids: String(emp_ids),
      start_date,
      end_date,
      total_employees: empIdList.length,
    });

    return NextResponse.json({
      status: "chunked",
      batch_id: batch.id,
      total_employees: batch.total_employees,
      total_chunks: batch.total_chunks,
      message: `Sync started for ${batch.total_employees} employees in ${batch.total_chunks} batches`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { status: 0, message: "Failed to start sync" },
      { status: 500 }
    );
  }
}
