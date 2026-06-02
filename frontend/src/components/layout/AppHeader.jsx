import { useAuth } from "../../contexts/AuthContext";

function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        height: "60px",
        background: "white",
        borderBottom: "1px solid #ddd",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
      }}
    >
      <h3>Hệ thống học từ vựng tiếng Nhật</h3>

      <div>
        <span>{user?.full_name}</span>

        <button
          onClick={logout}
          style={{
            marginLeft: "10px",
          }}
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

export default AppHeader;