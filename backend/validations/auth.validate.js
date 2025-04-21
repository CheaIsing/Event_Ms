const Joi = require('joi');

const vSignUp = Joi.object({
    username: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const vResetPassword = Joi.object({
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().min(6).required()
});

module.exports = {vSignUp, vResetPassword}