const express = require("express");
const router = express.Router();

const studyGoalController = require("../controllers/studyGoalController");
const verifyToken = require("../middlewares/authMiddleware");

router.get("/", verifyToken, studyGoalController.getMyGoals);
router.get("/active", verifyToken, studyGoalController.getActiveGoal);
router.post("/", verifyToken, studyGoalController.createGoal);
router.put("/:goalId", verifyToken, studyGoalController.updateGoal);
router.delete("/:goalId", verifyToken, studyGoalController.deleteGoal);
router.get("/:goalId/daily-plan", verifyToken, studyGoalController.getGoalDailyPlan);

module.exports = router;