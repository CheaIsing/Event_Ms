const pool = require("../config/db")
const moment = require("moment")

class User{

    static async findByEmail (email){
        const sql = "SELECT * FROM tbl_users WHERE email = ?"
        const [user] = await pool.query(sql, email);
        return user.length > 0 ? user[0] : null ;

    }

    static async findById (id){
        const sql = "SELECT * FROM tbl_users WHERE id = ?"
        const [user] = await pool.query(sql, id);
        return user.length > 0 ? user[0] : null ;

    }

    static async create (username, email, password){
        const sql = "INSERT INTO tbl_users (username, email, password) VALUES (?, ?, ?)";
        const params = [username, email, password];
  
        const [rows] = await pool.query(sql, params);
        return rows
    }

    
    static async updateResetToken (otp, expirationTime, email){
        const sql =
        "UPDATE tbl_users SET reset_token = ?, reset_token_expiration = ? WHERE email = ?";
      const params = [otp, expirationTime, email];
  
        const [rows] = await pool.query(sql, params);
        return rows
    }

    static async updatePassword (password, email){
        const sql =
        "UPDATE tbl_users SET password = ?, reset_token_expiration = ? WHERE email = ?";
      const params = [password, currentTime, email];
  
        const [rows] = await pool.query(sql, params);
        return rows
    }

    static async updateUserByEmail (email, updates){
        const setClause = Object.keys(updates).map(key=> `${key} = ?`).join(", ");

        const sql = `UPDATE tbl_users SET ${setClause} WHERE email = ?`;

        const params = Object.values(updates);

        const [rows] = await pool.query(sql, [...params, email]);

        return rows;
    }

    static async updateUserById (id, updates){
        const setClause = Object.keys(updates).map(key=> `${key} = ?`).join(", ");

        const sql = `UPDATE tbl_users SET ${setClause} WHERE id = ?`;

        const params = Object.values(updates);

        const [rows] = await pool.query(sql, [...params, id]);

        return rows;
    }
    
}

module.exports = User