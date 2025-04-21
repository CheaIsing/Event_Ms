const nodemailer = require('nodemailer');

// Send email function
const sendEmail = async (otp, email = "cheaising07@gmail.com",) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    const mailOptions = {
        from: 'noreply@example.com',
        to: email,
        subject: 'OTP Code',
        html: 'This is your OTP code ' + otp
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {sendEmail}