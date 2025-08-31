const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();
const CONNECTION_URL = process.env.CONNECTION_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;

let database, collection;

async function connectDB() {
  if (!database) {
    const client = await MongoClient.connect(CONNECTION_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    database = client.db(DATABASE_NAME);
    collection = database.collection("building_data");
  }
}

router.post("/", async (req, res) => {
  try {
    let pipeline = req.body;
    if (typeof pipeline === "string") pipeline = JSON.parse(pipeline);
    await connectDB();
    const results = await collection.aggregate(pipeline).toArray();
    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
