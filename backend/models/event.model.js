const pool = require("../config/db");

class Event {
  static {
    this.initializeTable();
  }

  static async initializeTable() {
    const sql = ` CREATE TABLE IF NOT EXISTS tbl_users (
        id BIGINT UNSIGNED AUTO_INCREMENT ,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone varchar(15) DEFAULT NULL,
        avatar varchar(500) DEFAULT NULL,
        address varchar(255) DEFAULT NULL,
        role tinyint(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT '1 for Guest, 2 for Organizer, 3 for Admin',
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        reset_token varchar(6) DEFAULT NULL,
        reset_token_expiration datetime DEFAULT NULL,
        avatar_public_id varchar(255) DEFAULT NULL,
        PRIMARY KEY(id))`;

    try {
      const [result] = await pool.query(sql);
      console.log("Users table schema initialized successfully");
      return result;
    } catch (error) {
      console.error("Error initializing users table schema:", error);
      throw error;
    }
  }

  static async find() {
    const sql = "SELECT * FROM tbl_events";
    const [user] = await pool.query(sql, email);
    return user.length > 0 ? user[0] : null;
  }

  static async findById(id) {
    const sql = "SELECT * FROM tbl_events WHERE id = ?";
    const [user] = await pool.query(sql, id);
    return user.length > 0 ? user[0] : null;
  }

  static async create(username, email, password) {
    const sql =
      "INSERT INTO tbl_users (username, email, password) VALUES (?, ?, ?)";
    const params = [username, email, password];

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async updateResetToken(otp, expirationTime, email) {
    const sql =
      "UPDATE tbl_users SET reset_token = ?, reset_token_expiration = ? WHERE email = ?";
    const params = [otp, expirationTime, email];

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async updateUserById(id, updates) {
    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");

    const sql = `UPDATE tbl_users SET ${setClause} WHERE id = ?`;

    const params = Object.values(updates);

    const [rows] = await pool.query(sql, [...params, id]);

    return rows;
  }

  static async deleteById(userId) {
    const sql = "DELETE FROM tbl_users WHERE id = ? ";

    const [rows] = await pool.query(sql, userId);

    return rows;
  }
}

module.exports = Event;
