const sanitizeHtml = require("sanitize-html");
const moment = require("moment");
const { responseObj, generateToken, generateOTP } = require("../utils/util");

const User = require("../models/user.model");
const { loggingError } = require("../utils/logging");
const bcrypt = require("bcrypt");
const { vSignUp } = require("../validations/auth.validate");

class AuthService {
  static async signIn(email, password, rememberMe, res) {
    email = sanitizeHtml(email);
    password = sanitizeHtml(password);

    const user = await User.findByEmail(email);

    if (user.length == 0) {
      return responseObj(400, false, "Incorrect email or password.");
    }

    const isPasswordMatch = await bcrypt.compare(password, user[0].password);

    if (!isPasswordMatch) {
      return responseObj(400, false, "Incorrect email or password.");
    }

    const token = generateToken(user[0].id, rememberMe);
    const tokenExpiration = rememberMe ? 630720000 : 7200;

    res.cookie("jwt_token", token, { maxAge: tokenExpiration, httpOnly: true });

    return responseObj(201, true, "Sign In Successfully.");
  }

  static async signUp(username, email, password) {
    (email = sanitizeHtml(email)),
      (password = sanitizeHtml(password)),
      (username = sanitizeHtml(username));

    const { error } = vSignUp.validate({ username, email, password });
    if (error) {
      loggingError(`Validate Error : `, error);
      return responseObj(400, false, error.message);
    }

    // Validate Email DB
    const user = await User.findByEmail(email);

    if (user.length > 0) {
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

    const result = await User.updateResetToken(otp, expirationTime, email);

    if (result.affectedRows == 0) {
      return responseObj(400, false, "Email is not found.");
    }

    await sendEmail(otp, email);

    return responseObj(200, true, "OTP has sent to your email.");
  }

  static async verifyOtp(email, otp) {

    email = sanitizeHtml(email)
    otp = sanitizeHtml(otp);

    const result = await User.findByEmail(email)

    if (result.length == 0) {
      return responseObj( 400, false, "Email is not found.");
    }

    const resetTime = moment(result[0].reset_token_expiration);
    const currentTime = moment();

    if (result[0].reset_token != otp || currentTime.isAfter(resetTime)) {
      return responseObj(400, false, "Invalid or expired OTP.");
    }

    return responseObj( 200, true, "OTP corrected. You can reset your password.");
  }
}

module.exports = AuthService;
