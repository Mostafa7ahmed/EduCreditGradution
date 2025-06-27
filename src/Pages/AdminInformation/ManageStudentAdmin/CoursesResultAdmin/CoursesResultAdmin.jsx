import React, { useContext, useEffect, useState } from "react";
import DataOfStudent from "../../../../Shared/Css/DataOfStudent.module.css";
import Information from "../../../../src/../Shared/Css/InfoAndInformation.module.css";
import styles from "../../../StudentInformation/CourseResults/CourseResults.module.css";
import Table from "../../../../Shared/Css/TableDesignCenter.module.css";
import axios from "axios";
import { authContext } from "../../../../Context/AuthContextProvider";
import { baseUrl } from "../../../../Env/Env";
import { useParams } from "react-router-dom";

export default function CoursesResultAdmin() {
  const { studentId } = useParams(); // Get studentId from URL params
  const { accessToken } = useContext(authContext);
  const [studentData, setStudentData] = useState(null); // State for student data from Enrollment/Results
  const [allSemesters, setAllSemesters] = useState([]); // State for all semesters
  const [selectedSemesterName, setSelectedSemesterName] = useState(""); // State for selected semester name
  const [allCourses, setAllCourses] = useState([]); // State for course data of the selected semester
  const AppreciationEnum = {
    0: "A+",
    1: "A",
    2: "B+",
    3: "B",
    4: "C+",
    5: "C",
    6: "D",
    7: "F",
  };

  // Fetch course data and student data for the student
  const fetchCourseResults = async () => {
    if (!studentId) return; // Wait until studentId is available
    try {
      const response = await axios.get(
        `${baseUrl}Enrollment/Results/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log("Course results response:", response.data);
      const resultData = response.data.result;
      setStudentData({
        fullName: resultData.studentName,
        obtainedhours: resultData.obtainedHours,
        gpa: resultData.gpa,
        totalPercentage: resultData.totalPercentage,
      }); // Set student data from Enrollment/Results

      const semestersData = resultData.semesters || []; // Extract all semesters
      setAllSemesters(semestersData); // Store all semesters

      // Set the first semester as the default selection
      if (semestersData.length > 0) {
        setSelectedSemesterName(semestersData[0].semesterName);
        setAllCourses(semestersData[0].courses || []);
      }
    } catch (error) {
      console.error("Error fetching course results:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Failed to fetch course results: ${errorMessage}`);
    }
  };

  // Handle semester selection
  const handleSemesterChange = (e) => {
    const selectedName = e.target.value;
    setSelectedSemesterName(selectedName);
    const selectedSemester = allSemesters.find(
      (semester) => semester.semesterName === selectedName
    );
    setAllCourses(selectedSemester ? selectedSemester.courses || [] : []);
  };

  // Fetch data on mount or when studentId changes
  useEffect(() => {
    if (studentId) {
      fetchCourseResults();
    }
  }, [studentId]);

  // Find the selected semester to get its data for the footer
  const selectedSemester =
    allSemesters.find(
      (semester) => semester.semesterName === selectedSemesterName
    ) || {};

  return (
    <div className={DataOfStudent.studentInfoContainer}>
      <ul className={DataOfStudent.infoList}>
        <li>
          <span className={DataOfStudent.label}>Name:</span>{" "}
          <span className={DataOfStudent.data}>
            {studentData ? studentData.fullName : "Loading..."}
          </span>
        </li>
        <li>
          <span className={DataOfStudent.label}>Obtained hours:</span>{" "}
          <span className={DataOfStudent.data}>
            {studentData ? studentData.obtainedhours : "Loading..."}
          </span>
        </li>
        <li>
          <span className={DataOfStudent.label}>GPA:</span>{" "}
          <span className={DataOfStudent.data}>
            {studentData ? studentData.gpa || "N/A" : "Loading..."}
          </span>
        </li>
        <li>
          <span className={DataOfStudent.label}>Percentage:</span>{" "}
          <span className={DataOfStudent.data}>
            {studentData ? studentData.totalPercentage + " %" : "Loading..."}
          </span>
        </li>
      </ul>
      <div className={`${Information.line}`}></div>

      {/* Semester Selection Dropdown */}
      <div style={{ marginBottom: "30px", marginTop: "-15px" }}>
        <label htmlFor="semesterSelect" style={{ marginRight: "10px" }}>
          Select Semester:
        </label>
        <select
          id="semesterSelect"
          value={selectedSemesterName}
          onChange={handleSemesterChange}
          style={{
            padding: "5px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          {allSemesters.length === 0 ? (
            <option value="">No semesters available</option>
          ) : (
            allSemesters.map((semester) => (
              <option key={semester.semesterName} value={semester.semesterName}>
                {semester.semesterName}
              </option>
            ))
          )}
        </select>
      </div>

      <p className={styles.coursetitle}>
        Course Results for{" "}
        <span className="text-[#0077B6]">
          {selectedSemesterName || "Loading..."}
        </span>
      </p>
      <table className={Table.table}>
        <thead>
          <tr>
            <th>Course</th>
            <th>Hours</th>
            <th>Degree</th>
            <th>Percentage</th>
            <th>Appreciation</th>
          </tr>
        </thead>
        <tbody>
          {allCourses.length > 0 ? (
            allCourses.map((course, index) => (
              <tr key={index}>
                <td>{course.courseName || "N/A"}</td>{" "}
                {/* Placeholder since courseName is not in response */}
                <td>{course.creditHours}</td>{" "}
                {/* Hours not available in response */}
                <td>{course.grade !== undefined ? course.grade : "N/A"}</td>
                <td>
                  {course.percentage !== null ? course.percentage : "null"}
                </td>
                <td>
                  {course.appreciation !== null
                    ? AppreciationEnum[course.appreciation] || "N/A"
                    : "null"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No course results available</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Footer Info */}
      <div className={styles.footerInfo}>
        <div className={styles.footerItem}>
          Credit Hours:{" "}
          <span className="text-[#00000099] font-medium">
            {selectedSemester.creditHours || "N/A"}
          </span>
        </div>
        <div className={styles.footerItem}>
          Credit Hours Obtained:{" "}
          <span className="text-[#00000099]  font-medium">
            {selectedSemester.obtainedHours || "N/A"}
          </span>
        </div>
        <div className={styles.footerItem}>
          Percentage:{" "}
          <span className="text-[#00000099] font-medium">
            {" "}
            {selectedSemester.percentage
              ? selectedSemester.percentage + "%"
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}
