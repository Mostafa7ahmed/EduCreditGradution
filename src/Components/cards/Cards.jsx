import React, { useContext, useEffect, useState } from "react";
import styles from "./Cards.module.css";
import axios from "axios";
import { authContext } from "../../Context/AuthContextProvider";

export default function Cards() {
  const [data, setData] = useState({
    departments: 0,
    students: 0,
    teachers: 0,
    successRate: 0,
  });

  const { accessToken } = useContext(authContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depRes, studRes, teachRes, succRes] = await Promise.all([
          axios.get(`https://educredit.runasp.net/api/Admin/statistics/3`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          axios.get(`https://educredit.runasp.net/api/Admin/statistics/1`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          axios.get(`https://educredit.runasp.net/api/Admin/statistics/2`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          axios.get(`https://educredit.runasp.net/api/Admin/statistics/4`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);
        console.log(depRes);

        setData({
          departments: depRes.data.total,
          students: studRes.data.total,
          teachers: teachRes.data.total,
          successRate: succRes.data.total,
        });
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.cardsContainer}>
      <div className={`${styles.card} ${styles.cardBg1}`}>
        <div className={styles.cardLeft}>
          <div className={`${styles.iconCircle} ${styles.circle1}`}>
            <i className="fas fa-building"></i>
          </div>
        </div>
        <div className={styles.cardRight}>
          <div className={styles.description}>Departments</div>
          <div className={styles.number}>{data.departments}</div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.cardBg2}`}>
        <div className={styles.cardLeft}>
          <div className={`${styles.iconCircle} ${styles.circle2}`}>
            <i className="fa-solid fa-user-graduate fa-flip-horizontal"></i>
          </div>
        </div>
        <div className={styles.cardRight}>
          <div className={styles.description}>Students</div>
          <div className={styles.number}>{data.students}</div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.cardBg3}`}>
        <div className={styles.cardLeft}>
          <div className={`${styles.iconCircle} ${styles.circle3}`}>
            <i className="fa-solid fa-user-tie"></i>
          </div>
        </div>
        <div className={styles.cardRight}>
          <div className={styles.description}>Teachers</div>
          <div className={styles.number}>{data.teachers}</div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.cardBg4}`}>
        <div className={styles.cardLeft}>
          <div className={`${styles.iconCircle} ${styles.circle4}`}>
            <i className="fa-solid fa-chart-simple"></i>
          </div>
        </div>
        <div className={styles.cardRight}>
          <div className={styles.description}>Success Rate</div>
          <div className={styles.number}>{data.successRate}%</div>
        </div>
      </div>
    </div>
  );
}
