import { MongoClient } from "mongodb";

const CONNECTION_URL = process.env.CONNECTION_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;

let client;
let database;
let collection;

async function connectDB() {
  if (!database) {
    client = new MongoClient(CONNECTION_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    database = client.db(DATABASE_NAME);
    collection = database.collection("building_data");
    console.log(`Connected to ${DATABASE_NAME}!`);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    let pipeline = req.body;

    if (Buffer.isBuffer(pipeline)) {
      pipeline = pipeline.toString();
    }
    if (typeof pipeline === "string") {
      pipeline = JSON.parse(pipeline);
    }

    console.log("Parsed pipeline:", pipeline);
    await connectDB();
    const results = await collection.aggregate(pipeline).toArray();

    res.status(200).json({ results });
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).json({ error: err.message });
  }
}
