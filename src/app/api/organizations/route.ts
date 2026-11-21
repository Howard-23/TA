import { NextResponse } from "next/server";
import { orgTreeData } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ status: 1, organizations: orgTreeData });
}
