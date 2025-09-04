const mysql = require('mysql2');
require('dotenv').config();

// connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Get a connection from the pool
const getConnection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
};

// Execute query with promise
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    pool.execute(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Test connection
const testConnection = async () => {
  try {
    const connection = await getConnection();
    console.log('Database connection test successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  getConnection,
  query,
  testConnection
};
