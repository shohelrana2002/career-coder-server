const { ObjectId } = require("mongodb");
const { appliedCollection, jobsCollection } = require("../models/collections");

exports.getApplications = async (req, res) => {
  const email = req.query.email;
  const match = email ? { $match: { email } } : { $match: {} };

  const pipeline = [
    match,
    { $addFields: { jobObjId: { $toObjectId: "$jobId" } } },
    {
      $lookup: {
        from: "jobs",
        localField: "jobObjId",
        foreignField: "_id",
        as: "job",
      },
    },
    { $unwind: "$job" },
    {
      $project: {
        jobId: 1,
        email: 1,
        status: 1,
        company: "$job.company",
        title: "$job.title",
        company_logo: "$job.company_logo",
      },
    },
  ];
  const result = await appliedCollection.aggregate(pipeline).toArray();
  res.send(result);
};

exports.updateStatus = async (req, res) => {
  const id = req.params.id;
  const updateDoc = { $set: { status: req.body.status } };
  const result = await appliedCollection.updateOne(
    { _id: new ObjectId(id) },
    updateDoc
  );
  res.send(result);
};
