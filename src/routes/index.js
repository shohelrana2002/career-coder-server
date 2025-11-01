const express = require("express");
const router = express.Router();

const jobsRoutes = require("./jobs.routes");
const applicationRoutes = require("./applications.routes");

// route use
router.use("/jobs", jobsRoutes);
router.use("/application", applicationRoutes);

module.exports = router;
