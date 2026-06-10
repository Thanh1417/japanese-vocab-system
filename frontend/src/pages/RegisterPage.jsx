import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { registerApi } from "../api/authApi";
import ErrorMessage from "../components/common/ErrorMessage";
import SuccessMessage from "../components/common/SuccessMessage";

import styles from "./RegisterPage.module.css";

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      await registerApi({
        full_name: fullName,
        email,
        password,
      });

      setSuccess("Đăng ký thành công. Đang chuyển sang đăng nhập...");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Tạo tài khoản</h1>

        <p className={styles.subtitle}>
          Đăng ký tài khoản để bắt đầu học từ vựng tiếng Nhật cá nhân hoá
        </p>

        <ErrorMessage message={error} />
        <SuccessMessage message={success} />

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Họ tên</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ tên"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button className={styles.button} type="submit">
            Đăng ký
          </button>
        </form>

        <p className={styles.footerText}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;