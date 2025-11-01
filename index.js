const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 4000;

// middle were
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// middle were
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  // verify token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

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
    // jwt api related
    app.post("/jwt", async (req, res) => {
      const userData = req.body;
      const token = jwt.sign(userData, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d",
      });
      //   set the token in  cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
      });

      res.send({ success: true });
    });
    app.get("/jobs", async (req, res) => {
      try {
        const email = req.query.email;
        const query = {};
        if (email) {
          query.hr_email = email;
        }
        const result = await jobsCollection.find(query).toArray();
        res.json({ message: "Data get Successfully", data: result });
      } catch (err) {
        res.status(500).json({ message: "Data Cant get ", error: err.message });
      }
    });
    // jobs post
    app.post("/jobs", async (req, res) => {
      try {
        const data = req.body;
        const result = await jobsCollection.insertOne(data);
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: "Not Found Data", error: error });
      }
    });
    // add job delete by id
    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    });
    //  /viewApplication/job/:jobId
    app.get("/viewApplication/job/:jobId", async (req, res) => {
      const jobId = req.params.jobId;
      const query = { jobId: jobId };
      const result = await appliedCollection.find(query).toArray();
      res.send(result);
    });
    // count get add
    app.get("/jobs/applications", verifyToken, async (req, res) => {
      const email = req.query.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "forbidden" });
      }
      const query = { hr_email: email };
      const jobs = await jobsCollection.find(query).toArray();
      for (const job of jobs) {
        const applicationQuery = { jobId: job._id.toString() };
        const application_count = await appliedCollection.countDocuments(
          applicationQuery
        );
        job.application_count = application_count;
      }
      res.send(jobs);
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
    //  get application
    app.get("/application", verifyToken, async (req, res) => {
      try {
        const email = req.query.email;
        if (email !== req.decoded.email) {
          return res.status(403).send({ message: "forbidden" });
        }
        const match = email ? { $match: { email } } : { $match: {} };

        const pipeline = [
          match,
          {
            $addFields: {
              jobObjId: {
                $cond: {
                  if: {
                    $regexMatch: {
                      input: "$jobId",
                      regex: /^[0-9a-fA-F]{24}$/,
                    },
                  },
                  then: { $toObjectId: "$jobId" },
                  else: null,
                },
              },
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
      } catch (error) {
        console.error("Aggregation Error:", error);
        res.status(500).send({ message: "Error fetching applications" });
      }
    });

    // applied status update route
    app.patch("/application/:id", async (req, res) => {
      const id = req.params.id;
      const objectId = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: req.body.status,
        },
      };
      const result = await appliedCollection.updateOne(objectId, updateDoc);
      res.send(result);
    });

    // applied post by id
    app.post("/applied", async (req, res) => {
      const data = req.body;
      const result = await appliedCollection.insertOne(data);
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
