# Zap back-end

## 1. Configure Server
Install mysql in the server
  sudo apt-get update
  sudo apt-get install mysql-server

Start the MySQL service
  sudo systemctl start mysql

Change the default collation to utf8mb4
  Go to the file and edit /etc/mysql/conf.d/mysql.cnf

  ```
  [mysql]
  default-character-set = utf8mb4

  [client]
  default-character-set = utf8mb4

  [mysqld]
  character-set-client-handshake = FALSE
  character-set-server = utf8mb4
  collation-server = utf8mb4_unicode_ci
  ```

## 2. Project setup

1) Install node module
  ```
  npm install

2) Change the environment variable
  ```
  Go to the .env file and change the ip
  ``
  CURRENT_URL = http://172.107.180.59:1337
  
  ```
  Go to /config/environments/server.json and change ip
  ``
  "host": "172.107.180.59"

## 3. Compiles and hot-reloads for development
```
npm run build
```