import React, { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import styles from "../../../SuperAdminInformation/ManageStudents/InfoStudent/InfoStudent.module.css"; // Adjusted to use InfoStudentAdmin.module.css
import { baseUrl } from "../../../../Env/Env";
import { authContext } from "../../../../Context/AuthContextProvider";

export default function InfoStudentAdmin() {
  const { accessToken } = useContext(authContext);
  const { studentId } = useParams(); // جلب studentId من الـ URL
  const [userData, setUserData] = useState({
    fullName: "",
    phoneNumber: "",
    gender: "",
    email: "",
    birthDate: "",
    address: "",
    nationalId: "",
    departmentFullName: "",
    guideName: "",
    creditHours: "",
    GPA: "",
    level: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) return; // التأكد من وجود الـ studentId

      try {
        const response = await axios.get(`${baseUrl}Student/${studentId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setUserData(response.data.result); // تحديث بيانات الطالب
      } catch (err) {
        setError("Failed to fetch student data.");
        console.error("Error fetching student data:", err.message);
      }
    };

    fetchStudentData();
  }, [studentId, accessToken]); // استخدام studentId الذي يتم جلبه من URL

  return (
    <div className={styles.personalInfoContainer}>
      <h1 className={styles.welcomeTitle}>{userData.fullName || "N/A"}</h1>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.row}>
        <span className={styles.Lable}>Phone Number</span>
        <span className={styles.data}>{userData.phoneNumber || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Gender</span>
        <span className={styles.data}>{userData.gender || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Email</span>
        <span className={styles.data}>{userData.email || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Birth Date</span>
        <span className={styles.data}>{userData.birthDate || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Address</span>
        <span className={styles.data}>{userData.address || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>National ID</span>
        <span className={styles.data}>{userData.nationalId || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Department</span>
        <span className={styles.data}>{userData.departmentName || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Guide Name</span>
        <span className={styles.data}>{userData.academicGuide || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Credit Hours</span>
        <span className={styles.data}>{userData.creditHours || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>GPA</span>
        <span className={styles.data}>{userData.gpa || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Level</span>
        <span className={styles.data}>{userData.level || "N/A"}</span>
      </div>

      <div className={styles.buttonContainer}>
        <Link
          to={`/AdminRole/ManageStudentAdmin/EnrollOfCoursesByAdmin/${studentId}`}
        >
          <button className={styles.button}>Enroll of Courses</button>
        </Link>
        <Link
          to={`/AdminRole/ManageStudentAdmin/StudyScheduleAdmin/${studentId}`}
        >
          <button className={styles.button}>Study Schedule</button>
        </Link>
        <Link
          to={`/AdminRole/ManageStudentAdmin/CoursesResultAdmin/${studentId}`}
        >
          <button className={styles.button}>Course Results</button>
        </Link>
      </div>
    </div>
  );
}
