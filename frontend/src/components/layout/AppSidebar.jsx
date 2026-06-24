import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { 
  MdDashboard, MdLibraryBooks, MdTranslate, MdQuestionAnswer, 
  MdPeople, MdLogout, MdFavorite, MdLightbulb, MdHistory, MdQuiz 
} from "react-icons/md";
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

  // Cấu trúc các đường dẫn để dễ quản lý
  const adminLinks = [
    { to: "/admin/dashboard", label: "Thống kê hệ thống", icon: <MdDashboard /> },
    { to: "/admin/lessons", label: "Quản lý bài học", icon: <MdLibraryBooks /> },
    { to: "/admin/vocabularies", label: "Quản lý từ vựng", icon: <MdTranslate /> },
    { to: "/admin/questions", label: "Quản lý câu hỏi", icon: <MdQuestionAnswer /> },
    { to: "/admin/accounts", label: "Quản lý tài khoản", icon: <MdPeople /> },
  ];

  const learnerLinks = [
    { to: "/dashboard", label: "Thống kê học tập", icon: <MdDashboard /> },
    { to: "/vocabularies", label: "Từ vựng", icon: <MdTranslate /> },
    { to: "/quiz", label: "Học từ vựng", icon: <MdQuiz /> },
    { to: "/favorites", label: "Từ vựng yêu thích", icon: <MdFavorite /> },
    { to: "/recommendations", label: "Học theo gợi ý", icon: <MdLightbulb /> },
    { to: "/study-goals", label: "Mục tiêu học tập", icon: <MdLibraryBooks /> },
    { to: "/study-sessions", label: "Lịch sử học", icon: <MdHistory /> },
  ];

  const navLinks = user?.role === "admin" ? adminLinks : learnerLinks;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <div className={styles.logoSection}>
          <h2 className={styles.logo}>JVocab</h2>
        </div>

        <div className={styles.userBox}>
          <div className={styles.avatar}>
            {user?.full_name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user?.full_name || "Người dùng"}</p>
            <p className={styles.userRole}>
              {user?.role === "admin" ? "Quản trị viên" : "Học viên"}
            </p>
          </div>
        </div>

        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={getLinkClass}>
              <span className={styles.icon}>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <MdLogout /> Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AppSidebar;