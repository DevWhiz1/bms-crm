const mysql = require('mysql2/promise');
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
const getConnection = async () => {
  return await pool.getConnection();
};

// Execute query with promise
const query = async (sql, params = []) => {
  const [results] = await pool.execute(sql, params);
  return results;
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
