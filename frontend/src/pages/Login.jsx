import { useState } from "react";
import { loginApi } from "../api/authApi";

function Login() {
  const [email, setEmail] = useState("login@test.com");
  const [password, setPassword] = useState("123456");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await loginApi({ email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMessage("Đăng nhập thành công!");
    } catch (error) {
        console.log("LOGIN ERROR:", error);
        console.log("ERROR RESPONSE:", error.response);

        setMessage(
            error.response?.data?.message ||
            error.message ||
            "Đăng nhập thất bại!"
        );
    }
  };

  return (
    <div>
      <h1>Đăng nhập</h1>

      <form onSubmit={handleLogin}>
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