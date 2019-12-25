const mysql = require('mysql')
require('dotenv').config()

const time = 5000;

var request = require('request');

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
    connection.query('SELECT * FROM bulkData WHERE processed = 0 LIMIT 1', function (error, file) {
      if (!error) {
        if (file.length > 0) {
          resolve(file)
        } else {
          console.log("Bulk not available.");
          resolve()
        }
      } else {
        console.log('CHECK Error: ', error.message)
        resolve()
      }
    });
  })
}

/*
* Permite importar archivo CSV
* Santiago s
*/
function importCSV(file) {
  return new Promise((resolve, reject) => {
    if (file) {
      request.get(file[0].url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          let parseBody = parseCSV(body, file[0].campaign)
          resolve({ registries: parseBody, idBulk: file[0].id })
        } else {
          console.log('Import CSV: ', error);
          resolve()
        }
      });
    } else {
      resolve();
    }
  });
}

function insertRegistries (data) {
  return new Promise((resolve, reject) => {
    if (data) {
      let { registries, idBulk } = data
        connection.query('INSERT INTO campaignusers (phone, name, address, campaign) VALUES ?', [registries], function (error) {
          if (!error) {
            console.log('Data was inserted.')
          } else {
            console.log('Insert Error: ', error.message)
          }
        });
        resolve(idBulk)
    } else {
      resolve()
    }
  })
}

function readyRegistry (idBulk) {
  return new Promise((resolve, reject) => {
    if (idBulk) {
      connection.query('UPDATE bulkdata SET processed = 1 WHERE id = ?', [idBulk], function (error) {
        if (!error) {
          console.log('Bulk processed.')
        } else {
          console.log('Update Error: ', error.message)
        }
      });
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
  .then(importCSV)
  .then(insertRegistries)
  .then(readyRegistry)
  .then(() => {
    console.log('termina')
    setTimeout(() => {
        init()
    }, 9000)
  })
}

function parseCSV (stringCSV, campaign) {
  let csvParse = stringCSV.split('\n') // split string to lines
  .map(e => e.trim()) // remove white spaces for each line
  .map(e => e.split(','))
  .map(e => {
    let returnResult = false;
    e.filter((el, index) => { 
      if (el !== '') {
        returnResult = true;
      }
    })
    if (returnResult) {
      e.push(campaign)
      return e; 
    }
  }).filter((e, index) => { 
    if (e !== undefined) {
      return e
    }
  })

  return csvParse;
}

init()