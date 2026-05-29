const express = require("express");
const router = express.Router();

const lessonController = require("../controllers/lessonController");
const verifyToken = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

router.get("/", verifyToken, lessonController.getLessons);
router.get("/:id", verifyToken, lessonController.getLessonDetail);
router.post("/", verifyToken, checkRole("admin"), lessonController.createLesson);
router.put("/:id", verifyToken, checkRole("admin"), lessonController.updateLesson);
router.delete("/:id", verifyToken, checkRole("admin"), lessonController.deleteLesson);

module.exports = router;