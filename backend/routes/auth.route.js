const express = require("express");
const { signUp, signIn, forgotPassword, verifyOtp, resetPassword, signOut } = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { getMe } = require("../controllers/auth.controller");
const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

router.get("/me", requireAuth, getMe);
router.delete("/signout", requireAuth, signOut);



module.exports = router;