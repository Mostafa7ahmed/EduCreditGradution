import React from "react";
import styles from "./ButtonAddDashboard.module.css";
import { Link } from "react-router-dom";

export default function ButtonAddDashboard() {
  return (
    <>
      <div className={styles.ButtonContainer}>
        <Link
          className={`${styles.Button} ${styles.ButtonBg1}`}
          to="/SuperAdminRole/ManageDepartments/AddDepartment"
        >
          <div className={styles.description}>Add New Department</div>
        </Link>
        <Link
          className={`${styles.Button} ${styles.ButtonBg2}`}
          to="/SuperAdminRole/AddStudent"
        >
          <div className={styles.description}>Add New Student</div>
        </Link>
        <Link
          className={`${styles.Button} ${styles.ButtonBg3}`}
          to="/SuperAdminRole/AddTeacher"
        >
          <div className={styles.description}>Add New Teacher</div>
        </Link>
        <Link
          className={`${styles.Button} ${styles.ButtonBg4}`}
          to="/SuperAdminRole/AddAdmin"
        >
          <div className={styles.description}>Add New Admin</div>
        </Link>
      </div>
    </>
  );
}
