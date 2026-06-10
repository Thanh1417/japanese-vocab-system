import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { loginApi } from "../api/authApi";
import { useAuth } from "../contexts/AuthContext";

import ErrorMessage from "../components/common/ErrorMessage";
import styles from "./LoginPage.module.css";

function LoginPage() {
  const [email, setEmail] = useState("login@test.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const res = await loginApi({
        email,
        password,
      });

      const user = res.data.user;

      login({
        token: res.data.token,
        user,
      });

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Japanese Vocabulary System</h1>

        <p className={styles.subtitle}>
          Đăng nhập để tiếp tục học từ vựng tiếng Nhật cá nhân hoá
        </p>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Email</label>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mật khẩu</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
            />
          </div>

          <button className={styles.button} type="submit">
            Đăng nhập
          </button>
        </form>

        <p className={styles.footerText}>
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
        
      </div>
    </div>

  );
}

export default LoginPage;