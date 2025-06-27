import React, { useState } from "react";
import styles from "./ResetPassword.module.css";
import axios from "axios";
import { baseUrl } from "../../Env/Env";
import { logo } from "../../assets/Icons/Logo";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // Get the reset token and userId from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const userId = urlParams.get("userId");

      if (!token || !userId) {
        setError("Invalid reset password link");
        return;
      }

      await axios.post(
        `${baseUrl}Account/reset-password`,
        {
          userId: userId,
          token: token,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "text/plain",
          },
        }
      );
      setMessage("Password reset successfully!");
      setNewPassword("");
      setConfirmPassword("");
      // Redirect to login after successful reset
      setTimeout(() => {
        navigate("/Login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.resetPasswordContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.Logo}>{logo}</div>
        <h2 className={styles.title}>Set New Password</h2>
        <p className={styles.subtitle}>
          Must be at least 8 characters or numbers.
        </p>

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

        <div className={styles.formGroup}>
          <label className={styles.label}>Confirm Password</label>
          <div className={styles.inputWrapper}>
            <i className="fa-solid fa-lock"></i>
            <input
              type="password"
              className={styles.input}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/Login")}
        >
          Back To Login
        </button>
        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
}
