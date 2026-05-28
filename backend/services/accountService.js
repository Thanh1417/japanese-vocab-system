const accountRepository = require("../repositories/accountRepository");

const getAllAccounts = async () => {
  return await accountRepository.findAllAccounts();
};

const getAccountById = async (account_id) => {
  const account = await accountRepository.findAccountById(account_id);

  if (!account) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay tai khoan!",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: account,
  };
};

const searchAccounts = async (keyword) => {
  const accounts = await accountRepository.searchAccounts(keyword || "");

  return {
    success: true,
    statusCode: 200,
    data: accounts,
  };
};

const updateAccount = async (account_id, data) => {
  const existingAccount = await accountRepository.findAccountById(account_id);

  if (!existingAccount) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay tai khoan!",
    };
  }

  const updatedAccount = await accountRepository.updateAccount(account_id, data);

  return {
    success: true,
    statusCode: 200,
    message: "Cap nhat tai khoan thanh cong!",
    data: updatedAccount,
  };
};

const deleteAccount = async (account_id) => {
  const existingAccount = await accountRepository.findAccountById(account_id);

  if (!existingAccount) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay tai khoan!",
    };
  }

  await accountRepository.deleteAccount(account_id);

  return {
    success: true,
    statusCode: 200,
    message: "Xoa tai khoan thanh cong!",
  };
};

module.exports = {
  getAllAccounts,
  getAccountById,
  searchAccounts,
  updateAccount,
  deleteAccount,
};