import { MongoClient } from "mongodb";

const CONNECTION_URL = process.env.CONNECTION_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;

let database;
let collection;

async function connectDB() {
  if (!database) {
    const client = new MongoClient(CONNECTION_URL);
    await client.connect();
    database = client.db(DATABASE_NAME);
    collection = database.collection("building_data");
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    let pipeline = req.body;

    if (!Array.isArray(pipeline)) {
      return res.status(400).json({ error: "Pipeline must be an array" });
    }

    await connectDB();
    const results = await collection.aggregate(pipeline).toArray();

    res.status(200).json(results);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).json({ error: err.message });
  }
}
