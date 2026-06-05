const express = require("express");
const router = express.Router();

const srsController = require("../controllers/srsController");
const verifyToken = require("../middlewares/authMiddleware");

router.get("/due", verifyToken, srsController.getDueVocabularies);

router.post("/review", verifyToken, srsController.reviewVocabulary);

module.exports = router;