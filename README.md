# Zap back-end

## 1. Configure Server
Install mysql in the server
  sudo apt-get update
  sudo apt-get install mysql-server

Start the MySQL service
  sudo systemctl start mysql

Change the default collation to utf8mb4
  /etc/mysql/conf.d/mysql.cnf

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

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run build
```