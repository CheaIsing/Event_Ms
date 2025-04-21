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
  const { email, password, username } = req.body;

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
    const { status, result, message } = await AuthService.forgotPassword(email);

    sendResponse(res, status, result, message);
  } catch (error) {
    loggingError(`Forgot password Error : `, error);
    sendErrorResponse(res);
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const { status, result, message } = await AuthService.verifyOtp(email, otp);

    sendResponse(res, status, result, message);
  } catch (error) {
    loggingError(`Verify Otp Error : `, error);
    sendErrorResponse(res);
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  try {

    const {status, result, message} = await AuthService.resetPassword(email, otp, newPassword, confirmPassword)
    
    sendResponse(
      res,
      status,
      result,
      message
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

    const {status, result,message, data} = await AuthService.getMe(userId)
    
    sendResponse(res, status, result, message, data);
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
