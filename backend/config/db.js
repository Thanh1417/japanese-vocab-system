const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "japanese_vocab_system",
});

connection.connect((err) => {
  if (err) {
    console.log("Ket noi that bai!");
    console.log(err);
  } else {
    console.log("Ket noi database thanh cong!");
  }
});

module.exports = connection;