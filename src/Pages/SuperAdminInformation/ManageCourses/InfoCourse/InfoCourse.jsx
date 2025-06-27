import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../../../PersonalInformation/PersonalInformation.module.css";
import axios from "axios";
import { baseUrl } from "../../../../Env/Env";

export default function InfoCourse() {
  const { courseId } = useParams(); // التقاط الـ id من الرابط
  const [courseData, setCourseData] = useState({
    name: "",
    creditHours: "",
    duration: "",
    minimumDegree: "",
    previousCourse: "",
    department: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const token = localStorage.getItem("accesstoken");
        if (!token) {
          throw new Error("No token found. Please log in again.");
        }

        // جلب بيانات الدورة باستخدام الـ id
        const response = await axios.get(`${baseUrl}Course/${courseId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Fetched Course Data:", response.data.result); // تحقق من البيانات هنا

        // تحديث البيانات
        setCourseData({
          name: response.data.result.name || "Not Available",
          creditHours: response.data.result.creditHours || "Not Available",
          duration: response.data.result.duration || "Not Available",
          minimumDegree: response.data.result.minimumDegree || "Not Available",
          previousCourseName:
            response.data.result.previousCourseName || "Not Available",
          department: response.data.result.departmentName || "Not Available",
        });
      } catch (error) {
        // معالجة الأخطاء
        if (error.response) {
          setError(
            `Error ${error.response.status}: ${
              error.response.data.message || "Failed to fetch course data"
            }`
          );
        } else if (error.request) {
          setError("Network error: Could not reach the server.");
        } else {
          setError(error.message);
        }
        console.error("Error fetching course data:", error);
      }
    };

    fetchCourseData();
  }, [courseId]); // إضافة courseId إلى الـ dependencies

  return (
    <div className={styles.personalInfoContainer}>
      <h1 className={styles.welcomeTitle}>{courseData.name}</h1>

      <div className={styles.line}></div>

      <div className={styles.row}>
        <span className={styles.Lable}>Credit Hours</span>
        <span className={styles.data}>{courseData.creditHours}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.Lable}>Minimum Degree</span>
        <span className={styles.data}>{courseData.minimumDegree}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Duration</span>
        <span className={styles.data}>{courseData.duration}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Previous Course</span>
        <span className={styles.data}>{courseData.previousCourseName}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Department</span>
        <span className={styles.data}>{courseData.department}</span>
      </div>
    </div>
  );
}
