const express = require("express");
const { getProfile, updateProfile, updateAvatar, updatePassword, deleteAccount, deleteAvatar } = require("../controllers/profile.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireAuth);

router.get("/", getProfile);
router.put("/", updateProfile);
router.post("/avatar", updateAvatar);
router.put("/change-password", updatePassword);
router.delete("/", deleteAccount);
router.delete("/avatar", deleteAvatar);




module.exports = router;