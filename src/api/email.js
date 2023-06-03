const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const log = require('../utils/log');

// eslint-disable-next-line object-curly-newline
const { NODE_ENV, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

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
        extname: '.handlebars',
        partialsDir: path.resolve(__dirname, '../views', 'emails/'),
        layoutsDir: path.resolve(__dirname, '../views', 'emails/layouts'),
        defaultLayout: path.resolve(__dirname, '../views', './emails/layouts/root.emails.handlebars'),
      },
      viewPath: path.resolve(__dirname, '../views/emails'),
      extName: '.handlebars',
    };

    transporter.use('compile', hbs(handlebarOptions));

    const options = {
      from: `< Name Surname ${EMAIL_USER}>`,
      subject,
      to,
      template: `${template}.emails`,
      context,
    };

    if (NODE_ENV === 'development') {
      log('info', 'magenta', 'mailer status', 'Email was sent successfully');

      log('info', 'blue', 'mailer status', context.link);
    } else {
      await transporter.sendMail(options);
    }
  } catch (error) {
    // log('error', 'red', 'mailer status', error);
    // throw new Error(error);
  }
};

module.exports = sendEmail;
