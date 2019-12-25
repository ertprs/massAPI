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

function checkIfBulkDataIsNotProcessed() {
  const CURRENT_DAY = new Date();
  return new Promise((resolve, reject) => {
    connection.query("SELECT users.plan, users.id as user FROM `users-permissions_user` as users INNER JOIN historypayments ON users.id=historypayments.user WHERE ? NOT BETWEEN historypayments.dateStart AND historypayments.dateEnd AND users.plan IS NOT NULL GROUP BY users.id", [CURRENT_DAY], function (error, users) {
      if (!error) {
        if (users.length > 0) {
            resolve(users)
            console.log(users)
          } else {
            console.log("Users canceled not available.");
            resolve()
          }
      } else {
        console.log('CHECK USERS Error: ', error.message)
        resolve()
      }
    })
  })
}

function changeAccess (userIds) {
  return new Promise(async (resolve) => {
    if (userIds) {
        for (let index = 0; index < userIds.length; index++) {
            const userId = userIds[index].user;
            connection.query('UPDATE `users-permissions_user` SET plan = null WHERE id = ?', [userId], function(error) {
              if (error) {
                console.log('error', error.message)
              } else {
                console.log('Updated user >>>', userId)
              }
            })
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
    .then(changeAccess)
    .then(() => {
        setTimeout(() => {
            init()
        }, 9000)
    })
}


init()