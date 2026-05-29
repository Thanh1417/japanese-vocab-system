const express = require("express");
const router = express.Router();

const vocabularyController = require("../controllers/vocabularyController");
const verifyToken = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

// Learner + Admin đều được xem từ vựng
router.get("/", verifyToken, vocabularyController.getVocabularies);

// Lấy từ vựng theo bài học
router.get(
    "/lesson/:lessonId",
    verifyToken,
    vocabularyController.getVocabulariesByLesson
);

router.get("/:id", verifyToken, vocabularyController.getVocabularyDetail);

// Chỉ admin được thêm/sửa/xóa từ vựng
router.post(
  "/",
  verifyToken,
  checkRole("admin"),
  vocabularyController.createVocabulary
);

router.put(
  "/:id",
  verifyToken,
  checkRole("admin"),
  vocabularyController.updateVocabulary
);

router.delete(
  "/:id",
  verifyToken,
  checkRole("admin"),
  vocabularyController.deleteVocabulary
);

module.exports = router;