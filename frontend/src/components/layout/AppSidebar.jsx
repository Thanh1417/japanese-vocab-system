import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function AppSidebar() {
  const { user } = useAuth();

  return (
    <aside
      style={{
        width: "220px",
        background: "#1e293b",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h2>JVocab</h2>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginTop: "30px",
        }}
      >
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
          </>
        )}
      </nav>
    </aside>
  );
}

export default AppSidebar;