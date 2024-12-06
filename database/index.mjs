import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    database: process.env.DB_DBNAME_DEV,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

  
  // Function to validate and refresh connection if needed
  async function getValidatedConnection() {
    let connection = await pool.getConnection();
    try {
      await connection.query('SELECT 1');
      await connection.query(`USE ${process.env.DB_DBNAME_DEV}`); // Set the database
    } catch (err) {
      console.error('Connection validation failed, refreshing connection', err);
      connection.release();
      connection = await pool.getConnection();
      await connection.query(`USE ${process.env.DB_DBNAME_DEV}`); // Set the database
    }
    return connection;
  }
    
  
  export  {getValidatedConnection};