const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    const result = await authService.register(full_name, email, password);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const result = await authService.loginWithGoogle(credential);

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
  register,
  login,
  googleLogin,
};