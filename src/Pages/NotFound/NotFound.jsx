import React from "react";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <h1 style={{ fontSize: 48, color: "#d32f2f" }}>404</h1>
      <h2 style={{ color: "#333" }}>Page Not Found</h2>
      <p style={{ color: "#666" }}>Sorry, the page you are looking for does not exist.</p>
      <a href="/" style={{ color: "#1976d2", marginTop: 20 }}>Go Home</a>
    </div>
  );
}
