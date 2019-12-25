const nodemailer = require('nodemailer');
const mysql = require('mysql')
const path = require('path');
require('dotenv').config()

const smtpTransport = require('nodemailer-smtp-transport');
const handlebars = require('handlebars');
const fs = require('fs');

const readHTMLFile = async (path) => {
  return await fs.readFileSync(path, { encoding: 'utf-8' });
};

const connection = mysql.createConnection({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE
});

let isRunning = false

/*
* Permite detectar si permite correr.
* Santiago Blanco
*/
function checkIfCanRun () {
  return new Promise ((resolve, reject) => {
    if (isRunning) {
      reject('CAN RUN BECAUSE ITS RUNNING')
    } else {
      resolve()
    }
  })
}

/*
* Permite verificar si hay registros en DB
* Se trae solo uno
* Santiago Blanco
*/
function checkIfBulkDataIsNotProcessed() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT userphones.id, userphones.phone, users.email, users.username FROM userphones INNER JOIN `users-permissions_user` as users ON users.id=userphones.user WHERE userphones.emailSend IS NULL OR userphones.emailSend = 0', function (error, phones) {
      if (!error) {
        if (phones.length > 0) {
            resolve(phones)
        } else {
          console.log("Phones not available.");
          resolve()
        }
      } else {
        console.log('CHECK Error: ', error.message)
        resolve()
      }
    });
  })
}

function sendRequestMails(phones) {
    return new Promise((resolve, reject) => {
        let phoneIds = []
        if (phones) {
            for (let index = 0; index < phones.length; index++) {
                let phone = phones[index];
                sendMail (phone.username, phone.email, phone.phone);
                console.log('Email sending.')
                phoneIds.push(phone.id);
            }

            resolve(phoneIds);
        } else {
            resolve()
        }
    
    });
}

function readyMail (phoneIds) {
  return new Promise(async (resolve) => {
    if (phoneIds) {
        for (let index = 0; index < phoneIds.length; index++) {
            const phoneId = phoneIds[index];
            await connection.query('UPDATE userphones SET emailSend = 1 WHERE id = ?', [phoneId])
        }
    }
    resolve()
  });
}

/*
* Permite iniciar 
* Santiago Blanco
*/
function init () {
  checkIfCanRun()
    .then(checkIfBulkDataIsNotProcessed)
    .then(sendRequestMails)
    .then(readyMail)
    .then(() => {
        setTimeout(() => {
            init()
        }, 9000)
    })
}


init()

async function sendMail (username, to, number) {
    const transporter = nodemailer.createTransport(smtpTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE, // use SSL
    auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    }));

    let templateDir = path.join(__dirname, 'email-template/emailGetNumber.html');

    let html = await readHTMLFile(templateDir);

    var template = handlebars.compile(html);
    var replacements = {
            name: username,
            phoneNumber: number
    };
    var htmlToSend = template(replacements);
    var mailOptions = {
        from: process.env.MAIL_USERNAME,
        to,
        subject : 'Generation phone number',
        html : htmlToSend
    };
    
    return await transporter.sendMail(mailOptions);
}