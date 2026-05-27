const AccountModel = {
  tableName: "accounts",

  columns: {
    id: "account_id",
    fullName: "full_name",
    email: "email",
    password: "password",
    role: "role",
    status: "status",
    createdAt: "created_at",
  },
};

module.exports = AccountModel;