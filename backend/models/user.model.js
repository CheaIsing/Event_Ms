const pool = require("../config/db")

class User{

    static async findByEmail (email){
        const sql = "SELECT * FROM tbl_users WHERE email = ?"
        const [user] = await pool.query(sql, email);
        return user;

    }

    static async findById (id){
        const sql = "SELECT * FROM tbl_users WHERE id = ?"
        const [user] = await pool.query(sql, id);
        return user;

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

    
}

module.exports = User