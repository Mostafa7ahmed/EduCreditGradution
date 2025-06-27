import React, { useContext, useEffect, useState } from "react";
import DataOfStudent from "../../../../StudentInformation/EnrollOfCourses/EnrollOfCourses.module.css";
import Table from "../../../../../Shared/Css/TableDesignCenter.module.css";
import scrollableCourseWrapper from "./AvailableCourses.module.css";
import axios from "axios";
import { authContext } from "../../../../../Context/AuthContextProvider";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";

export default function AvailableCourses() {
  const { studentId } = useParams(); // Get studentId from URL params
  const { accessToken } = useContext(authContext);
  const [studentData, setStudentData] = useState(null); // State for student data
  const [availableCourses, setAvailableCourses] = useState([]); // State for available courses
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set()); // Track enrolled course IDs

  // Fetch enrollment data for the student
  const fetchEnrollmentData = async () => {
    if (!studentId) return; // Wait until studentId is available
    try {
      const response = await axios.get(
        `https://educredit.runasp.net/api/Schedule/Get-EnrollmentOfCourseScheduale/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log("Enrollment data response:", response.data);
      const resultData = response.data.result[0]; // Take the first item from the result array

      // Set student data
      setStudentData({
        fullName: resultData.fullName || "N/A",
        obtainedHours: resultData.obtainedhours || "N/A",
        availableHours: resultData.availableHours || "N/A",
        department: resultData.departmentName || "N/A",
        level: resultData.level || "N/A",
        gpa: resultData.gpa || "N/A",
        guideName: resultData.academicGuide || "N/A",
      });

      // Set available courses from schedules
      setAvailableCourses(resultData.schedules || []);

      // Initialize enrolled course IDs based on isEnrolled
      const initialEnrolledCourses = resultData.schedules
        .filter((course) => course.isEnrolled)
        .map((course) => course.courseName);
      setEnrolledCourseIds(new Set(initialEnrolledCourses));
    } catch (error) {
      console.error("Error fetching enrollment data:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage = error.response?.data?.message || error.message;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to fetch enrollment data: ${errorMessage}`,
        confirmButtonText: "Ok!",
      });
    }
  };

  // Function to handle enrolling a course when clicking the "+" button
  const handleEnrollCourse = (course) => {
    if (course.isEnrolled) return; // Prevent enrolling already enrolled course

    // Update the enrolled course IDs
    setEnrolledCourseIds((prev) => new Set(prev).add(course.courseName));

    // Update the isEnrolled status in availableCourses state
    setAvailableCourses((prev) =>
      prev.map((c) =>
        c.courseName === course.courseName ? { ...c, isEnrolled: true } : c
      )
    );
  };

  // Function to handle unenrolling a course when clicking the "x" button
  const handleUnenrollCourse = (course) => {
    // Remove the course from enrolledCourseIds
    setEnrolledCourseIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(course.courseName);
      return newSet;
    });

    // Update the isEnrolled status in availableCourses state
    setAvailableCourses((prev) =>
      prev.map((c) =>
        c.courseName === course.courseName ? { ...c, isEnrolled: false } : c
      )
    );
  };

  // Fetch data on mount or when studentId changes
  useEffect(() => {
    if (studentId) {
      fetchEnrollmentData();
    }
  }, [studentId]);

  return (
    <div className={DataOfStudent.studentInfoContainer}>
      <ul className={DataOfStudent.infoList}>
        <div className={DataOfStudent.infoContainer}>
          <div className={DataOfStudent.leftColumn}>
            <li>
              <span className={DataOfStudent.label}>- Name:</span>{" "}
              <span className={DataOfStudent.data}>
                {studentData ? studentData.fullName : "Loading..."}
              </span>
            </li>
            <li>
              <span className={DataOfStudent.label}>- Department:</span>{" "}
              <span className={DataOfStudent.data}>
                {studentData ? studentData.department : "Loading..."}
              </span>
            </li>

            <li>
              <span className={DataOfStudent.label}>- Level:</span>{" "}
              <span className={DataOfStudent.data}>
                {studentData ? studentData.level : "Loading..."}
              </span>
            </li>
            <li>
              <span className={DataOfStudent.label}>- GPA:</span>{" "}
              <span className={DataOfStudent.data}>
                {studentData ? studentData.gpa : "Loading..."}
              </span>
            </li>
          </div>
        </div>
      </ul>
      <div className={`${DataOfStudent.line}`}></div>
      <p className={DataOfStudent.coursetitle}>Available Courses Schedule</p>
      <div className={scrollableCourseWrapper.scrollableCourseWrapper}>
        <table className={Table.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Course</th>
              <th>Duration</th>
              <th>Hours</th>
              <th>Teacher</th>
              <th>Day</th>
              <th>Start</th>
              <th>End</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {availableCourses.length > 0 ? (
              availableCourses.map((course, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{course.courseName || "N/A"}</td>
                  <td>{course.duration || "N/A"}</td>
                  <td>{course.hours || "N/A"}</td>
                  <td>{course.teachersName || "N/A"}</td>
                  <td>{course.day || "N/A"}</td>
                  <td>{course.lectureStart || "N/A"}</td>
                  <td>{course.lectureEnd || "N/A"}</td>
                  <td className={DataOfStudent.actionCell}>
                    <button
                      className={
                        enrolledCourseIds.has(course.courseName)
                          ? DataOfStudent.xmark
                          : DataOfStudent.Plus
                      }
                      onClick={() =>
                        enrolledCourseIds.has(course.courseName)
                          ? handleUnenrollCourse(course)
                          : handleEnrollCourse(course)
                      }
                    >
                      <i
                        className={
                          enrolledCourseIds.has(course.courseName)
                            ? "fa-solid fa-xmark"
                            : "fa-solid fa-plus"
                        }
                      ></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No available courses</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
