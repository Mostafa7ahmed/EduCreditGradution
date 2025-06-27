import React from "react";
import styles from "./ButtonAddSuperAdmin.module.css";
import { Link } from "react-router-dom";
export default function ButtonAddSuperAdmin({ text, bgColor, routeLink }) {
  return (
    <div>
      <Link to={routeLink}>
        <button
          className={styles.addButton}
          style={{ backgroundColor: bgColor }}
        >
          {text} <i className="fas fa-plus rounded-3xl"></i>
        </button>
      </Link>
    </div>
  );
}
