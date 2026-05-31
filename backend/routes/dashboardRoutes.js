const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const verifyToken = require("../middlewares/authMiddleware");

router.get("/overview", verifyToken, dashboardController.getOverview);

module.exports = router;