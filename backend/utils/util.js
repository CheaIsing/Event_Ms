const jwt = require("jsonwebtoken");

const sendResponse = (
  res,
  status,
  result,
  message,
  data = null,
  paginate = null
) => {
  const obj = { result, message };
  if (data) {
    obj.data = data;
  }
  if (paginate) {
    obj.paginate = paginate;
  }

  res.status(status).json(obj);
};

const responseObj = (
  status,
  result,
  message,
  data = null,
  paginate = null
) => {
  const obj = { status, result, message };
  if (data) {
    obj.data = data;
  }
  if (paginate) {
    obj.paginate = paginate;
  }

  return obj
};

const sendErrorResponse = (res) => {
  const obj = { result: false, message: "Internal Server Error." };

  res.status(500).json(obj);
};

const generateToken = (id, rememberMe = false) => {
    const tokenExpiration = rememberMe ? 630720000 : 7200;
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: tokenExpiration,
  });
};

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const texts = {
  role: "1 for Guest, 2 for Organizer, 3 for Admin"
}

module.exports = { sendErrorResponse, sendResponse, generateToken, generateOTP, texts, responseObj };
