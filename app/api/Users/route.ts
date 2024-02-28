
import { NextRequest, NextResponse } from "next/server";
import users from "@/data/userlist.json";
import { client, database } from "../config";




export async function POST(request: NextRequest) {
    try{
    await client.connect();
    const userscollection = database.collection("users");
    const result= await userscollection.insertMany(users);
    return NextResponse.json(result) 
    }
    catch(err){
    return NextResponse.json({message: "Invalid Credentials"}, {status: 400})
    }
    finally{
        await client.close();
  }
}

export async function PATCH() {
  return NextResponse.json({ success: "KPL UPDATED" });
}

export async function GET() {
  return NextResponse.json(users);
}

export async function DELETE () {
  return 
}
