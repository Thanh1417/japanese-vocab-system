const express = require("express");
const router = express.Router();

const questionController = require("../controllers/questionController");
const verifyToken = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

// Learner + Admin đều được xem câu hỏi
router.get("/", verifyToken, questionController.getQuestions);

// Lấy câu hỏi theo từ vựng
router.get(
  "/vocabulary/:vocabularyId",
  verifyToken,
  questionController.getQuestionsByVocabulary
);

// Xem chi tiết câu hỏi
router.get("/:id", verifyToken, questionController.getQuestionDetail);

// Chỉ admin được thêm/sửa/xóa câu hỏi
router.post(
  "/",
  verifyToken,
  checkRole("admin"),
  questionController.createQuestion
);

router.put(
  "/:id",
  verifyToken,
  checkRole("admin"),
  questionController.updateQuestion
);

router.delete(
  "/:id",
  verifyToken,
  checkRole("admin"),
  questionController.deleteQuestion
);

module.exports = router;