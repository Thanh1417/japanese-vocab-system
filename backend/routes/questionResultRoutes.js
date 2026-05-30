const express = require("express");
const router = express.Router();

const questionResultController = require("../controllers/questionResultController");
const verifyToken = require("../middlewares/authMiddleware");

// Lưu kết quả trả lời 1 câu hỏi
router.post("/", verifyToken, questionResultController.createQuestionResult);

// Lấy kết quả theo phiên học
router.get(
  "/session/:sessionId",
  verifyToken,
  questionResultController.getResultsBySession
);

module.exports = router;