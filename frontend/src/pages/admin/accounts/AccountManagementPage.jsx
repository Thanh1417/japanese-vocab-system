import { useEffect, useState } from "react";

import MainLayout from "../../../layouts/MainLayout";

import {
  deleteAccountApi,
  getAllAccountsApi,
  updateAccountApi,
} from "../../../api/accountApi";

import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";
import SuccessMessage from "../../../components/common/SuccessMessage";

import styles from "./AccountManagementPage.module.css";

function AccountManagementPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [keyword, setKeyword] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchAccounts = async () => {
    try {
      setError("");

      const res = await getAllAccountsApi();

      setAccounts(res.data.data || res.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Không thể tải danh sách tài khoản"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleChangeRole = async (
    accountId,
    role
  ) => {
    try {
      setError("");
      setSuccess("");

      await updateAccountApi(accountId, {
        role,
      });

      setSuccess(
        "Cập nhật vai trò thành công"
      );

      fetchAccounts();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Cập nhật vai trò thất bại"
      );
    }
  };

  const handleChangeStatus = async (
    accountId,
    status
  ) => {
    try {
      setError("");
      setSuccess("");

      await updateAccountApi(accountId, {
        status,
      });

      setSuccess(
        "Cập nhật trạng thái thành công"
      );

      fetchAccounts();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Cập nhật trạng thái thất bại"
      );
    }
  };

  const handleDelete = async (accountId) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xoá tài khoản này không?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteAccountApi(accountId);

      setSuccess("Xoá tài khoản thành công");

      fetchAccounts();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Xoá tài khoản thất bại"
      );
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    const searchText = keyword.toLowerCase();

    const matchKeyword =
      account.full_name?.toLowerCase().includes(searchText) ||
      account.email?.toLowerCase().includes(searchText);

    const matchRole = filterRole ? account.role === filterRole : true;

    const matchStatus = filterStatus ? account.status === filterStatus : true;

    return matchKeyword && matchRole && matchStatus;
  });

  return (
    <MainLayout>
      <h1 className={styles.title}>
        Quản lý tài khoản
      </h1>

      <ErrorMessage message={error} />

      <SuccessMessage message={success} />

      <div className={styles.filterBox}>
        <input
          className={styles.filterInput}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo họ tên hoặc email..."
        />

        <select
          className={styles.filterSelect}
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">Tất cả vai trò</option>
          <option value="learner">learner</option>
          <option value="admin">admin</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">active</option>
          <option value="locked">locked</option>
        </select>
      </div>

      <p className={styles.resultText}>
        Tìm thấy <strong>{filteredAccounts.length}</strong> tài khoản
      </p>

      {loading && <LoadingMessage />}

      {!loading && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.account_id}>
                  <td>{account.account_id}</td>

                  <td>{account.full_name}</td>

                  <td>{account.email}</td>

                  <td>
                    <select
                      className={
                        styles.select
                      }
                      value={account.role}
                      onChange={(e) =>
                        handleChangeRole(
                          account.account_id,
                          e.target.value
                        )
                      }
                    >
                      <option value="learner">
                        learner
                      </option>

                      <option value="admin">
                        admin
                      </option>
                    </select>
                  </td>

                  <td>
                    <select
                      className={
                        styles.select
                      }
                      value={account.status}
                      onChange={(e) =>
                        handleChangeStatus(
                          account.account_id,
                          e.target.value
                        )
                      }
                    >
                      <option value="active">
                        active
                      </option>

                      <option value="locked">
                        locked
                      </option>
                    </select>
                  </td>

                  <td>
                    {new Date(
                      account.created_at
                    ).toLocaleString()}
                  </td>

                  <td>
                    <button
                      className={
                        styles.deleteButton
                      }
                      onClick={() =>
                        handleDelete(
                          account.account_id
                        )
                      }
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}

export default AccountManagementPage;