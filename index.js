const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");

const CONNECTION_URL = process.env.CONNECTION_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let database, collection;

async function connectDB() {
  if (!database) {
    const client = await MongoClient.connect(CONNECTION_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    database = client.db(DATABASE_NAME);
    collection = database.collection("building_data");
    console.log(`Connected to ${DATABASE_NAME}!`);
  }
}

app.post("/", async (req, res) => {
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
});

module.exports = app;