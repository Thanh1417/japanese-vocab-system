import { NavLink } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

import styles from "./AppSidebar.module.css";

function AppSidebar() {
  const { user } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.logo}>
        Japanese Learning
      </h2>

      <nav className={styles.nav}>
        {user?.role === "admin" ? (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/admin/lessons"
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Quản lý bài học
            </NavLink>

            <NavLink
              to="/admin/vocabularies"
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Quản lý từ vựng
            </NavLink>

            <NavLink
              to="/admin/questions"
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Quản lý câu hỏi
            </NavLink>

            <NavLink
              to="/admin/accounts"
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Quản lý tài khoản
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/vocabularies"
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Từ vựng
            </NavLink>

            <NavLink
              to="/flashcards"
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Flashcard
            </NavLink>

            <NavLink
              to="/quiz"
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Quiz
            </NavLink>

            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Yêu thích
            </NavLink>

            <NavLink
              to="/srs-review"
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Ôn tập SRS
            </NavLink>

            <NavLink
              to="/recommendations"
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Gợi ý học tập
            </NavLink>

            <NavLink
              to="/study-sessions"
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Lịch sử học
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}

export default AppSidebar;