const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlTotext = require('html-to-text');

/**@description: Sending mail using niodemailer module  */
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Abhishek devliya <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendinBlue', //email service e.g gmail

        auth: {
          user: process.env.BREVO_USERNAME,
          pass: process.env.BREVO_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlTotext.convert(html),
    };
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    console.log('abhishek email');
    await this.send('welcome', 'Welcome to the Natours tours ');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token. Valid for 10 minutes only',
    );
  }
};
