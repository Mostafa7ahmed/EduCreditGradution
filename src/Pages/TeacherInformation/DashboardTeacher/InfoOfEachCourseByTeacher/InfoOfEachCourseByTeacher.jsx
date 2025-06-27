import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "../../../SuperAdminInformation/ManageStudents/InfoStudent/InfoStudent.module.css";
import { baseUrl } from "../../../../Env/Env";
import Swal from "sweetalert2"; // Import SweetAlert2

export default function InfoOfEachCourseByTeacher() {
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
    minimumDegree: 0, // Added minimumDegree
    creditHours: 0, // Added creditHours
    previousCourse: "", // Added previousCourse
  });
  const [semesterId, setSemesterId] = useState(null); // State for semesterId

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
      console.log("Semester ID:", response.data.result.id);
      setSemesterId(response.data.result.id);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: `Failed to fetch semester data: ${errorMessage}`,
        confirmButtonText: "Ok!",
      });
    }
  };

  // Fetch course data using courseId and semesterId
  const fetchCourseData = async () => {
    if (!semesterId) return; // Wait until semesterId is available

    try {
      const token = localStorage.getItem("accesstoken");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      // Use both courseId and semesterId as path parameters
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
        minimumDegree: response.data.result.minimumDegree ?? "Not Available", // Added minimumDegree
        creditHours: response.data.result.creditHours ?? "Not Available", // Added creditHours
        previousCourse: response.data.result.previousCourse || "Not Available", // Added previousCourse
      });
    } catch (error) {
      let errorMessage;
      if (error.response) {
        errorMessage = `Error ${error.response.status}: ${
          error.response.data.message || "Failed to fetch course data"
        }`;
      } else if (error.request) {
        errorMessage = "Network error: Could not reach the server.";
      } else {
        errorMessage = error.message;
      }
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: errorMessage,
        confirmButtonText: "Ok!",
      });
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
      <h1 className={styles.welcomeTitle}>
        {courseData.courseName || "Loading..."}
      </h1>

      <div className={styles.row}>
        <span className={styles.Lable}>Teachers</span>
        <span className={styles.data}>
          {Array.isArray(courseData.teachersName)
            ? courseData.teachersName.join(", ") || "Loading..."
            : courseData.teachersName || "Loading..."}
        </span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Day</span>
        <span className={styles.data}>
          {courseData.lectureDate || "Loading..."}
        </span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Lecture Start</span>
        <span className={styles.data}>
          {courseData.lectureStart || "Loading..."}
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.Lable}>Lecture End</span>
        <span className={styles.data}>
          {courseData.lectureEnd || "Loading..."}
        </span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Lecture Location</span>
        <span className={styles.data}>
          {courseData.lectureLocation || "Loading..."}
        </span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Exam Start</span>
        <span className={styles.data}>
          {courseData.examStart || "Loading..."}
        </span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Exam End</span>
        <span className={styles.data}>
          {courseData.examEnd || "Loading..."}
        </span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Exam Location</span>
        <span className={styles.data}>
          {courseData.examLocation || "Loading..."}
        </span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Credit Hours</span>
        <span className={styles.data}>
          {courseData.creditHours || "Loading..."}
        </span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Minimum Degree</span>
        <span className={styles.data}>
          {courseData.minimumDegree || "Loading..."}
        </span>
      </div>

      <div className={styles.row}>
        <span className={styles.Lable}>Previous Course</span>
        <span className={styles.data}>
          {courseData.previousCourse || "Loading..."}
        </span>
      </div>
    </div>
  );
}
