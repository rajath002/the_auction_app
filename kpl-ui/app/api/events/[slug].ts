import { ContextType } from "@/interface/nextjs-custom-types";
import { getEventById, updateEvent } from "@/utils/database/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * @api {get} /events/:slug - Get event by slug
 */
export async function GET(_: NextRequest, context: ContextType) {
  try {
    const { slug } = context.params;
    const event = await getEventById(slug);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(event);
  } catch (error) {
    console.error("Something went wrong:", error);
    return NextResponse.json(
      { message: "Something went Wrong!" },
      { status: 500 }
    );
  }
}

/**
 * @api {put} /events/:slug - Update a event
 */
export async function PATCH(request: NextRequest, context: ContextType) {
  try {
    const { slug } = context.params;
    const event = await getEventById(slug);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }
    const body = await request.json();
    const updatedEvent = { ...event, ...body };
    // Update the event in the database
    // await updateEvent(slug, updatedEvent);
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Something went wrong:", error);
    return NextResponse.json(
      { message: "Something went Wrong!" },
      { status: 500 }
    );
  }
}

/**
 * @api {delete} /events/:slug - Delete a event
 */
export async function DELETE(_: NextRequest, context: ContextType) {
  try {
    const { slug } = context.params;
    const event = await updateEvent(slug, { isDeleted: true });
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }
    // Delete the event from the database
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Something went wrong:", error);
    return NextResponse.json(
      { message: "Something went Wrong!" },
      { status: 500 }
    );
  }
}