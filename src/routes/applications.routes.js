const express = require("express");
const router = express.Router();
const appController = require("../controllers/applications.controller");

router.get("/", appController.getApplications);
router.patch("/:id", appController.updateStatus);

module.exports = router;
