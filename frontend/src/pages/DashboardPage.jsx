import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Xin chào: {user?.full_name}</p>
      <p>Email: {user?.email}</p>
      <p>Vai trò: {user?.role}</p>

      <button onClick={logout}>Đăng xuất</button>
    </div>
  );
}

export default Dashboard;