// const { PrismaClient } = require("../generated/prisma");
// const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

// const adapter = new PrismaMariaDb({
//   host: "localhost",
//   port: 3306,
//   user: "root",
//   password: "",
//   database: "japanese_vocab_system",
// });

// const prisma = new PrismaClient({
//   adapter,
// });

// module.exports = prisma;
const { PrismaClient } = require("../generated/prisma");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

// Dùng thẳng DATABASE_URL đã được docker-compose truyền đúng vào container
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);


const prisma = new PrismaClient({ adapter });

module.exports = prisma;