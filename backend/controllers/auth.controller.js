const bcrypt = require("bcrypt");
const sanitizeHtml = require("sanitize-html");
const moment = require("moment");

const pool = require("../config/db");
const {
  sendErrorResponse,
  sendResponse,
  generateToken,
  generateOTP,
  texts,
} = require("../utils/util");

const { vSignUp, vResetPassword } = require("../validations/auth.validate");
const { loggingError } = require("..//utils/logging");
const { sendEmail } = require("../config/mailer");
const User = require("../models/user.model");
const AuthService = require("../services/auth.service");

const signIn = async (req, res) => {
  const { email, password, rememberMe = false } = req.body;

  try {
    const result = await AuthService.signIn(email, password, rememberMe, res);

    sendResponse(res, result.status, result.result, result.message);
    
  } catch (error) {
    loggingError(`Sign In Error : `, error);
    sendErrorResponse(res);
  }
};

const signUp = async (req, res) => {
  const { email, password, username  } = req.body;

  try {

    const result = await AuthService.signUp(username, email, password);

    sendResponse(res, result.status, result.result, result.message);

  } catch (error) {
    loggingError(`Sign Up Error : `, error);
    sendErrorResponse(res);
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
   const {status, result, message} = await AuthService.forgotPassword(email);

    sendResponse(res, status, result, message);
  } catch (error) {
    loggingError(`Forgot password Error : `, error);
    sendErrorResponse(res);
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    
    const {status, result, message} = await AuthService.verifyOtp(email, otp)

    sendResponse(res, status, result, message);
  } catch (error) {
    loggingError(`Verify Otp Error : `, error);
    sendErrorResponse(res);
  }
};

const resetPassword = async (req, res) => {
  const {
    email: dEmail,
    otp: dOtp,
    newPassword: dNewPass,
    confirmPassword: dConfirmPass,
  } = req.body;

  const email = sanitizeHtml(dEmail);
  const otp = sanitizeHtml(dOtp);
  const newPassword = sanitizeHtml(dNewPass);
  const confirmPassword = sanitizeHtml(dConfirmPass);

  const { error } = vResetPassword.validate({ newPassword, confirmPassword });
  if (error) {
    return sendResponse(res, 400, false, error.message);
  }

  try {
    if (newPassword !== confirmPassword) {
      return sendResponse(res, 400, false, "Password do not match.");
    }

    let sql = "SELECT reset_token FROM tbl_users WHERE email = ?";
    const params = [email];

    const [rows] = await pool.query(sql, params);

    if (rows.length == 0) {
      return sendResponse(res, 400, false, "Email is not found.");
    }

    if (rows[0].reset_token != otp) {
      return sendResponse(res, 400, false, "Invalid OTP.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    let resetPassSql =
      "UPDATE tbl_users SET password = ?, reset_token_expiration = ? WHERE email = ?";
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");

    const resetPassParams = [hashedPassword, currentTime, email];

    await pool.query(resetPassSql, resetPassParams);

    sendResponse(
      res,
      200,
      true,
      "Password reset successfully. Now you can sign in with your new password."
    );
  } catch (error) {
    loggingError(`Reset Password Error : `, error);
    sendErrorResponse(res);
  }
};

const signOut = async (req, res) => {
  res.cookie("jwt_token", "", { maxAge: 1, httpOnly: true });
  sendResponse(res, 200, true, "Sign Out Successfully.");
};

const getMe = async (req, res) => {
  const userId = req.user;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM tbl_users WHERE id = ?",
      userId
    );

    if (rows.length == 0) {
      return sendResponse(res, 400, false, "User is not found.");
    }

    const {
      id,
      username,
      email,
      phone,
      avatar,
      address,
      role,
      created_at,
      updated_at,
    } = rows[0];

    const user = {
      id,
      username,
      email,
      phone,
      avatar,
      address,
      role,
      role_text: texts.role,
      created_at,
      updated_at,
    };

    sendResponse(res, 200, true, "Get Me Successfully.", user);
  } catch (error) {
    loggingError("Get Me Error : ", error);
    sendErrorResponse(res);
  }
};

module.exports = {
  signIn,
  signUp,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getMe,
  signOut,
};
