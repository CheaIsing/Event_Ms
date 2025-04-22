const User = require("../models/user.model");
const { sendResponse } = require("../utils/util");
const jwt = require("jsonwebtoken");

const requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt_token;

  if (!token) {
    req.user = null;
    return sendResponse(
      res,
      401,
      false,
      "Authorization Failed. No token provided."
    );
  }

  const userId = jwt.verify(token, process.env.JWT_SECRET_KEY).id;

  if (!userId) {
    req.user = null;
    return sendResponse(
      res,
      401,
      false,
      "Authorization Failed. Invalid token."
    );
  }

  const user = await User.findById(userId);

  if(!user){
    req.user = null;
    return sendResponse(
      res,
      401,
      false,
      "User is not found."
    );
  }

  req.user = userId;

  next();
};

module.exports = { requireAuth };
