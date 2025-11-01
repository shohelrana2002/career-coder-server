const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobs.controller");

router.get("/", jobsController.getAllJobs);
router.post("/", jobsController.createJob);
router.delete("/:id", jobsController.deleteJob);

module.exports = router;
