// auth is imported from firebase.ts
import { NextRequest, NextResponse } from "next/server";
import { signIn } from "../util";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await signIn(body.email, body.password);
    return NextResponse.json({ message: "Sign in successful", user });
  } catch (error) {
    console.error("Error during sign up:", error);
    return NextResponse.json({ message: "Sign in failed", error }, { status: 500 });
  }
}
