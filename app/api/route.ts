// import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from "next/server";
// import { connectToMongoDB } from "./config";

// connectToMongoDB();


export async function GET() {
  return NextResponse.json({success: 200});
}