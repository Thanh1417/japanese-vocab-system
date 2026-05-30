const express = require("express");
const router = express.Router();

const studySessionController = require("../controllers/studySessionController");
const verifyToken = require("../middlewares/authMiddleware");

// Bắt đầu phiên học / làm quiz
router.post("/start", verifyToken, studySessionController.startStudySession);

// Xem chi tiết phiên học
router.get("/:id", verifyToken, studySessionController.getStudySessionDetail);

// Kết thúc phiên học
router.put("/:id/end", verifyToken, studySessionController.endStudySession);

module.exports = router;