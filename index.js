const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());
const port = process.env.PORT || 4000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6zoig.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const jobsCollection = client.db("CareerCoders").collection("jobs");
async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.get("/jobs", async (req, res) => {
      try {
        const result = await jobsCollection.find().toArray();
        res.json({ message: "Data get Successfully", data: result });
      } catch (err) {
        res.status(500).json({ message: "Data Cant get ", error: err.message });
      }
    });

    // singe job details get
    app.get("/jobs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await jobsCollection.findOne(query);
        res.json({ message: "Data get Successfully", data: result });
      } catch (err) {
        res.status(500).json({ message: "Data not found", error: err.message });
      }
    });
  } finally {
    // await client.close();
  }
}
run();

app.get("/", (req, res) => {
  res.send("Career Code Running!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
