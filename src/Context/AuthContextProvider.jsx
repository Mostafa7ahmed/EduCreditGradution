import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const authContext = createContext();

export default function AuthContextProvider({ children }) {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accesstoken")
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshtoken")
  );
  const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        console.log("Decoded Token:", decoded); // اطبعي الـ token هنا للتأكد من الـ role
        setDecodedToken(decoded);
      } catch (error) {
        console.error("Invalid Token", error);
        setDecodedToken(null);
      }
    }
  }, [accessToken]);

  return (
    <authContext.Provider
      value={{
        accessToken,
        setAccessToken,
        refreshToken,
        setRefreshToken,
        decodedToken,
      }}
    >
      {children}
    </authContext.Provider>
  );
}
