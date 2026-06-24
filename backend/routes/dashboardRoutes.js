const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const verifyToken = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

router.get("/overview", verifyToken, dashboardController.getOverview);
router.get("/admin/overview", verifyToken, checkRole("admin"), dashboardController.getAdminOverview);

module.exports = router;