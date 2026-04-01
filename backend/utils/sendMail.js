const nodemailer = require('nodemailer');

const sendMail = async (to, subject, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: '"User Management Admin" <admin@yourwebsite.com>', // Sender address
            to: to, 
            subject: subject,
            html: htmlContent 
        };

        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${to}`);

    } catch (error) {
        console.log("Error sending email:", error);
        throw new Error("Email could not be sent");
    }
};

module.exports = sendMail;