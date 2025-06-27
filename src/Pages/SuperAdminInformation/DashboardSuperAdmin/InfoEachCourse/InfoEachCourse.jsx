import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../../ManageStudents/InfoStudent/InfoStudent.module.css";
import axios from "axios";
import { baseUrl } from "../../../../Env/Env";

export default function InfoEachCourse() {
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState({
    courseName: "",
    teachersName: [],
    lectureDate: "",
    lectureStart: "",
    lectureEnd: "",
    lectureLocation: "",
    examStart: "",
    examEnd: "",
    examLocation: "",
    minimumDegree: 0,
    creditHours: 0,
    previousCourse: "",
  });
  const [semesterId, setSemesterId] = useState(null); // State for semesterId
  const [error, setError] = useState(null);

  // Fetch the current semester ID
  const fetchCurrentSemester = async () => {
    try {
      const token = localStorage.getItem("accesstoken");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      const response = await axios.get(`${baseUrl}Semester/CurrentSemester`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSemesterId(response.data.result.id);
    } catch (error) {
      console.error("Error fetching semester:", error.message);
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
    }
  };

  const fetchCourseData = async () => {
    if (!semesterId) return;

    try {
      const token = localStorage.getItem("accesstoken");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      // Use both courseId and semesterId as query parameters
      const response = await axios.get(
        `${baseUrl}Schedule/${courseId}/${semesterId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Fetched Course Data:", response.data.result);

      setCourseData({
        courseName: response.data.result.courseName || "Not Available",
        teachersName: response.data.result.teachersName || "Not Available",
        lectureDate: response.data.result.day || "Not Available",
        lectureStart: response.data.result.lectureStart || "Not Available",
        lectureEnd: response.data.result.lectureEnd || "Not Available",
        lectureLocation:
          response.data.result.lectureLocation || "Not Available",
        examStart: response.data.result.examStart || "Not Available",
        examEnd: response.data.result.examEnd || "Not Available",
        examLocation: response.data.result.examLocation || "Not Available",
        minimumDegree: response.data.result.minimumDegree ?? "Not Available",
        creditHours: response.data.result.creditHours ?? "Not Available",
        previousCourse: response.data.result.previousCourse || "Not Available",
      });
    } catch (error) {
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

  // Fetch semester first, then course data
  useEffect(() => {
    fetchCurrentSemester();
  }, []);

  // Fetch course data when semesterId or courseId changes
  useEffect(() => {
    fetchCourseData();
  }, [semesterId, courseId]);

  return (
    <div className={styles.personalInfoContainer}>
      <h1 className={styles.welcomeTitle}>{courseData.courseName || "N/A"}</h1>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.row}>
        <span className={styles.Lable}>Teachers</span>
        <span className={styles.data}>
          {Array.isArray(courseData.teachersName)
            ? courseData.teachersName.join(", ") || "N/A"
            : courseData.teachersName || "N/A"}
        </span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Day</span>
        <span className={styles.data}>{courseData.lectureDate || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Lecture Start</span>
        <span className={styles.data}>{courseData.lectureStart || "N/A"}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.Lable}>Lecture End</span>
        <span className={styles.data}>{courseData.lectureEnd || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Lecture Location</span>
        <span className={styles.data}>
          {courseData.lectureLocation || "N/A"}
        </span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Exam Start</span>
        <span className={styles.data}>{courseData.examStart || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Exam End</span>
        <span className={styles.data}>{courseData.examEnd || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Exam Location</span>
        <span className={styles.data}>{courseData.examLocation || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Credit Hours</span>
        <span className={styles.data}>{courseData.creditHours || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Minimum Degree</span>
        <span className={styles.data}>{courseData.minimumDegree || "N/A"}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Previous Course</span>
        <span className={styles.data}>
          {courseData.previousCourse || "N/A"}
        </span>
      </div>
    </div>
  );
}
