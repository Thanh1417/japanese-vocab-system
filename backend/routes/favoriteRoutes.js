const express = require("express");
const router = express.Router();

const favoriteController = require("../controllers/favoriteController");
const verifyToken = require("../middlewares/authMiddleware");

// Xem danh sách từ vựng yêu thích của user đang đăng nhập
router.get("/", verifyToken, favoriteController.getMyFavorites);

// Thêm từ vựng vào yêu thích
router.post(
  "/:vocabularyId",
  verifyToken,
  favoriteController.addFavorite
);

// Xóa từ vựng khỏi yêu thích
router.delete(
  "/:vocabularyId",
  verifyToken,
  favoriteController.removeFavorite
);

module.exports = router;