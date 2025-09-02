import { MongoClient } from "mongodb";

const CONNECTION_URL = process.env.CONNECTION_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;
const COLLECTION_NAME = "training_data"; 
const ATLAS_VECTOR_INDEX_NAME = "vector_index_training"; 

let database;
let collection;

async function connectToDatabase() {
    if (database && collection) {
        return; 
    }
    try {
        console.log("Initializing new database connection...");
        const client = new MongoClient(CONNECTION_URL);
        await client.connect();
        database = client.db(DATABASE_NAME);
        collection = database.collection(COLLECTION_NAME);
        console.log("Database connection successful.");
    } catch (e) {
        console.error("Failed to connect to the database.", e);
        throw e; 
    }
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { embedding } = req.body;

        if (!embedding || !Array.isArray(embedding)) {
            return res.status(400).json({ error: "Request body must include an 'embedding' array." });
        }
        
        console.log(`Received embedding with ${embedding.length} dimensions.`);

        const searchPipeline = [
            {
                '$vectorSearch': {
                    index: ATLAS_VECTOR_INDEX_NAME,
                    path: 'content_embedding',
                    queryVector: embedding, 
                    numCandidates: 150,
                    limit: 5
                }
            },
            {
                '$project': {
                    '_id': 0,
                    'title': 1,
                    'url': 1,
                    'score': { '$meta': 'vectorSearchScore' }
                }
            }
        ];

        await connectToDatabase();
        const results = await collection.aggregate(searchPipeline).toArray();
        
        return res.status(200).json(results);

    } catch (err) {
        console.error("An error occurred in the handler:", err);
        return res.status(500).json({ error: "An internal server error occurred." });
    }
}