const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  constructor(data) {
    this.user_id = data.user_id;
    this.full_name = data.full_name;
    this.email = data.email;
    this.password = data.password;
    this.password_hash = data.password_hash;
    this.is_active = data.is_active;
    this.token = data.token;
    this.account_level = data.account_level;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    try {
      const { full_name, email, password } = userData;
      
      // Hash the password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      // Generate JWT token
      const token = jwt.sign(
        { email, full_name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const sql = `
        INSERT INTO users (full_name, email, password, password_hash, token, account_level, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [full_name, email, password, password_hash, token, 1, true];
      
      const result = await db.query(sql, values);
      
      return {
        user_id: result.insertId,
        full_name,
        email,
        token,
        account_level: 1,
        is_active: true
      };
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const sql = 'SELECT * FROM users WHERE email = ?';
      const results = await db.query(sql, [email]);
      return results.length > 0 ? new User(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(user_id) {
    try {
      const sql = 'SELECT * FROM users WHERE user_id = ?';
      const results = await db.query(sql, [user_id]);
      return results.length > 0 ? new User(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Update user token
  static async updateToken(user_id, token) {
    try {
      const sql = 'UPDATE users SET token = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?';
      await db.query(sql, [token, user_id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  async verifyPassword(password) {
    try {
      return await bcrypt.compare(password, this.password_hash);
    } catch (error) {
      throw error;
    }
  }

  // Generate new JWT token
  generateToken() {
    return jwt.sign(
      { 
        user_id: this.user_id,
        email: this.email, 
        full_name: this.full_name,
        account_level: this.account_level
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  // Get user data without sensitive information
  toJSON() {
    return {
      user_id: this.user_id,
      full_name: this.full_name,
      email: this.email,
      is_active: this.is_active,
      account_level: this.account_level,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Check if email already exists
  static async emailExists(email) {
    try {
      const sql = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
      const results = await db.query(sql, [email]);
      return results[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(user_id, updateData) {
    try {
      const allowedFields = ['full_name', 'email'];
      const updates = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(user_id);
      const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
      
      await db.query(sql, values);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
