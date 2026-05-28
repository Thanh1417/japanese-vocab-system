const { PrismaClient } = require("../generated/prisma");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "japanese_vocab_system",
});

const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;