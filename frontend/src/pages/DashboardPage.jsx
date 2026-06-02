import { useAuth } from "../contexts/AuthContext";
import MainLayout from "../layouts/MainLayout";

function DashboardPage() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <h1>Dashboard</h1>

      <p>Xin chào: {user?.full_name}</p>
      <p>Email: {user?.email}</p>
      <p>Vai trò: {user?.role}</p>
    </MainLayout>
  );
}

export default DashboardPage;