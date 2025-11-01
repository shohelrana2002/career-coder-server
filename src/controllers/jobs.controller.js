const { ObjectId } = require("mongodb");
const { jobsCollection, appliedCollection } = require("../models/collections");

exports.getAllJobs = async (req, res) => {
  try {
    const email = req.query.email;
    const query = email ? { hr_email: email } : {};
    const result = await jobsCollection.find(query).toArray();
    res.json({ message: "Data fetched successfully", data: result });
  } catch (err) {
    res.status(500).json({ message: "Failed to get jobs", error: err.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const result = await jobsCollection.insertOne(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Job creation failed", error });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await jobsCollection.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Job deletion failed", error });
  }
};
