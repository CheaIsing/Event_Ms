const { sendResponse } = require("../utils/util");
const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
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

  req.user = userId;

  next();
};

module.exports = { requireAuth };
