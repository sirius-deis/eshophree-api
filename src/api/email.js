const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const { log } = require('mercedlogger');

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

const sendEmail = async (subject, to, template, context) => {
    try {
        const transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: EMAIL_PORT,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
        });

        const handlebarOptions = {
            viewEngine: {
                partialsDir: path.resolve(__dirname, './emails/'),
                defaultLayout: false,
            },
            viewPath: path.resolve(__dirname, '../views/emails'),
        };

        transporter.use('compile', hbs(handlebarOptions));

        const options = {
            from: `< Name Surname ${EMAIL_USER}>`,
            subject,
            to,
            template: `${template}.emails`,
            context,
        };

        await transporter.sendMail(options);

        log.green('MAILER STATUS', 'Email was sent successfully');
    } catch (error) {
        log.red('MAILER STATUS', error);
        throw new Error(error);
    }
};

module.exports = sendEmail;
