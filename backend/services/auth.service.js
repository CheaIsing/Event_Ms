const sanitizeHtml = require("sanitize-html");
const moment = require("moment");
const { responseObj, generateToken, generateOTP } = require("../utils/util");

const User = require("../models/user.model");
const { loggingError } = require("../utils/logging");
const bcrypt = require("bcrypt");
const { vSignUp, vResetPassword } = require("../validations/auth.validate");
const { sendEmail } = require("../config/mailer");

class AuthService {
  static async signIn(email, password, rememberMe, res) {
    email = sanitizeHtml(email);
    password = sanitizeHtml(password);

    const user = await User.findByEmail(email);

    if (!user) {
      return responseObj(400, false, "Incorrect email or password.");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return responseObj(400, false, "Incorrect email or password.");
    }

    const token = generateToken(user.id, rememberMe);
    const tokenExpiration = rememberMe ? 630720000 : 7200;

    res.cookie("jwt_token", token, { maxAge: tokenExpiration, httpOnly: true });

    return responseObj(201, true, "Sign In Successfully.");
  }

  static async signUp(username, email, password) {
    email = sanitizeHtml(email);
    password = sanitizeHtml(password);
    username = sanitizeHtml(username);

    const { error } = vSignUp.validate({ username, email, password });
    if (error) {
      loggingError(`Validate Error : `, error);
      return responseObj(400, false, error.message);
    }

    // Validate Email DB
    const user = await User.findByEmail(email);

    if (user) {
      return responseObj(400, false, "Email is already exist.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create(username, email, hashedPassword);

    return responseObj(201, true, "Sign Up Successfully.");
  }

  static async forgotPassword(email) {
    email = sanitizeHtml(email);

    const otp = generateOTP();
    const expirationTime = moment()
      .add(10, "minutes")
      .format("YYYY-MM-DD HH:mm:ss");

    const result = await User.updateUserByEmail(email, {reset_token: otp, reset_token_expiration: expirationTime});

    if (result.affectedRows == 0) {
      return responseObj(400, false, "Email is not found.");
    }

    await sendEmail(otp, email);

    return responseObj(200, true, "OTP has sent to your email.");
  }

  static async verifyOtp(email, otp) {
    email = sanitizeHtml(email);
    otp = sanitizeHtml(otp);

    const user = await User.findByEmail(email);

    if (!user) {
      return responseObj(400, false, "Email is not found.");
    }

    const resetTime = moment(user.reset_token_expiration);
    const currentTime = moment();

    if (user.reset_token != otp || currentTime.isAfter(resetTime)) {
      return responseObj(400, false, "Invalid or expired OTP.");
    }

    return responseObj(
      200,
      true,
      "OTP corrected. You can reset your password."
    );
  }

  static async resetPassword(email, otp, newPassword, confirmPassword) {
    email = sanitizeHtml(email);
    otp = sanitizeHtml(otp);
    newPassword = sanitizeHtml(newPassword);
    confirmPassword = sanitizeHtml(confirmPassword);

    const { error } = vResetPassword.validate({ newPassword, confirmPassword });

    if (error) {
      return responseObj(400, false, error.message);
    }

    if (newPassword !== confirmPassword) {
      return responseObj(400, false, "Password do not match.");
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return responseObj(400, false, "Email is not found.");
    }

    if (user.reset_token != otp) {
      return responseObj(400, false, "Invalid OTP.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateUserByEmail(email, {
      password: hashedPassword,
      reset_token_expiration: moment().format("YYYY-MM-DD HH:mm:ss")
    })

    return responseObj(200, true, "Password reset successfully. Now you can sign in with your new password.");
  }


  static async getMe(userId){

    const user = await User.findById(userId)

    if (!user) {
      return responseObj(400, false, "User is not found.");
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
    } = user;

    
    const userObj = {
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

    return responseObj(200, true, "Get Me Successfully.", userObj)

  }
}

module.exports = AuthService;
