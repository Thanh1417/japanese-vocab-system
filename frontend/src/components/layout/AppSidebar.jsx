import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./AppSidebar.module.css";

function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getLinkClass = ({ isActive }) => {
    return isActive ? `${styles.link} ${styles.active}` : styles.link;
  };

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.logo}>Japanese Learning</h2>

      <div className={styles.userBox}>
        <p className={styles.userName}>{user?.full_name}</p>
        <p className={styles.userRole}>{user?.role}</p>
      </div>

      <nav className={styles.nav}>
        {user?.role === "admin" ? (
          <>
            <NavLink to="/admin/dashboard" className={getLinkClass}>
              Dashboard
            </NavLink>

            <NavLink to="/admin/lessons" className={getLinkClass}>
              Quản lý bài học
            </NavLink>

            <NavLink to="/admin/vocabularies" className={getLinkClass}>
              Quản lý từ vựng
            </NavLink>

            <NavLink to="/admin/questions" className={getLinkClass}>
              Quản lý câu hỏi
            </NavLink>

            <NavLink to="/admin/accounts" className={getLinkClass}>
              Quản lý tài khoản
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className={getLinkClass}>
              Dashboard
            </NavLink>

            <NavLink to="/vocabularies" className={getLinkClass}>
              Từ vựng
            </NavLink>

            <NavLink to="/flashcards" className={getLinkClass}>
              Flashcard
            </NavLink>

            <NavLink to="/quiz" className={getLinkClass}>
              Quiz
            </NavLink>

            <NavLink to="/favorites" className={getLinkClass}>
              Yêu thích
            </NavLink>

            {/* <NavLink to="/srs-review" className={getLinkClass}>
              Ôn tập SRS
            </NavLink> */}

            <NavLink to="/recommendations" className={getLinkClass}>
              Gợi ý học tập
            </NavLink>

            <NavLink to="/study-goals" className={getLinkClass}>
              Mục tiêu học tập
            </NavLink>

            <NavLink to="/study-sessions" className={getLinkClass}>
              Lịch sử học
            </NavLink>
          </>
        )}
      </nav>

      <button className={styles.logoutButton} onClick={handleLogout}>
        Đăng xuất
      </button>
    </aside>
  );
}

export default AppSidebar;