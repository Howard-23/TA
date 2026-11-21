import { NextRequest, NextResponse } from "next/server";
import { getEmployeesByOrgIds } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orgIds: string[] = Array.isArray(body.organization_ids)
      ? body.organization_ids
      : String(body.organization_ids || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);

    if (!orgIds.length) {
      return NextResponse.json(
        { status: 0, message: "Please select at least one organization" },
        { status: 400 }
      );
    }

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    const users = getEmployeesByOrgIds(orgIds).map((e) => ({
      id: e.id,
      title: `${e.name} (${e.emp_code})`,
      parent_id: e.organization_id,
      name: e.name,
      emp_code: e.emp_code,
      organization_name: e.organization_name,
    }));

    return NextResponse.json({
      status: 1,
      users,
      message: `Loaded ${users.length} employees`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { status: 0, message: "Failed to load employees" },
      { status: 500 }
    );
  }
}
