import { MongoClient } from "mongodb";

// Connection URL
const dbUserName = process.env.dbUserName;
const dbPassword = process.env.dbPassword;
const dbCluster = process.env.cluster;

const uri = `mongodb+srv://${dbUserName}:${dbPassword}@${dbCluster}/?retryWrites=true&w=majority`;

const mclient = new MongoClient(uri);

// Database Name
const dbName = "KPL";
const db = mclient.db(dbName);

export const database = db;

export function getClient() {
  return new MongoClient(uri);
}

// Create MongoDB client
const client = new MongoClient(uri);

let IS_LOCKED = false;

async function makeConnection() {
  try {
    IS_LOCKED = true;
    await client.connect();
    console.log("Connected to MongoDB... ");
    return;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    IS_LOCKED = false; // if it fails to establish connection
    throw error; // Re-throw the error for the caller to handle
  }
}

// Connect to MongoDB
async function connectToMongoDB() {
  while (IS_LOCKED) {
    console.log("Going to sleep mode..");
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(1);
      }, 1000);
    });
  }
  return makeConnection();
}

async function closeConnection() {
  console.log("Closing connection..");
  
  try {
    await client.close();
    console.log("Connection Closed...! ");
    return;
  } catch (error) {
    console.error("Err: Something went wrong!.. ", error);
    throw error;
  } finally {
    IS_LOCKED = false;
    console.log("Making connection false : ", IS_LOCKED);
  }
}
// Export MongoDB client and connect function
export { client, connectToMongoDB, closeConnection };
