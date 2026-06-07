import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./AppHeader.module.css";

function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <h3 className={styles.title}>Hệ thống học từ vựng tiếng Nhật</h3>

      <div className={styles.userBox}>
        <span>{user?.full_name}</span>

        <button className={styles.logoutButton} onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

export default AppHeader;