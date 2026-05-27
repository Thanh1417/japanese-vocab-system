const db = require("../config/db");
const AccountModel = require("../models/accountModel");

const findByEmail = (email) => {
  const sql = `SELECT * FROM ${AccountModel.tableName} WHERE email = ?`;

  return new Promise((resolve, reject) => {
    db.query(sql, [email], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
};

const createAccount = (full_name, email, hashedPassword) => {
  const sql = `
    INSERT INTO ${AccountModel.tableName}
    (full_name, email, password, role, status)
    VALUES (?, ?, ?, 'learner', 'active')
  `;

  return new Promise((resolve, reject) => {
    db.query(sql, [full_name, email, hashedPassword], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

module.exports = {
  findByEmail,
  createAccount,
};