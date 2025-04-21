const { Sequelize } = require("sequelize");
const mysql = require("mysql2/promise")

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306
};

const pool = mysql.createPool(dbConfig);

const connectToDb = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

connectToDb();


module.exports = pool;