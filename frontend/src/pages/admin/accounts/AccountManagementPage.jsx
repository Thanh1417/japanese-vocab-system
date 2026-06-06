import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import {
  deleteAccountApi,
  getAllAccountsApi,
  updateAccountApi,
} from "../../../api/accountApi";
import styles from "./AccountManagementPage.module.css";

function AccountManagementPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const res = await getAllAccountsApi();
      setAccounts(res.data.data || res.data);
    } catch (error) {
      alert("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleChangeRole = async (accountId, role) => {
    try {
      await updateAccountApi(accountId, { role });
      alert("Cập nhật vai trò thành công");
      fetchAccounts();
    } catch (error) {
      alert(error.response?.data?.message || "Cập nhật vai trò thất bại");
    }
  };

  const handleChangeStatus = async (accountId, status) => {
    try {
      await updateAccountApi(accountId, { status });
      alert("Cập nhật trạng thái thành công");
      fetchAccounts();
    } catch (error) {
      alert(error.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá tài khoản này không?")) {
      return;
    }

    try {
      await deleteAccountApi(accountId);
      alert("Xoá tài khoản thành công");
      fetchAccounts();
    } catch (error) {
      alert(error.response?.data?.message || "Xoá tài khoản thất bại");
    }
  };

  return (
    <MainLayout>
      <h1 className={styles.title}>Quản lý tài khoản</h1>

      {loading && <p className={styles.message}>Đang tải dữ liệu...</p>}

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
              {accounts.map((account) => (
                <tr key={account.account_id}>
                  <td>{account.account_id}</td>
                  <td>{account.full_name}</td>
                  <td>{account.email}</td>

                  <td>
                    <select
                      className={styles.select}
                      value={account.role}
                      onChange={(e) =>
                        handleChangeRole(account.account_id, e.target.value)
                      }
                    >
                      <option value="learner">learner</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>

                  <td>
                    <select
                      className={styles.select}
                      value={account.status}
                      onChange={(e) =>
                        handleChangeStatus(account.account_id, e.target.value)
                      }
                    >
                      <option value="active">active</option>
                      <option value="locked">locked</option>
                    </select>
                  </td>

                  <td>{new Date(account.created_at).toLocaleString()}</td>

                  <td>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(account.account_id)}
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