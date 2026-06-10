const dashboardService = require("../services/dashboardService");

const getOverview = async (req, res) => {
  try {
    const account_id = req.user.account_id;

    const result = await dashboardService.getDashboardStatistics(account_id);

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
  getOverview,
};