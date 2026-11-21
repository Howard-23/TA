import { NextRequest, NextResponse } from "next/server";
import { getBatch } from "@/lib/mock-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const { batchId } = await params;
  const batch = getBatch(batchId);

  if (!batch) {
    return NextResponse.json(
      { status: 0, message: "Batch not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    status: 1,
    batch: {
      id: batch.id,
      status: batch.status,
      progress: batch.progress,
      total_chunks: batch.total_chunks,
      completed_chunks: batch.completed_chunks,
      total_records: batch.total_records,
      total_employees: batch.total_employees,
      error_message: batch.error_message,
      chunk_details: batch.chunk_details,
    },
  });
}
