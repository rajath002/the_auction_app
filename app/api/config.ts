// import { MongoClient } from "mongodb";

// // Connection URL
// const dbUserName = process.env.dbUserName;
// const dbPassword = process.env.dbPassword;
// const dbCluster = process.env.cluster;

// const uri = `mongodb+srv://${dbUserName}:${dbPassword}@${dbCluster}/?retryWrites=true&w=majority`;

// const mclient = new MongoClient(uri);

// // Database Name
// const dbName = "KPL";
// const db = mclient.db(dbName);

// export const database = db;

// export function getClient() {
//   return new MongoClient(uri);
// }

// // Create MongoDB client
// const client = new MongoClient(uri);

// let IS_LOCKED = false;

// async function makeConnection() {
//   try {
//     IS_LOCKED = true;
//     await client.connect();
//     console.log("Connected to MongoDB... ");
//     return;
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//     IS_LOCKED = false; // if it fails to establish connection
//     throw error; // Re-throw the error for the caller to handle
//   }
// }

// // Connect to MongoDB
// async function connectToMongoDB() {
//   let count = 0;
//   while (IS_LOCKED) {
//     count++;
//     console.log("Going to sleep mode..");
//     await new Promise((resolve) => {
//       setTimeout(() => {
//         resolve(1);
//       }, 1000);
//     });
//     if (count > 6) {
//       throw Error("DB locked for more than 10 ticks", {
//         cause: "DB locked for more than 10 ticks",
//       });
//     }
//   }
//   return makeConnection();
// }

// async function closeConnection() {
//   console.log("Closing connection..");

//   try {
//     await client.close();
//     console.log("Connection Closed...! ");
//     IS_LOCKED = false;
//     return;
//   } catch (error) {
//     console.error("Err: Something went wrong!.. ", error);
//     IS_LOCKED = false;
//     throw error;
//   } finally {
//     IS_LOCKED = false;
//     console.log("Making connection FALSE : ", IS_LOCKED);
//   }
// }
// // Export MongoDB client and connect function
// export { client, connectToMongoDB, closeConnection };

export {};
