const express = require("express");

const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const app = express();
const errorMiddleware = require("./middlewares/errorMiddleware");
const lessonRoutes = require("./routes/lessonRoutes");
const vocabularyRoutes = require("./routes/vocabularyRoutes");


app.use(express.json());

app.use("/api/accounts", accountRoutes);
app.use("/api/auth", authRoutes);
app.use(errorMiddleware);
app.use("/api/lessons", lessonRoutes);
app.use("/api/vocabularies", vocabularyRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server dang chay tai cong ${PORT}`);
});