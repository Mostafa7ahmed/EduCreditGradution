import React, { useContext, useEffect, useState } from "react";
import DataOfStudent from "../../../../Shared/Css/DataOfStudent.module.css";
import Information from "../../../../Shared/Css/InfoAndInformation.module.css";
import styles from "../../../StudentInformation/StudySchedule/StudySchedule.module.css";
import Table from "../../../../Shared/Css/TableDesignCenter.module.css";
import axios from "axios";
import { authContext } from "../../../../Context/AuthContextProvider";
import { baseUrl } from "../../../../Env/Env";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import ButtonStyles from "./StudyScheduleTeacher.module.css"; // Import the new CSS module

export default function StudyScheduleTeacher() {
  const { studentId } = useParams(); // Get studentId from URL params
  const { accessToken } = useContext(authContext);
  const [studentData, setStudentData] = useState(null); // State for detailed student data
  const [allCourses, setAllCourses] = useState([]); // State for study schedule data
  const [enrollmentTableId, setEnrollmentTableId] = useState(null); // State for enrollmentTableId
  const [modalOpen, setModalOpen] = useState(false); // State for modal visibility
  const [guideNotes, setGuideNotes] = useState(""); // State for guide notes

  // Fetch study schedule and student data for the student
  const fetchStudySchedule = async () => {
    if (!studentId) return; // Wait until studentId is available
    try {
      const response = await axios.get(
        `${baseUrl}Schedule/Study-Schedule/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      const result = response.data.result[0]; // Get the first result object
      const scheduleData = result?.schedules || []; // Extract the schedules array
      setAllCourses(scheduleData); // Update state with fetched schedule data
      setStudentData(result); // Extract student data from the response
      setEnrollmentTableId(result.enrollmentTableId); // Store enrollmentTableId
    } catch (error) {
      console.error("Error fetching study schedule:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage = error.response?.data?.message || error.message;
      // Display error using SweetAlert2
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to fetch study schedule: ${errorMessage}`,
        confirmButtonText: "OK",
      });
    }
  };

  // Handle Confirm action with PATCH request
  const handleConfirm = async () => {
    if (!enrollmentTableId) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Enrollment ID is not available.",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await axios.patch(
        `https://educredit.runasp.net/api/EnrollmentTable?EnrollmentTableId=${enrollmentTableId}`,
        {
          status: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `${response.data.message}`,
        confirmButtonText: "OK",
      });
      console.log("Confirm response:", response.data.message);
    } catch (error) {
      console.error("Error confirming study schedule:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage = error.response?.data?.message || error.message;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to confirm study schedule: ${errorMessage}`,
        confirmButtonText: "OK",
      });
    }
  };

  // Handle Save Reject action with PATCH request
  const handleSaveReject = async () => {
    if (!enrollmentTableId || !guideNotes.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Guide notes are required.",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await axios.patch(
        `https://educredit.runasp.net/api/EnrollmentTable?EnrollmentTableId=${enrollmentTableId}`,
        {
          guideNotes: guideNotes,
          status: 2,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `${response.data.message}`,
        confirmButtonText: "OK",
      });
      console.log("Reject response:", response.data.message);
      setModalOpen(false); // Close modal on success
      setGuideNotes(""); // Reset guide notes
    } catch (error) {
      console.error("Error rejecting study schedule:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage = error.response?.data?.message || error.message;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to reject study schedule: ${errorMessage}`,
        confirmButtonText: "OK",
      });
    }
  };

  // Handle Cancel button in the modal
  const handleCancel = () => {
    setModalOpen(false); // Close the modal
    setGuideNotes(""); // Reset guide notes
  };

  // Fetch data on mount or when studentId changes
  useEffect(() => {
    if (studentId) {
      fetchStudySchedule();
    }
  }, [studentId]);

  return (
    <>
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
        <div className={ButtonStyles.buttonContainer}>
          <button
            className={ButtonStyles.confirmButton}
            onClick={handleConfirm}
          >
            Confirm
          </button>
          <button
            className={ButtonStyles.rejectButton}
            onClick={() => setModalOpen(true)}
          >
            Reject
          </button>
          <button className={ButtonStyles.defaultButton}>
            <Link
              to={`/TeacherRole/ManageGuidance/StudyScheduleTeacher/CourseResultsByTeachers/${studentId}`}
            >
              Courses Results
            </Link>
          </button>
          <button className={ButtonStyles.defaultButton}>
            <Link
              to={`/TeacherRole/ManageGuidance/StudyScheduleTeacher/AvailableCourses/${studentId}`}
            >
              Available Courses
            </Link>
          </button>
        </div>
      </div>

      {/* Modal for Reject */}
      <div
        id="crud-modal"
        tabIndex="-1"
        aria-hidden="true"
        className={`${
          modalOpen ? "flex" : "hidden"
        } fixed inset-0 items-center justify-center bg-opacity-50 z-50 backdrop-blur-[3px]`}
      >
        <div className="relative p-4 w-full max-w-md max-h-full">
          {/* Modal content */}
          <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Guide Notes
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={handleCancel}
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            {/* Modal body */}
            <div className="p-4 md:p-5">
              <div className="grid gap-4 mb-4 grid-cols-2">
                <div className="col-span-2">
                  <label
                    htmlFor="guideNotes"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Guide Note
                  </label>
                  <textarea
                    id="guideNotes"
                    rows="4"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Write here"
                    value={guideNotes}
                    onChange={(e) => setGuideNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="text-black bg-white border border-gray-400 cursor-pointer focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="text-white inline-flex items-center bg-[#4CAAD1] cursor-pointer focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  onClick={handleSaveReject}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
