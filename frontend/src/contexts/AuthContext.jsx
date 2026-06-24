import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  
  // 1. Thêm state loading, mặc định ban đầu là true (đang tải)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // 2. Sau khi đọc xong dữ liệu user, chuyển loading thành false
    setLoading(false);
  }, []);

  const login = (loginData) => {
    localStorage.setItem("token", loginData.token);
    localStorage.setItem("user", JSON.stringify(loginData.user));

    setToken(loginData.token);
    setUser(loginData.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

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