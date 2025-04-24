const User = require("../models/user.model");
const { responseObj } = require("../utils/util");
const cloudinary = require("../config/cloudinary");
const sanitizeHtml = require("sanitize-html")

const bcrypt = require("bcrypt")

class ProfileService {
  
  static async updateProfile(username, email, phone, address, userId) {
    username = sanitizeHtml(username)
    email = sanitizeHtml(email)
    phone = sanitizeHtml(phone)
    address = sanitizeHtml(address)

    const update = await User.updateUserById(userId, {
      username,
      email,
      phone,
      address,
    });

    if (update.affectedRows == 0) {
      return responseObj(400, false, "User is not found.");
    }

    return responseObj(200, true, "Profile Updated Successfully.");
  }

  static async updateAvatar(avatar, userId) {

    const uploadToCloudinary = (imageBuffer) => {
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

    const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validImageTypes.includes(avatar.mimetype)) {
      return responseObj(400, false, "Invalid image type. Please upload a PNG or JPG image.");
    }

    const { public_id, secure_url } = await uploadToCloudinary(avatar.data);

    const rows = await User.updateUserById(userId, {
      avatar: secure_url,
      avatar_public_id: public_id,
    });

    if (rows.affectedRows == 0) {
      return responseObj(400, false, "User is not found.");
    }

    return responseObj(201, true, "Avatar Upload Successfully.");
  }

  static async deleteAvatar(userId) {
    const user = await User.findById(userId);

    const publicId = user.avatar_public_id;

    if (!publicId) {
      return responseObj(400, false, "No avatar to delete.");
    }

    const { result } = await cloudinary.uploader.destroy(publicId);

    if (result !== "ok") {
      return responseObj(400, false, "Failed to delete avatar.");
    }

    await User.updateUserById(userId, {
      avatar: null,
      avatar_public_id: null,
    });

    return responseObj(201, true, "Avatar Deleted Successfully.");
  }

  static async updatePassword(currentPassword, newPassword, confirmPassword, userId) {

    currentPassword = sanitizeHtml(currentPassword)
    newPassword = sanitizeHtml(newPassword)
    confirmPassword = sanitizeHtml(confirmPassword)

    if (newPassword !== confirmPassword) {
      return responseObj( 400, false, "Password do not match.");
    }

    const user = await User.findById(userId);

    const userPassword = user.password;

    const isPasswordMatch = await bcrypt.compare(currentPassword, userPassword);

    if (!isPasswordMatch) {
      return responseObj(400, false, "Current Password is incorrect.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateUserById(userId, {
      password: hashedPassword
    })

    return responseObj( 200, true, "Password Updated Successfully.");

  }
  
  static async deleteAccount(currentPassword, userId, res) {

    currentPassword = sanitizeHtml(currentPassword)

    const user = await User.findById(userId)

    const userPassword = user.password;

    const isPasswordMatch = await bcrypt.compare(currentPassword, userPassword);

    if (!isPasswordMatch) {
      return responseObj(400, false, "Current Password is incorrect.");
    }

    await User.deleteById(userId);

    res.cookie("jwt_token", "", { maxAge: 1, httpOnly: true });

    return responseObj(200, true, "Account Deleted Successfully.");

  }
}

module.exports = ProfileService;
