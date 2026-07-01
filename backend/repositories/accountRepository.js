const prisma = require("../config/prisma");


const findByEmail = async (email) => {
  return await prisma.accounts.findUnique({
    where: {
      email,
    },
  });
};

const createAccount = async (data) => {
  return await prisma.accounts.create({
    data,
  });
};

const createGoogleAccount = async (full_name, email, password) => {
  return await prisma.accounts.create({
    data: {
      full_name,
      email,
      password,
      role: "learner",
      status: "active",
    },
  });
};

const findAllAccounts = async () => {
  return await prisma.accounts.findMany({
    select: {
      account_id: true,
      full_name: true,
      email: true,
      role: true,
      status: true,
      created_at: true,
    },
    orderBy: {
      account_id: "desc",
    },
  });
};

const findAccountById = async (account_id) => {
  return await prisma.accounts.findUnique({
    where: {
      account_id: Number(account_id),
    },
    select: {
      account_id: true,
      full_name: true,
      email: true,
      role: true,
      status: true,
      created_at: true,
    },
  });
};

const searchAccounts = async (keyword) => {
  return await prisma.accounts.findMany({
    where: {
      OR: [
        { full_name: { contains: keyword } },
        { email: { contains: keyword } },
      ],
    },
    select: {
      account_id: true,
      full_name: true,
      email: true,
      role: true,
      status: true,
      created_at: true,
    },
    orderBy: {
      account_id: "desc",
    },
  });
};

const updateAccount = async (account_id, data) => {
  return await prisma.accounts.update({
    where: {
      account_id: Number(account_id),
    },
    data: {
      full_name: data.full_name,
      email: data.email,
      role: data.role,
      status: data.status,
    },
    select: {
      account_id: true,
      full_name: true,
      email: true,
      role: true,
      status: true,
      created_at: true,
    },
  });
};

const deleteAccount = async (account_id) => {
  return await prisma.accounts.delete({
    where: {
      account_id: Number(account_id),
    },
  });
};

module.exports = {
  findByEmail,
  createAccount,
  createGoogleAccount,
  findAllAccounts,
  findAccountById,
  searchAccounts,
  updateAccount,
  deleteAccount,
};