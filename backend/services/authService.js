const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const accountRepository = require("../repositories/accountRepository");

const register = async (full_name, email, password) => {
  const existingAccount = await accountRepository.findByEmail(email);

  if (existingAccount) {
    return {
      success: false,
      statusCode: 400,
      message: "Email da ton tai!",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await accountRepository.createAccount({
    full_name: full_name,
    email: email,
    password: hashedPassword,
    role: "learner",
    status: "active",
  });

  return {
    success: true,
    statusCode: 201,
    message: "Dang ky thanh cong!",
  };
};

const login = async (email, password) => {
  const user = await accountRepository.findByEmail(email);

  if (!user) {
    return {
      success: false,
      statusCode: 400,
      message: "Email khong ton tai!",
    };
  }

  if (user.status === "locked") {
    return {
      success: false,
      statusCode: 403,
      message: "Tai khoan da bi khoa!",
    };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return {
      success: false,
      statusCode: 400,
      message: "Mat khau khong dung!",
    };
  }

  const token = jwt.sign(
    {
      account_id: user.account_id,
      email: user.email,
      role: user.role,
    },
    "MY_SECRET_KEY",
    {
      expiresIn: "1d",
    }
  );

  return {
    success: true,
    statusCode: 200,
    message: "Dang nhap thanh cong!",
    token,
    user: {
      account_id: user.account_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};

module.exports = {
  register,
  login,
};