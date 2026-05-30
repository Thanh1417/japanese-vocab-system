const express = require("express");

const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const app = express();
const errorMiddleware = require("./middlewares/errorMiddleware");
const lessonRoutes = require("./routes/lessonRoutes");
const vocabularyRoutes = require("./routes/vocabularyRoutes");
const questionRoutes = require("./routes/questionRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const studySessionRoutes = require("./routes/studySessionRoutes");
const questionResultRoutes = require("./routes/questionResultRoutes");


app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use(errorMiddleware);
app.use("/api/lessons", lessonRoutes);
app.use("/api/vocabularies", vocabularyRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/study-sessions", studySessionRoutes);
app.use("/api/question-results", questionResultRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server dang chay tai cong ${PORT}`);
});

