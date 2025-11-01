const { client } = require("../config/db");

const db = client.db("CareerCoders");
const jobsCollection = db.collection("jobs");
const appliedCollection = db.collection("applied");

module.exports = { jobsCollection, appliedCollection };
