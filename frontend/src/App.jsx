import { useState } from "react";

function App() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div>
      <h1>Đăng ký tài khoản</h1>

      <form onSubmit={handleRegister}>
        <div>
          <label>Họ tên:</label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Mật khẩu:</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Đăng ký</button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default App;