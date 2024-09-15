import { NextRequest, NextResponse } from "next/server";
import playersOld from "@/data/playerslist-old.json";
import { connectToMongoDB, database, client, closeConnection } from "../config";
import players from "@/data/players.json";
import {
  insertPlayer,
  fetchPlayers,
  uploadImage,
} from "@/utils/database/database";
import { Player } from "@/interface/interfaces";


// TODO : fix the exception in reading the file
export async function POST(request: NextRequest) {
  try {
    console.log("Request received here");
    const formData = await request.formData();

    const newID = crypto.randomUUID();
    const uploadedFile = await formData.get("uploadedFile") as File;
    const buffer = Buffer.from(await uploadedFile.arrayBuffer());
    const [name, phone, email, imageName] = await Promise.all([
      formData.get("name"),
      formData.get("phone"),
      formData.get("email"),
      uploadedFile.name,
    ]);

    let downloadLink: string | null = null;
  
    console.log("Uploaded file Value:", uploadedFile);
    if (uploadedFile) {
      try {
        downloadLink = await uploadImage(uploadedFile, newID + "_" + imageName);
        console.log("Image uploaded successfully:", downloadLink);
      } catch (error) {
        debugger;
        console.error("Image upload failed:", error);
        return NextResponse.json(
          { message: "Image upload failed" },
          { status: 500 }
        );
      }
    }
    if (!downloadLink) {
      return NextResponse.json({ message: "Image upload failed" }, { status: 500 });
    }

    const payload: Player = {
      vID: newID, // virtual ID
      image:
        downloadLink, // "https://akm-img-a-in.tosshub.com/indiatoday/images/story/202404/will-jacks-11182032-16x9_0.jpeg?VersionId=HTAs3GZWAKV_OUhF3pZoRnmwr3V3rqLd&size=690:388",
      stats: {
        baseValue: 200,
        bidValue: 200,
        currentTeamId: null,
        status: null,
      },
      currentBid: 100,
      type: "Batsman",
      category: "L1",
      isDeleted: false,
      
      name: name as string,
      phone: phone ? parseInt(phone as string) : 0,
      email: email as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await insertPlayer(payload);
    console.log("Data received successfully:", payload);
    // Respond with a success message
    return NextResponse.json({
      message: "Data received successfully",
      data: payload,
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

export async function PATCH(req: NextRequest) {
  try {
    await connectToMongoDB();
    const playersCollection = database.collection("players");
    console.log("Request received here");
    const data = await req.json();
    const id = data.id;
    // const _id = data._id;
    delete data.id;
    delete data._id;
    await playersCollection.updateOne({ id }, { $set: { ...data } });
    return NextResponse.json({ success: "raj", result: data });
  } catch (error) {
    console.error("something went wrong", error);
    return NextResponse.json(error, { status: 500 });
  } finally {
    closeConnection();
    console.log("finally executed");
  }
}

export async function GET() {
  try {
    // TODO: fetch players based on the event ID
    const players = await fetchPlayers();
    return NextResponse.json(players);
  } catch (error) {
    console.log("Error : ", error);
    return NextResponse.json(error, { status: 500 });
  }
}

/**
 * @api {delete} /players/:id - Delete a player
 */
export async function DELETE() {
  return NextResponse.json({ message: "Not Implemented" }, { status: 501 });
}
