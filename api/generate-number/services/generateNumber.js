const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config()

const smtpTransport = require('nodemailer-smtp-transport');
const handlebars = require('handlebars');
const fs = require('fs');

const readHTMLFile = async (path) => {
  return await fs.readFileSync(path, { encoding: 'utf-8' });
};


module.exports = {
    sendMail : async (currentUser, to) => {
      let emailConfig = {};
      if (strapi.config.environment === 'development') {
        emailConfig = strapi.config.environments.development;
      } else if (strapi.config.environment === 'production') {
        emailConfig = strapi.config.environments.production; 
      }

      const transporter = nodemailer.createTransport(smtpTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: process.env.MAIL_SECURE, // use SSL
        auth: {
              user: process.env.MAIL_USERNAME,
              pass: process.env.MAIL_PASSWORD
          }
      }));

      let templateDir = path.join(__dirname, '../', 'templates', 'emailGenerateNumber.html');

      let html = await readHTMLFile(templateDir);

      var template = handlebars.compile(html);
      var replacements = {
              id: currentUser.id,
              name: currentUser.username,
              email: currentUser.email,
              plan: currentUser.plan.name
      };
      var htmlToSend = template(replacements);
      var mailOptions = {
          from: process.env.MAIL_USERNAME,
          to,
          subject : 'Require generation phone number',
          html : htmlToSend
      };
      
      return await transporter.sendMail(mailOptions);
    }
};
