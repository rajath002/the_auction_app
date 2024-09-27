import { db, storage } from "../firebase";
import { Player } from "../../interface/interfaces";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { PLAYERS_COLLECTION, EVENTS_COLLECTION } from "@/utils/constants";
import { Event } from "@/interface/interfaces";
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from "firebase/storage";

/**
 * Inserts a player into the Firestore database.
 *
 * @param player - The player object to be inserted.
 * @returns The ID of the inserted player.
 */
export async function insertPlayer(player: Player) {
  // Insert player data into the firestore database
  const playersCollection = collection(db, PLAYERS_COLLECTION);
  const res = await addDoc(playersCollection, player);
  console.log("Player added with ID: ", res.id);
  return res.id;
}

/**
 * Insert multiple players into the Firestore database.
 * @param players - The list of players to be inserted.
 * @returns The IDs of the inserted players.
 * @returns null if the insertion fails.
 */
export async function insertMultiplePlayers(players: Player[]): Promise<true | Error> {

  // Insert player data into the firestore database
  const batch = writeBatch(db);  // Initialize the batch
  const playersCollectionRef = collection(db, PLAYERS_COLLECTION);

  players.forEach((player) => {
    const newPlayerRef = doc(playersCollectionRef);  // Generate a new document reference
    batch.set(newPlayerRef, player);  // Add player data to the batch
  });

  try {
    await batch.commit();  // Commit the batch request
    console.log("Players successfully added to the database!");
  } catch (error) {
    console.error("Error adding players to the database: ", error);
    throw error
  }

  return true;
}

/**
 * Uploads an image to the Firebase storage.
 * 
 * @param file - The image file to upload.
 * @param fileName - The name of the file to be uploaded.
 * @param setProgress - A function to set the upload progress.
 * @returns The URL of the uploaded image.
 * @returns null if the upload fails.
 */
export async function uploadImage(file: File, fileName?: string, uploadProgress?: (progress: number) => void) {
    return new Promise<string>((resolve, reject) => {
      // Create a storage reference
      const storageRef_ = storageRef(storage, `images/${fileName}`);
  
      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef_, file);
  
      // Listen for state changes, errors, and completion
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Calculate and update the upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          uploadProgress && uploadProgress(progress);
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error("Upload failed", error);
          reject(error);
        },
        () => {
          // Handle successful uploads and get the file's URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            resolve(downloadURL);
          });
        }
      );
    });
  };


/**
 * Fetches all players from the Firestore database.
 *
 * @returns A list of all players in the database.
 */
export async function fetchPlayers() {
  // Fetch all players from the firestore database
  const players: Player[] = [];
  const playersCollection = collection(db, PLAYERS_COLLECTION);
  const querySnapshot = await getDocs(playersCollection);
  querySnapshot.forEach((doc) => {
    players.push(doc.data() as Player);
  });
  console.log("Players fetched: ", players);
  return players;
}

/**
 * Fetches a player by their ID from the Firestore database.
 *
 * @param id - The ID of the player to fetch.
 * @returns The player object with the given ID.
 * @returns null if No player with the given ID is found.
 */
export async function getPlayerById(id: string) {
  const playersCollection = collection(db, PLAYERS_COLLECTION);
  const querySnapshot = await getDocs(playersCollection);
  let player: Player | null = null;
  querySnapshot.forEach((doc) => {
    if (doc.id === id) {
      player = doc.data() as Player;
    }
  });
  return player;
}

/**
 * Updates a player.
 * @param id - The ID of the player to update.
 * @param player - The updated player object.
 * @returns The ID of the updated player.
 * @returns null if No player with the given ID is found.
 */
export async function updatePlayerById(id: string, player: Partial<Player>) {
  const playersCollection = collection(db, PLAYERS_COLLECTION);
  const playerDocRef = doc(playersCollection, id);
  const docSnap = await getDoc(playerDocRef);
  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    await updateDoc(playerDocRef, player);
  } else {
    console.log("No such document!");
    return null;
  }
  console.log("Player updated with ID: ", id);
  return id;
}

/**
 * Creates a Event in the Firestore database.
 * @param event
 * @returns The ID of the created event.
 */
export async function createEvent(event: Event) {
  // Create a event
  const eventsCollection = collection(db, EVENTS_COLLECTION);
  const res = await addDoc(eventsCollection, event);
  console.log("Event created with ID: ", res.id);
  return res.id;
}

/**
 * Fetches all events from the Firestore database.
 * @returns A list of all events in the database.
 */
export async function fetchEvents() {
  // Fetch all events from the firestore database
  const events: Event[] = [];
  const eventsCollection = collection(db, EVENTS_COLLECTION);
  const querySnapshot = await getDocs(eventsCollection);
  querySnapshot.forEach((doc) => {
    events.push(doc.data() as Event);
  });
  return events;
}

/**
 * Fetches a event by their ID from the Firestore database.
 *
 * @param id - The ID of the event to fetch.
 * @returns The event object with the given ID.
 * @returns null if No event with the given ID is found.
 */
export async function getEventById(id: string) {
  // Get a reference to the document
  const docRef = doc(db, "EVENTS_COLLECTION", id);

  // Get the document
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    return docSnap.data() as Event;
  } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
    return null;
  }
}

/**
 * Updates a event.
 * @param id - The ID of the event to update.
 * @param event - The updated event object.
 * @returns The ID of the updated event.
 * @returns null if No event with the given ID is found.
 */
export async function updateEvent(id: string, event: Partial<Event>) {
  const eventsCollection = collection(db, EVENTS_COLLECTION);
  const eventDocRef = doc(eventsCollection, id);
  const docSnap = await getDoc(eventDocRef);
  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    await updateDoc(eventDocRef, event);
  } else {
    console.log("No such document!");
    return null;
  }
  console.log("Event updated with ID: ", id);
  return id;
}
