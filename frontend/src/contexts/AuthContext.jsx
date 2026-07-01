import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
  const [user, setUser] = useState(null);

  // 1. Thêm state loading, mặc định ban đầu là true (đang tải)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // 2. Sau khi đọc xong dữ liệu user, chuyển loading thành false
    setLoading(false);
  }, []);

  const login = (loginData) => {

    const storage = loginData.rememberMe
      ? localStorage
      : sessionStorage;

    storage.setItem("token", loginData.token);
    storage.setItem("user", JSON.stringify(loginData.user));

    setToken(loginData.token);
    setUser(loginData.user);
  };


  const logout = () => {

    localStorage.clear();

    sessionStorage.clear();

    setToken(null);

    setUser(null);

  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}