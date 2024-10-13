import { User } from "@/interface/interfaces";
import {
    collection,
    addDoc,
  } from "firebase/firestore";
import { USERS_COLLECTION } from "../constants";
import { db } from "../firebase";

/**
 * Inserts a player into the Firestore database.
 *
 * @param player - The player object to be inserted.
 * @returns The ID of the inserted player.
 */
export async function createUser(user: User) {
    // Insert user data into the firestore database
    const usersCollection = collection(db, USERS_COLLECTION);
    const res = await addDoc(usersCollection, user);
    console.log("Player added with ID: ", res.id);
    return res.id;
  }
  