const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Omar Ali <omar1234alhdre@gmail.com>`;
  }

  newTransport() {
        
    if(1){
      const transporter =nodemailer.createTransport({
        service:"gmail",
        auth: {
          user:"omar1234alhdre@gmail.com",
          pass: "nidb nrpi mepm dnpl",
          
        },
      });
      console.log(transporter);
      return transporter
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: "hello world?"
    };

    // 3) Create a transport and send email
    const transporter=await this.newTransport()
    //console.log('here');
    //console.log(this.newTransport());
    //console.log(this.newTransport().sendMail());
    
    await transporter.sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};

