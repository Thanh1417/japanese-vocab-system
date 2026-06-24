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

  // Lọc và Phân trang
  const [keyword, setKeyword] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchAccounts = async () => {
    try {
      setError("");
      const res = await getAllAccountsApi();
      setAccounts(res.data.data || res.data);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleChangeRole = async (accountId, role) => {
    try {
      setError(""); setSuccess("");
      await updateAccountApi(accountId, { role });
      setSuccess("Cập nhật vai trò thành công");
      fetchAccounts();
    } catch (error) {
      setError(error.response?.data?.message || "Cập nhật vai trò thất bại");
    }
  };

  const handleChangeStatus = async (accountId, status) => {
    try {
      setError(""); setSuccess("");
      await updateAccountApi(accountId, { status });
      setSuccess("Cập nhật trạng thái thành công");
      fetchAccounts();
    } catch (error) {
      setError(error.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá tài khoản này không? Mọi dữ liệu học tập của họ sẽ bị mất!")) return;
    try {
      setError(""); setSuccess("");
      await deleteAccountApi(accountId);
      setSuccess("Xoá tài khoản thành công");
      fetchAccounts();
    } catch (error) {
      setError(error.response?.data?.message || "Xoá tài khoản thất bại");
    }
  };

  // Logic lọc dữ liệu
  const filteredAccounts = accounts.filter((account) => {
    const searchText = keyword.toLowerCase();
    const matchKeyword =
      account.full_name?.toLowerCase().includes(searchText) ||
      account.email?.toLowerCase().includes(searchText);

    const matchRole = filterRole ? account.role === filterRole : true;
    const matchStatus = filterStatus ? account.status === filterStatus : true;

    return matchKeyword && matchRole && matchStatus;
  });

  // Logic phân trang
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format ngày tháng cho đẹp
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MainLayout>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.title}>Quản lý tài khoản</h1>
          <p className={styles.subtitle}>Kiểm soát quyền truy cập và thông tin người dùng</p>
        </div>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className={styles.filterBox}>
        <input
          className={styles.filterInput}
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }}
          placeholder="Tìm theo họ tên hoặc email..."
        />

        <select
          className={styles.filterSelect}
          value={filterRole}
          onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Tất cả vai trò</option>
          <option value="learner">Học viên (Learner)</option>
          <option value="admin">Quản trị (Admin)</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="locked">Bị khoá</option>
        </select>
      </div>

      <p className={styles.resultText}>
        Tìm thấy <strong>{filteredAccounts.length}</strong> tài khoản
      </p>

      {loading && <LoadingMessage />}

      {!loading && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th width="80px" style={{textAlign: "center"}}>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th width="150px">Vai trò</th>
                  <th width="150px">Trạng thái</th>
                  <th width="160px">Ngày đăng ký</th>
                  <th width="100px" style={{textAlign: "center"}}>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {paginatedAccounts.map((account) => (
                  <tr key={account.account_id}>
                    <td style={{textAlign: "center", fontWeight: "600", color: "#64748b"}}>{account.account_id}</td>
                    <td className={styles.nameText}>{account.full_name}</td>
                    <td className={styles.emailText}>{account.email}</td>

                    <td>
                      <select
                        className={`${styles.selectBadge} ${account.role === 'admin' ? styles.roleAdmin : styles.roleLearner}`}
                        value={account.role}
                        onChange={(e) => handleChangeRole(account.account_id, e.target.value)}
                      >
                        <option value="learner">Learner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td>
                      <select
                        className={`${styles.selectBadge} ${account.status === 'locked' ? styles.statusLocked : styles.statusActive}`}
                        value={account.status}
                        onChange={(e) => handleChangeStatus(account.account_id, e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="locked">Locked</option>
                      </select>
                    </td>

                    <td className={styles.dateText}>
                      {formatDate(account.created_at)}
                    </td>

                    <td style={{textAlign: "center"}}>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDelete(account.account_id)}
                        title="Xoá tài khoản"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
                
                {paginatedAccounts.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{textAlign: "center", padding: "30px", color: "#94a3b8"}}>
                      Không tìm thấy tài khoản
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Trước</button>
              <span>Trang {currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Sau</button>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}

export default AccountManagementPage;