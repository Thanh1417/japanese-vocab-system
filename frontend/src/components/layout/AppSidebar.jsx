import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./AppSidebar.module.css";

function AppSidebar() {
  const { user } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.logo}>JVocab</h2>

      <nav className={styles.nav}>
        <Link to="/dashboard">Dashboard</Link>

        {user?.role === "admin" && (
          <>
            <Link to="/admin/lessons">Quản lý bài học</Link>
            <Link to="/admin/vocabularies">Quản lý từ vựng</Link>
            <Link to="/admin/questions">Quản lý câu hỏi</Link>
            <Link to="/admin/accounts">Quản lý tài khoản</Link>
          </>
        )}

        {user?.role === "learner" && (
          <>
            <Link to="/vocabularies">Từ vựng</Link>
            <Link to="/quiz">Luyện tập</Link>
            <Link to="/favorites">Yêu thích</Link>
            <Link to="/study-sessions">Phiên học</Link>
            <Link to="/srs-review">Ôn tập SRS</Link>
            <Link to="/recommendations">Gợi ý học tập</Link>
          </>
        )}
      </nav>
    </aside>
  );
}

export default AppSidebar;