import { createEvent } from "@/utils/database/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * @api {post} /events - Create a new event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = await createEvent(body);
    // Respond with a success message
    console.log("Data received successfully:", body);
    console.log("Generated ID:", id);
    return NextResponse.json({
      message: "Data received successfully",
      data: body,
      id: id,
    });
  } catch (error) {
    console.error("Something went wrong:", error);
    return NextResponse.json(
      { message: "Something went Wrong!" },
      { status: 500 }
    );
  }
}

