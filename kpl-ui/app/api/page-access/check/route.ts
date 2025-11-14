import { NextRequest, NextResponse } from "next/server";
import PageAccessSetting from "@/models/PageAccessSetting";
import '@/lib/db-init';

// GET - Check if a specific route is publicly accessible
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const route = searchParams.get('route');

    if (!route) {
      return NextResponse.json(
        { message: "Route parameter is required" },
        { status: 400 }
      );
    }

    const setting = await PageAccessSetting.findOne({
      where: { page_route: route }
    });

    if (!setting) {
      // If no setting exists, default to private (require authentication)
      return NextResponse.json({
        route,
        public_access: false,
        message: "No access setting found for this route. Defaulting to private."
      });
    }

    return NextResponse.json({
      route: setting.page_route,
      page_name: setting.page_name,
      public_access: setting.public_access,
      description: setting.description
    });
  } catch (e) {
    console.error("Error checking page access: ", e);
    return NextResponse.json(
      { message: "Failed to check page access", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
