const studyGoalService = require("../services/studyGoalService");

const getMyGoals = async (req, res) => {
  try {
    const account_id = req.user.account_id;

    const result = await studyGoalService.getMyGoals(account_id);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const getActiveGoal = async (req, res) => {
  try {
    const account_id = req.user.account_id;

    const result = await studyGoalService.getActiveGoal(account_id);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const createGoal = async (req, res) => {
  try {
    const account_id = req.user.account_id;

    const result = await studyGoalService.createGoal(account_id, req.body);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const updateGoal = async (req, res) => {
  try {
    const account_id = req.user.account_id;
    const { goalId } = req.params;

    const result = await studyGoalService.updateGoal(
      account_id,
      goalId,
      req.body
    );

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const account_id = req.user.account_id;
    const { goalId } = req.params;

    const result = await studyGoalService.deleteGoal(account_id, goalId);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const getGoalDailyPlan = async (req, res) => {
  try {
    const account_id = req.user.account_id;
    const { goalId } = req.params;

    const result = await studyGoalService.getGoalDailyPlan(account_id, goalId);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const getGoalDayDetail = async (req, res) => {
  try {
    const account_id = req.user.account_id;
    const { goalId, dayNumber } = req.params;

    const result = await studyGoalService.getGoalDayDetail(
      account_id,
      goalId,
      dayNumber
    );

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

module.exports = {
  getMyGoals,
  getActiveGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalDayDetail,
  getGoalDailyPlan,
};