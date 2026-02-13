// import React, { createContext, useState, useEffect, useContext } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);

//   useEffect(() => {
//     const savedUser = localStorage.getItem("user");
//     const savedToken = localStorage.getItem("token");
//     if (savedUser && savedToken) {
//       try {
//         setUser(JSON.parse(savedUser));
//         setToken(savedToken.trim());
//       } catch (err) {
//         console.error("Failed to parse user from localStorage", err);
//         localStorage.removeItem("user");
//         localStorage.removeItem("token");
//       }
//     }
//   }, []);

//   const login = (userData, tokenData) => {
//     if (!userData || !tokenData) return;
//     const cleanToken = tokenData.trim();
//     setUser(userData);
//     setToken(cleanToken);
//     localStorage.setItem("user", JSON.stringify(userData));
//     localStorage.setItem("token", cleanToken);
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // NEW

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken.trim());
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false); // ✅ done checking
  }, []);

  const login = (userData, tokenData) => {
    if (!userData || !tokenData) return;
    const cleanToken = tokenData.trim();
    setUser(userData);
    setToken(cleanToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", cleanToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
