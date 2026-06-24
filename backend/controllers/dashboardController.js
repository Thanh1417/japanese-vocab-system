const dashboardService = require("../services/dashboardService");

const getOverview = async (req, res) => {
  try {
    const account_id = req.user.account_id;
    const range = req.query.range || "30";

    const result = await dashboardService.getDashboardStatistics(account_id, range);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const getAdminOverview = async (req, res) => {
  try {
    const range = req.query.range || "30";
    const result = await dashboardService.getAdminDashboardStatistics(range);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

module.exports = {
  getOverview,
  getAdminOverview,
};