import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, context: any) {
    console.log("PArams", context.params)
    NextResponse.json({success: 200})
}