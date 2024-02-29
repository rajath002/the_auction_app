import { NextRequest, NextResponse } from "next/server";
import users_signup from "@/data/usersignuplist.json";
import { client, database } from "../config";
import { NOT_IMPLEMENTED } from "../utils";

export async function POST(request: NextRequest) {
  try {
    await client.connect();
    const userscollection = database.collection("users");
    const result = await userscollection.insertMany(users_signup);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { message: "password not matching" },
      { status: 401 }
    );
  } finally {
    await client.close();
  }
}

export async function PATCH() {
  return NextResponse.json({ success: "Updated." });
}

export async function GET() {
  return NextResponse.json(users_signup);
}

export async function DELETE() {
  return NextResponse.json(NOT_IMPLEMENTED, { status: 501 });
}
