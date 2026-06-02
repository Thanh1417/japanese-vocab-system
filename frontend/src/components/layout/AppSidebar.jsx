import { Link } from "react-router-dom";

function AppSidebar() {
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
        <Link to="/lessons">Bài học</Link>
        <Link to="/vocabularies">Từ vựng</Link>
        <Link to="/questions">Câu hỏi</Link>
        <Link to="/favorites">Yêu thích</Link>
        <Link to="/study-sessions">Phiên học</Link>
      </nav>
    </aside>
  );
}

export default AppSidebar;