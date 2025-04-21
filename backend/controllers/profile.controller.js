const bcrypt = require("bcrypt");

const pool = require("../config/db");
const { loggingError } = require("../utils/logging");
const { sendErrorResponse, sendResponse } = require("../utils/util");

const cloudinary = require("../config/cloudinary");

const getProfile = async (req, res) => {
  const userId = req.user;
  try {
    const sql = "SELECT * FROM tbl_users WHERE id = ?";

    const [rows] = await pool.query(sql, userId);

    console.log(rows);
  } catch (error) {
    loggingError("Get Profile Error : ", error);
    sendErrorResponse(res);
  }
};
const updateProfile = async (req, res) => {
  const userId = req.user;
  const { username, email, phone, address } = req.body;

  try {
    const sql =
      "UPDATE tbl_users SET username = ? , email = ?, phone = ?, address = ? WHERE id = ?";

    const params = [username, email, phone, address, userId];

    const [rows] = await pool.query(sql, params);

    if (rows.affectedRows == 0) {
      return sendResponse(res, 400, false, "User is not found.");
    }

    sendResponse(res, 200, true, "Profile Updated Successfully.");
  } catch (error) {
    loggingError("Get Profile Error : ", error);
    sendErrorResponse(res);
  }
};
const updateAvatar = async (req, res) => {
  const userId = req.user;
  const { avatar } = req.files;
  // console.log(avatar);

  const uploadToCloudinary = (imageBuffer, cloudinary) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      stream.end(imageBuffer); // Pass the image buffer
    });
  };

  try {
    const { public_id, secure_url } = await uploadToCloudinary(avatar.data, cloudinary);

    const sql =
      "UPDATE tbl_users SET avatar = ?, avatar_public_id = ? WHERE id = ?";
    const params = [secure_url, public_id, userId];

    const [rows] = await pool.query(sql, params);

    if (rows.affectedRows == 0) {
      return sendResponse(res, 400, false, "User is not found.");
    }

    sendResponse(res, 201, true, "Avatar Upload Successfully.");
  } catch (error) {
    loggingError("Update Avatar Error : ", error);
    sendErrorResponse(res);
  }
};

const deleteAvatar = async (req, res) => {
  const userId = req.user;
  try {
    const [user] = await pool.query(
      "select * from tbl_users where id = ?",
      userId
    );

    console.log(user);
    
    const publicId = user[0].avatar_public_id;

    if (!publicId) {
      return sendResponse(res, 400, false, "No avatar to delete.");
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return sendResponse(res, 400, false, "Failed to delete avatar.");
    }

    await pool.query("update tbl_users set avatar = ?, avatar_public_id = ? where id = ?", [null, null, userId])
    
    sendResponse(res, 201, true, "Avatar Deleted Successfully.");
  } catch (error) {
    loggingError("Delete Avatar Error : ", error);
    sendErrorResponse(res);
  }
};

const updatePassword = async (req, res) => {
  const userId = req.user;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return sendResponse(res, 400, false, "Password do not match.");
  }

  try {
    const checkMatchPasswordSql = "SELECT * FROM tbl_users WHERE id = ?";
    const [user] = await pool.query(checkMatchPasswordSql, userId);

    const userPassword = user[0].password;

    const isPasswordMatch = await bcrypt.compare(currentPassword, userPassword);

    if (!isPasswordMatch) {
      return sendResponse(res, 400, false, "Current Password is incorrect.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const sql = "UPDATE tbl_users SET password = ? WHERE id = ? ";

    const params = [hashedPassword, userId];

    const [rows] = await pool.query(sql, params);

    if (rows.affectedRows == 0) {
      return sendResponse(res, 400, false, "User is not found.");
    }

    sendResponse(res, 200, true, "Password Updated Successfully.");
  } catch (error) {
    loggingError("Update Password Error : ", error);
    sendErrorResponse(res);
  }
};
const deleteAccount = async (req, res) => {
  const userId = req.user;
  const { currentPassword } = req.body;

  try {
    const checkMatchPasswordSql = "SELECT * FROM tbl_users WHERE id = ?";
    const [user] = await pool.query(checkMatchPasswordSql, userId);

    const userPassword = user[0].password;

    const isPasswordMatch = await bcrypt.compare(currentPassword, userPassword);

    if (!isPasswordMatch) {
      return sendResponse(res, 400, false, "Current Password is incorrect.");
    }

    const sql = "DELETE FROM tbl_users WHERE id = ? ";

    const [rows] = await pool.query(sql, userId);

    if (rows.affectedRows == 0) {
      return sendResponse(res, 400, false, "User is not found.");
    }

    res.cookie("jwt_token", "", { maxAge: 1, httpOnly: true });

    sendResponse(res, 200, true, "Account Deleted Successfully.");
  } catch (error) {
    loggingError("Delete Account Error : ", error);
    sendErrorResponse(res);
  }
};

module.exports = {
  getProfile,
  updateAvatar,
  updatePassword,
  updateProfile,
  deleteAccount,
  deleteAvatar,
};
