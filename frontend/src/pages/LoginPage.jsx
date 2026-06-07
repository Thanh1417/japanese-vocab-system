import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/authApi";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const [email, setEmail] = useState("login@test.com");
  const [password, setPassword] = useState("123456");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginApi({
        email,
        password,
      });

      const user = res.data.user;

      login({
        token: res.data.token,
        user,
      });

      setMessage("Đăng nhập thành công");

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div>
      <h2>Đăng nhập</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Đăng nhập</button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Login;