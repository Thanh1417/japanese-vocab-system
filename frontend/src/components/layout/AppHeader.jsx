import { useAuth } from "../../contexts/AuthContext";
import styles from "./AppHeader.module.css";

function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <h3 className={styles.title}>Hệ thống học từ vựng tiếng Nhật</h3>

      <div className={styles.userBox}>
        <span>{user?.full_name}</span>
        <button className={styles.logoutButton} onClick={logout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

export default AppHeader;