const nodemailer = require('nodemailer');
const { log } = require('mercedlogger');

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

const sendEmail = async (subject, to, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: EMAIL_PORT,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
        });

        const options = {
            from: EMAIL_USER,
            subject,
            to,
            text,
        };

        await transporter.sendMail(options);

        log.green('MAILER STATUS', 'Email was sent successfully');
    } catch (error) {
        log.red('MAILER STATUS', error);
        throw new Error(error);
    }
};

module.exports = sendEmail;
