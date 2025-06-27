import React, { useContext, useEffect, useState } from "react";
import DataOfStudent from "../../../Shared/Css/DataOfStudent.module.css";
import Information from "../../../../src/Shared/Css/InfoAndInformation.module.css";
import styles from "./StudySchedule.module.css";
import Table from "../../../Shared/Css/TableDesignCenter.module.css";
import Pagination from "../../../Shared/Css/Pagination.module.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { authContext } from "../../../Context/AuthContextProvider";
import { baseUrl } from "../../../Env/Env";

export default function StudySchedule() {
  const [studentsList, setStudentsList] = useState([]); // State for list of students
  const { accessToken } = useContext(authContext);
  const [studentData, setStudentData] = useState(null); // State for detailed student data
  const [allCourses, setAllCourses] = useState([]); // State for study schedule data

  // Fetch the list of students
  const fetchData = async () => {
    try {
      const response = await axios.get(`${baseUrl}Student`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "text/plain",
        },
      });
      const students = response.data.result.data;
      console.log("Students list:", students);

      if (students && students.length > 0) {
        setStudentsList(students);
        fetchStudentId(students[0].id); // Fetch details for the first student
      } else {
        throw new Error("No students found in response");
      }
    } catch (error) {
      console.error("Error fetching students:", error.message);
      const errorMessage = error.response?.data?.message || error.message;
      alert(errorMessage);
    }
  };

  // Fetch detailed student data by ID
  const fetchStudentId = async (id) => {
    try {
      const response = await axios.get(`${baseUrl}Student/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "text/plain",
        },
      });
      const data = response.data.result;
      console.log("Student details:", data);
      setStudentData(data);
    } catch (error) {
      console.error("Error fetching student details:", error.message);
      const errorMessage = error.response?.data?.message || error.message;
      alert(errorMessage);
    }
  };

  // Fetch study schedule for the student
  const fetchStudySchedule = async () => {
    if (!studentData?.id) return; // Wait until studentData is available
    try {
      const response = await axios.get(
        `${baseUrl}Schedule/Study-Schedule/${studentData.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log("Study schedule response:", response.data);
      const scheduleData = response.data.result[0]?.schedules || []; // Extract the schedules array
      setAllCourses(scheduleData); // Update state with fetched schedule data
    } catch (error) {
      console.error("Error fetching study schedule:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Failed to fetch study schedule: ${errorMessage}`);
    }
  };

  // Fetch students on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchData();
    };
    fetchInitialData();
  }, []);

  // Fetch study schedule when studentData changes
  useEffect(() => {
    fetchStudySchedule();
  }, [studentData]);

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
          <span className={DataOfStudent.label}>Department:</span>{" "}
          <span className={DataOfStudent.data}>
            {studentData ? studentData.departmentName : "Loading..."}
          </span>
        </li>
        <li>
          <span className={DataOfStudent.label}>Level:</span>{" "}
          <span className={DataOfStudent.data}>
            {studentData ? studentData.level : "Loading..."}
          </span>
        </li>
        <li>
          <span className={DataOfStudent.label}>GPA:</span>{" "}
          <span className={DataOfStudent.data}>
            {studentData ? studentData.gpa || "N/A" : "Loading..."}
          </span>
        </li>
      </ul>
      <div className={`${Information.line}`}></div>
      <p className={styles.coursetitle}>
        Study Schedule for{" "}
        <span className="text-[#0077B6]">
          {allCourses.length > 0 ? allCourses[0].semesterName : "Loading..."}
        </span>
      </p>
      <table className={Table.table}>
        <thead>
          <tr>
            <th>Day</th>
            <th>Course</th>
            <th>Teachers</th>
            <th>Start</th>
            <th>End</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {allCourses.length > 0 ? (
            allCourses.map((schedule, index) => (
              <tr key={index}>
                {" "}
                {/* Use index as key since schedule.id might not be unique */}
                <td>{schedule.day || "N/A"}</td>
                <td>{schedule.courseName || "N/A"}</td>
                <td>{schedule.teachersName || "N/A"}</td>
                <td>{schedule.lectureStart?.slice(0, 5) || "N/A"}</td>
                <td>{schedule.lectureEnd?.slice(0, 5) || "N/A"}</td>
                <td>{schedule.lectureLocation || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No schedule available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
