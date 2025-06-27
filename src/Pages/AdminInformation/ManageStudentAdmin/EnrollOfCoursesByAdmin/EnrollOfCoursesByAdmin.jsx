import React, { useContext, useEffect, useState } from "react";
import DataOfStudent from "../../../StudentInformation/EnrollOfCourses/EnrollOfCourses.module.css";
import Table from "../../../../Shared/Css/TableDesignCenter.module.css";
import axios from "axios";
import { authContext } from "../../../../Context/AuthContextProvider";
import { baseUrl } from "../../../../Env/Env";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";

export default function EnrollOfCoursesByAdmin() {
  const { studentId } = useParams(); // Get studentId from URL params
  const { accessToken } = useContext(authContext);
  const [studentData, setStudentData] = useState(null); // State for student data
  const [availableCourses, setAvailableCourses] = useState([]); // State for available courses
  const [enrolledCourses, setEnrolledCourses] = useState([]); // State for enrolled courses schedule
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set()); // Track enrolled course IDs
  const [studentNote, setStudentNote] = useState(""); // State for student note in the modal
  const [modalOpen, setModalOpen] = useState(false); // State to control modal visibility

  // Fetch enrollment data for the student
  const fetchEnrollmentData = async () => {
    if (!studentId) return; // Wait until studentId is available
    try {
      const response = await axios.get(
        `${baseUrl}Schedule/Get-EnrollmentOfCourseScheduale/${studentId}`,
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

      // Initialize enrolled courses based on isEnrolled
      const initialEnrolledCourses = resultData.schedules
        .filter((course) => course.isEnrolled)
        .map((course) => {
          const startHour = course.lectureStart.split(":")[0] + ":00";
          const endHour = course.lectureEnd.split(":")[0] + ":00";
          const timeSlots = [
            "09:00",
            "10:00",
            "11:00",
            "12:00",
            "01:00",
            "02:00",
            "03:00",
            "04:00",
            "05:00",
          ];
          const startIndex = timeSlots.indexOf(startHour);
          const endIndex = timeSlots.indexOf(endHour);
          const duration = endIndex - startIndex + 1;

          return {
            courseName: course.courseName,
            day: course.day,
            startTime: startHour,
            duration: duration,
            courseId: course.courseId,
          };
        });

      setEnrolledCourses(initialEnrolledCourses);
      setEnrolledCourseIds(
        new Set(initialEnrolledCourses.map((course) => course.courseName))
      );
    } catch (error) {
      console.error("Error fetching enrollment data:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage = error.response?.data?.message || error.message;
      Swal.fire({
        icon: "error",
        title: "error",
        text: `Failed to fetch enrollment data: ${errorMessage}`,
        confirmButtonText: "Ok!",
      });
    }
  };

  // Fetch data on mount or when studentId changes
  useEffect(() => {
    if (studentId) {
      fetchEnrollmentData();
    }
  }, [studentId]);

  // Function to handle enrolling a course when clicking the "+" button
  const handleEnrollCourse = (course) => {
    if (course.isEnrolled) return; // Prevent enrolling already enrolled course

    const startTime = course.lectureStart; // e.g., "09:00:00"
    const endTime = course.lectureEnd; // e.g., "11:00:00"

    // Convert lectureStart and lectureEnd to match timeSlots format
    const startHour = startTime.split(":")[0] + ":00"; // e.g., "09:00"
    const endHour = endTime.split(":")[0] + ":00"; // e.g., "11:00"

    // Calculate duration based on start and end time
    const timeSlots = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "01:00",
      "02:00",
      "03:00",
      "04:00",
      "05:00",
    ];
    const startIndex = timeSlots.indexOf(startHour);
    const endIndex = timeSlots.indexOf(endHour);
    const duration = endIndex - startIndex + 1; // e.g., 2 hours

    // Add the course to enrolledCourses
    const newEnrolledCourse = {
      courseName: course.courseName,
      day: course.day,
      startTime: startHour,
      duration: duration,
      courseId: course.courseId,
    };

    setEnrolledCourses((prev) => [...prev, newEnrolledCourse]);
    setEnrolledCourseIds((prev) => new Set(prev).add(course.courseName));
  };

  // Function to handle unenrolling a course when clicking the "x" button
  const handleUnenrollCourse = (course) => {
    setEnrolledCourses((prev) =>
      prev.filter((c) => c.courseName !== course.courseName)
    );
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

  // Helper function to render enrolled courses in the schedule table
  const renderEnrolledCourses = () => {
    const days = [
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ];
    const timeSlots = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "01:00",
      "02:00",
      "03:00",
      "04:00",
      "05:00",
    ];

    // Create a map to store the schedule
    const scheduleMap = days.reduce((acc, day) => {
      acc[day] = Array(timeSlots.length).fill("");
      return acc;
    }, {});

    // Populate the schedule map with enrolled courses
    enrolledCourses.forEach((course) => {
      const day = course.day;
      const startTime = course.startTime; // e.g., "09:00"
      const duration = course.duration; // e.g., 2 hours
      const startIndex = timeSlots.indexOf(startTime);

      if (startIndex !== -1 && day in scheduleMap) {
        for (let i = 0; i < duration; i++) {
          if (startIndex + i < timeSlots.length) {
            scheduleMap[day][startIndex + i] = course.courseName;
          }
        }
      }
    });

    return days.map((day) => (
      <tr key={day}>
        <td>{day}</td>
        {scheduleMap[day].map((slot, index) => {
          if (
            slot &&
            index ===
              timeSlots.indexOf(
                enrolledCourses.find(
                  (c) => c.day === day && c.courseName === slot
                )?.startTime
              )
          ) {
            const duration =
              enrolledCourses.find(
                (c) => c.day === day && c.courseName === slot
              )?.duration || 1;
            return (
              <td
                key={index}
                colSpan={duration}
                className={DataOfStudent.enrolledCourseCell}
              >
                {slot}
              </td>
            );
          } else if (!slot) {
            return <td key={index}></td>;
          }
          return null;
        })}
      </tr>
    ));
  };

  // Function to handle Save button in the modal
  const handleSave = async () => {
    if (!enrolledCourses.length) {
      Swal.fire({
        icon: "warning",
        title: "Warning!",
        text: "No courses enrolled to save.",
        confirmButtonText: "Ok!",
      });
      return;
    }

    try {
      // Prepare data for POST request
      const scheduleIds = enrolledCourses.map((course) => course.courseId);
      const dataToSend = {
        scheduleIds: scheduleIds,
        studentNotes: studentNote,
        studentId: studentId, // Use studentId from params
      };

      // Send POST request to the actual endpoint
      const response = await axios.post(
        "https://educredit.runasp.net/api/EnrollmentTable",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log("Save enrollment response:", response.data);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Enrollment saved successfully!",
        confirmButtonText: "Ok!",
      });
      setModalOpen(false); // Close the modal
      setStudentNote(""); // Reset the textarea
      await fetchEnrollmentData(); // Refresh data after saving
    } catch (error) {
      console.error("Error saving enrollment:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage = error.response?.data?.message || error.message;
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: `Failed to save enrollment: ${errorMessage}`,
        confirmButtonText: "Ok!",
      });
    }
  };

  // Function to handle Cancel button in the modal
  const handleCancel = () => {
    setModalOpen(false); // Close the modal
    setStudentNote(""); // Reset the textarea
  };

  return (
    <>
      <div className={DataOfStudent.studentInfoContainer}>
        <ul className={DataOfStudent.infoList}>
          <div className={DataOfStudent.infoContainer}>
            <div className={DataOfStudent.leftColumn}>
              <li>
                <span className={DataOfStudent.label}>Name:</span>{" "}
                <span className={DataOfStudent.data}>
                  {studentData ? studentData.fullName : "Loading..."}
                </span>
              </li>
              <li>
                <span className={DataOfStudent.label}>Department:</span>{" "}
                <span className={DataOfStudent.data}>
                  {studentData ? studentData.department : "Loading..."}
                </span>
              </li>
              <li>
                <span className={DataOfStudent.label}>Name of Guide:</span>{" "}
                <span className={DataOfStudent.data}>
                  {studentData ? studentData.guideName : "Loading..."}
                </span>
              </li>
              <li>
                <span className={DataOfStudent.label}>Level:</span>{" "}
                <span className={DataOfStudent.data}>
                  {studentData ? studentData.level : "Loading..."}
                </span>
              </li>
            </div>
            <div className={DataOfStudent.rightColumn}>
              <li>
                <span className={DataOfStudent.label}>Obtained hours:</span>{" "}
                <span className={DataOfStudent.data}>
                  {studentData ? studentData.obtainedHours : "Loading..."}
                </span>
              </li>
              <li>
                <span className={DataOfStudent.label}>Available hours:</span>{" "}
                <span className={DataOfStudent.data}>
                  {studentData ? studentData.availableHours : "Loading..."}
                </span>
              </li>
              <li>
                <span className={DataOfStudent.label}>GPA:</span>{" "}
                <span className={DataOfStudent.data}>
                  {studentData ? studentData.gpa : "Loading..."}
                </span>
              </li>
            </div>
          </div>
        </ul>
        <div className={`${DataOfStudent.line}`}></div>
        <p className={DataOfStudent.coursetitle}>Available Courses Schedule</p>
        <div className={DataOfStudent.scrollableCourseWrapper}>
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
        <p className={DataOfStudent.EnrollTitle}>Enrolled Course</p>

        <div className={DataOfStudent.scrollableTableWrapper}>
          <table className={`${Table.table} ${Table.enrollTable}`}>
            <thead>
              <tr>
                <th>Day/Time</th>
                <th>09:00</th>
                <th>10:00</th>
                <th>11:00</th>
                <th>12:00</th>
                <th>01:00</th>
                <th>02:00</th>
                <th>03:00</th>
                <th>04:00</th>
                <th>05:00</th>
              </tr>
            </thead>
            <tbody>
              {enrolledCourses.length > 0 ? (
                renderEnrolledCourses()
              ) : (
                <tr>
                  <td colSpan="10" className={`${DataOfStudent.enrollCourse}`}>
                    No enrolled courses
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={DataOfStudent.button}>
          <button
            type="button"
            data-modal-target="crud-modal"
            data-modal-toggle="crud-modal"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => setModalOpen(true)}
          >
            <i className="fa-solid fa-arrow-right"></i>
          </button>
          <span className={DataOfStudent.saveText}>Save Enrollment Table</span>
        </div>
      </div>

      {/* Main Modal */}
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
                Add Student Note
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setModalOpen(false)}
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
                    htmlFor="studentNote"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Student Note
                  </label>
                  <textarea
                    id="studentNote"
                    rows="4"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Write here"
                    value={studentNote}
                    onChange={(e) => setStudentNote(e.target.value)}
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
                  onClick={handleSave}
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
