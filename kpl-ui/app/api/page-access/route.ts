import { NextRequest, NextResponse } from "next/server";
import PageAccessSetting from "@/models/PageAccessSetting";
import '@/lib/db-init';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch all page access settings
export async function GET() {
  try {
    const settings = await PageAccessSetting.findAll({
      order: [['page_route', 'ASC']],
    });

    return NextResponse.json(settings);
  } catch (e) {
    console.error("Error fetching page access settings: ", e);
    return NextResponse.json(
      { message: "Failed to fetch page access settings", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create new page access setting (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { page_route, page_name, public_access, allowed_roles, description } = body;

    // Validate required fields
    if (!page_route || !page_name) {
      return NextResponse.json(
        { message: "Missing required fields: page_route and page_name are required" },
        { status: 400 }
      );
    }

    // Validate allowed_roles if provided
    if (allowed_roles !== undefined && allowed_roles !== null) {
      if (!Array.isArray(allowed_roles)) {
        return NextResponse.json(
          { message: "allowed_roles must be an array" },
          { status: 400 }
        );
      }
      const validRoles = ['admin', 'manager', 'user', 'public'];
      const invalidRoles = allowed_roles.filter((role: string) => !validRoles.includes(role));
      if (invalidRoles.length > 0) {
        return NextResponse.json(
          { message: `Invalid roles: ${invalidRoles.join(', ')}. Valid roles are: ${validRoles.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Check if route already exists
    const existing = await PageAccessSetting.findOne({ where: { page_route } });
    if (existing) {
      return NextResponse.json(
        { message: "Page access setting for this route already exists" },
        { status: 409 }
      );
    }

    // Create new setting
    const newSetting = await PageAccessSetting.create({
      page_route,
      page_name,
      public_access: public_access ?? false,
      allowed_roles: allowed_roles || null,
      description: description || null,
    });

    return NextResponse.json(newSetting, { status: 201 });
  } catch (e) {
    console.error("Error creating page access setting: ", e);
    return NextResponse.json(
      { message: "Failed to create page access setting", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH - Update page access setting (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, page_route, page_name, public_access, allowed_roles, description } = body;

    // Validate ID
    if (!id) {
      return NextResponse.json(
        { message: "Setting ID is required" },
        { status: 400 }
      );
    }

    // Validate allowed_roles if provided
    if (allowed_roles !== undefined && allowed_roles !== null) {
      if (!Array.isArray(allowed_roles)) {
        return NextResponse.json(
          { message: "allowed_roles must be an array" },
          { status: 400 }
        );
      }
      const validRoles = ['admin', 'manager', 'user', 'public'];
      const invalidRoles = allowed_roles.filter((role: string) => !validRoles.includes(role));
      if (invalidRoles.length > 0) {
        return NextResponse.json(
          { message: `Invalid roles: ${invalidRoles.join(', ')}. Valid roles are: ${validRoles.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Find setting
    const setting = await PageAccessSetting.findByPk(id);
    if (!setting) {
      return NextResponse.json(
        { message: "Page access setting not found" },
        { status: 404 }
      );
    }

    // Update setting with provided fields
    const updateData: Partial<typeof setting> = {};
    if (page_route !== undefined) updateData.page_route = page_route;
    if (page_name !== undefined) updateData.page_name = page_name;
    if (public_access !== undefined) updateData.public_access = public_access;
    if (allowed_roles !== undefined) updateData.allowed_roles = allowed_roles;
    if (description !== undefined) updateData.description = description;

    await setting.update(updateData);

    return NextResponse.json(setting);
  } catch (e) {
    console.error("Error updating page access setting: ", e);
    return NextResponse.json(
      { message: "Failed to update page access setting", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete page access setting (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: "Setting ID is required" },
        { status: 400 }
      );
    }

    // Find and delete setting
    const setting = await PageAccessSetting.findByPk(parseInt(id));
    if (!setting) {
      return NextResponse.json(
        { message: "Page access setting not found" },
        { status: 404 }
      );
    }

    await setting.destroy();

    return NextResponse.json({ message: "Page access setting deleted successfully" });
  } catch (e) {
    console.error("Error deleting page access setting: ", e);
    return NextResponse.json(
      { message: "Failed to delete page access setting", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
