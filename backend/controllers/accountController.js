const accountService = require("../services/accountService");

const getAccounts = async (req, res) => {
  try {
    const accounts = await accountService.getAllAccounts();

    return res.status(200).json({
      success: true,
      message: "Lay danh sach tai khoan thanh cong!",
      data: accounts,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const getAccountDetail = async (req, res) => {
  try {
    const result = await accountService.getAccountById(req.params.id);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Loi server" });
  }
};

const searchAccounts = async (req, res) => {
  try {
    const result = await accountService.searchAccounts(req.query.keyword);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Loi server" });
  }
};

const updateAccount = async (req, res) => {
  try {
    const result = await accountService.updateAccount(req.params.id, req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Loi server" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const result = await accountService.deleteAccount(req.params.id);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Loi server" });
  }
};

module.exports = {
  getAccounts,
  getAccountDetail,
  searchAccounts,
  updateAccount,
  deleteAccount,
};