// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.SHIPDART_EMAIL, //shipdart mail
//         pass: process.env.SHIPDART_PASSWORD //google myaccount app password
//     },
//     debug: true,
//     logger: true
// });

// exports.sendOTPEmail = async (to, otp) => {
//     try {
//         const mailOptions = {
//             from: '"Shipdart Express" <shipdartexpress@gmail.com>',
//             to: to,
//             subject: 'Password Reset OTP - Shipdart Express',
//             html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//                     <h2 style="color: #333;">Password Reset OTP</h2>
//                     <p>Dear User,</p>
//                     <p>You have requested to reset your password. Please use the following OTP to verify your request:</p>
//                     <div style="background-color: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
//                         <h1 style="color: #007bff; margin: 0; font-size: 32px;">${otp}</h1>
//                     </div>
//                     <p>This OTP will expire in 10 minutes.</p>
//                     <p>If you didn't request this password reset, please ignore this email or contact our support team immediately.</p>
//                     <hr style="border: 1px solid #eee; margin: 20px 0;">
//                     <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
//                 </div>`
//         };

//         console.log('Attempting to send OTP to:', to);
//         const info = await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully:', info.messageId);
//         return true;
//     } catch (error) {
//         console.error('Error sending email:', error);
//         if (error.code === 'EAUTH') {
//             console.error('Authentication failed. Please check your email credentials.');
//         }

//         return false;
//     }
// };

// exports.sendPasswordUpdateEmail = async (to) => {
//     try {
//         const mailOptions = {
//             from: '"Shipdart Express" <shipdartexpress@gmail.com>',
//             to: to,
//             subject: 'Password Updated - Shipdart Express',
//             html: `
//                 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//                     <h2 style="color: #333;">Password Update Confirmation</h2>
//                     <p>Dear User,</p>
//                     <p>Your password has been updated successfully.</p>
//                     <p>If you did not make this change, please contact our support team immediately.</p>
//                     <hr style="border: 1px solid #eee; margin: 20px 0;">
//                     <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
//                 </div>
//             `
//         };

//         console.log('Attempting to send password update confirmation to:', to);
//         const info = await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully:', info.messageId);
//         return true;
//     } catch (error) {
//         console.error('Error sending email:', error);
//         if (error.code === 'EAUTH') {
//             console.error('Authentication failed. Please check your email credentials.');
//         }
//         return false;
//     }
// };
