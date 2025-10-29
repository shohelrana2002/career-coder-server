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
const appliedCollection = client.db("CareerCoders").collection("applied");
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
    // // applied get
    // app.get("/application", async (req, res) => {
    //   const email = req.query.email;
    //   const query = { email };
    //   const result = await appliedCollection.find(query).toArray();
    //   // bad way to get id
    //   for (const application of result) {
    //     const jobId = application.jobId;
    //     const queryJobId = { _id: new ObjectId(jobId) };
    //     const job = await jobsCollection.findOne(queryJobId);
    //     application.company = job.company;
    //     application.title = job.title;
    //     application.company_logo = job.company_logo;
    //   }
    //   res.send(result);
    // });

    app.get("/application", async (req, res) => {
      const email = req.query.email;
      const match = email ? { $match: { email } } : { $match: {} };
      const pipeline = [
        match,
        {
          $addFields: {
            jobObjId: { $toObjectId: "$jobId" },
          },
        },
        {
          $lookup: {
            from: "jobs",
            localField: "jobObjId",
            foreignField: "_id",
            as: "job",
          },
        },
        {
          $unwind: { path: "$job", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            jobId: 1,
            email: 1,
            company: "$job.company",
            title: "$job.title",
            company_logo: "$job.company_logo",
          },
        },
      ];
      const result = await appliedCollection.aggregate(pipeline).toArray();
      res.send(result);
    });
    // applied post by id
    app.post("/applied", async (req, res) => {
      const data = req.body;
      const result = await appliedCollection.insertOne(data);
      console.log(result);
      res.send(result);
    });
    // application delete by id
    app.delete("/application/:id", async (req, res) => {
      const id = req.params.id;
      const queryId = { _id: new ObjectId(id) };
      const result = await appliedCollection.deleteOne(queryId);
      res.send(result);
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
