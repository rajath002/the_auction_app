// auth is imported from firebase.ts
import { NextRequest, NextResponse } from "next/server";
import { signUp } from "../util";
import { createUser } from "@/utils/database/user.db";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await signUp(body.email, body.password);

    // TODO - save user to database
    const result = await createUser({
      userName: body.userName,
      gender: body.gender,
      phone: body.phone,
      email: body.email,
    });

    console.log("User created in database", result);
    
    return NextResponse.json({ message: "Sign up successful", user });
  } catch (error) {
    console.error("Error during sign in:", error);
    return NextResponse.json({ message: "Sign up failed", error }, { status: 500 });
  }
}
