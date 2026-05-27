const express = require("express");
const cors = require("cors");
const verifyToken = require("./middlewares/authMiddleware");

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/hello", (req, res) => {
  res.json({
    message: "Xin chao tu backend Express!",
  });
});

app.get("/api/profile", verifyToken, (req, res) => {
  res.json({
    message: "Truy cap profile thanh cong!",
    user: req.user,
  });
});

app.listen(3000, () => {
  console.log("Server dang chay tai cong 3000");
});