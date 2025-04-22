const bcrypt = require("bcrypt");

const pool = require("../config/db");
const { loggingError } = require("../utils/logging");
const { sendErrorResponse, sendResponse } = require("../utils/util");

const cloudinary = require("../config/cloudinary");
const ProfileService = require("../services/profile.service");
const User = require("../models/user.model");

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
    const { status, result, message } = await ProfileService.updateProfile(
      username,
      email,
      phone,
      address,
      userId
    );

    sendResponse(res, status, result, message);
  } catch (error) {
    loggingError("Get Profile Error : ", error);
    sendErrorResponse(res);
  }
};

const updateAvatar = async (req, res) => {
  const userId = req.user;
  const { avatar } = req.files;
  // console.log(avatar);

  try {
   
    const {status, result, message} = await ProfileService.updateAvatar(avatar, userId)

    sendResponse(res, status, result, message);
  } catch (error) {
    loggingError("Update Avatar Error : ", error);
    sendErrorResponse(res);
  }
};

const deleteAvatar = async (req, res) => {
  const userId = req.user;
  try {

    const {status, result, message} = await ProfileService.deleteAvatar(userId);
    
    sendResponse(res, status, result, message);
  } catch (error) {
    loggingError("Delete Avatar Error : ", error);
    sendErrorResponse(res);
  }
};

const updatePassword = async (req, res) => {
  const userId = req.user;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    
    const {status, result, message} = await ProfileService.updatePassword(currentPassword, newPassword, confirmPassword, userId)
    sendResponse(res, status, result, message);

  } catch (error) {
    loggingError("Update Password Error : ", error);
    sendErrorResponse(res);
  }
};
const deleteAccount = async (req, res) => {
  const userId = req.user;
  const { currentPassword } = req.body;

  try {
    const {status, result, message} = await ProfileService.deleteAccount(currentPassword, userId, res)

    sendResponse(res, status, result, message);
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
