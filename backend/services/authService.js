const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const accountRepository = require("../repositories/accountRepository");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

const loginWithGoogle = async (credential) => {
  try {
    // Xác thực token Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const full_name = payload.name;

    // Kiểm tra tài khoản đã tồn tại chưa
    let user = await accountRepository.findByEmail(email);

    // Nếu chưa có thì tạo mới
    if (!user) {
      const randomPassword = Math.random().toString(36);

      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await accountRepository.createGoogleAccount(
        full_name,
        email,
        hashedPassword
      );
    }

    // Kiểm tra khóa
    if (user.status === "locked") {
      return {
        success: false,
        statusCode: 403,
        message: "Tai khoan da bi khoa!",
      };
    }

    // Tạo JWT
    const token = jwt.sign(
      {
        account_id: user.account_id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return {
      success: true,
      statusCode: 200,
      message: "Dang nhap Google thanh cong!",
      token,
      user: {
        account_id: user.account_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      statusCode: 401,
      message: "Google token khong hop le!",
    };
  }
};

module.exports = {
  register,
  login,
  loginWithGoogle
};