import { MongoClient } from 'mongodb';

// Connection URL
const dbUserName = process.env.dbUserName;
const dbPassword = process.env.dbPassword;
const dbCluster = process.env.cluster;

const uri = `mongodb+srv://${dbUserName}:${dbPassword}@${dbCluster}/?retryWrites=true&w=majority`;

const mclient = new MongoClient(uri);

// Database Name
const dbName = 'KPL';
const db = mclient.db(dbName);

export const client = mclient;
export const database = db;

export function getClient() {
    return new MongoClient(uri);
}
