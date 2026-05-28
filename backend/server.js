const express = require("express");

const accountRoutes = require("./routes/accountRoutes");
const authRoutes = require("./routes/authRoutes");
const app = express();
const errorMiddleware = require("./middlewares/errorMiddleware");


app.use(express.json());

app.use("/api/accounts", accountRoutes);
app.use("/api/auth", authRoutes);
app.use(errorMiddleware);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server dang chay tai cong ${PORT}`);
});