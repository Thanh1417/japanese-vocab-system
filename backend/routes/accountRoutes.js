const express = require("express");
const router = express.Router();

const accountController = require("../controllers/accountController");
const verifyToken = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

router.get("/", verifyToken, checkRole("admin"), accountController.getAccounts);
router.get("/search", verifyToken, checkRole("admin"), accountController.searchAccounts);
router.get("/:id", verifyToken, checkRole("admin"), accountController.getAccountDetail);
router.put("/:id", verifyToken, checkRole("admin"), accountController.updateAccount);
router.delete("/:id", verifyToken, checkRole("admin"), accountController.deleteAccount);

module.exports = router;