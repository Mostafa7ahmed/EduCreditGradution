import React, { useState, useContext } from "react";
import styles from "./ChangePassword.module.css";
import axios from "axios";
import { baseUrl } from "../../Env/Env";
import { authContext } from "../../Context/AuthContextProvider";
import { logo } from "../../assets/Icons/Logo";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { accessToken } = useContext(authContext);
  const { decodedToken } = useContext(authContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      await axios.post(
        `${baseUrl}Account/change-password`,
        {
          user_Id: decodedToken?.userId,
          currentPassword: currentPassword,
          newPassword: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      setMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.changePasswordContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.Logo}>{logo}</div>
        <h2 className={styles.title}>Change Password</h2>
        <p className={styles.subtitle}>
          Must be at least 8 characters or numbers.
        </p>
        <div className={styles.formGroup}>
          {" "}
          <label className={styles.label}>Current Password</label>
          <div className={styles.inputWrapper}>
            <i className="fa-solid fa-lock"></i>
            <input
              type="password"
              className={styles.input}
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
        </div>{" "}
        <div className={styles.formGroup}>
          <label className={styles.label}>New Password</label>
          <div className={styles.inputWrapper}>
            <i className="fa-solid fa-lock"></i>
            <input
              type="password"
              className={styles.input}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Changing..." : "Save New Password"}
        </button>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => {
            const role = decodedToken?.role;
            switch (role) {
              case "SuperAdminRole":
                window.location.href = "/SuperAdminRole";
                break;
              case "AdminRole":
                window.location.href = "/AdminRole";
                break;
              case "StudentRole":
                window.location.href = "/StudentRole";
                break;
              case "TeacherRole":
                window.location.href = "/TeacherRole";
                break;
              default:
                window.location.href = "/Login";
            }
          }}
        >
          Back To Dashboard
        </button>
        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
}
