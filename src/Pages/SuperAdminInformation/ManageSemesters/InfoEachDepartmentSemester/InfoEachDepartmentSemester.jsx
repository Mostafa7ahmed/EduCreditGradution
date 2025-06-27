import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Search from "../../../../Shared/Css/SearchInput.module.css";
import styles from "./InfoEachDepartmentSemester.module.css";
import Table from "../../../../Shared/Css/TableDesign.module.css";
import Pagination from "../../../../Shared/Css/Pagination.module.css";
import { authContext } from "../../../../Context/AuthContextProvider";
import { baseUrl } from "../../../../Env/Env";

export default function InfoEachDepartmentInSemester() {
  const { accessToken } = useContext(authContext);
  const { departmentId, departmentName } = useParams();
  const [semesters, setSemesters] = useState([]); // Store all semesters
  const [semesterId, setSemesterId] = useState(""); // Selected semester ID
  const [semesterName, setSemesterName] = useState(""); // Selected semester name
  const [allCourses, setAllCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const pageSize = 5;

  // Fetch all semesters
  const fetchSemesters = async () => {
    try {
      const response = await axios.get(`${baseUrl}Semester`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const semestersData = response.data.result.data;
      if (!semestersData || semestersData.length === 0) {
        throw new Error("No semesters found.");
      }

      console.log("All Semesters:", semestersData);
      setSemesters(semestersData);

      // Optionally, set the first semester as the default selection
      if (semestersData.length > 0) {
        setSemesterId(semestersData[0].id);
        setSemesterName(semestersData[0].name);
      }

      setError(null);
    } catch (error) {
      console.error("Error fetching semesters:", error.message);
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
    }
  };

  // Fetch courses for the department and selected semester
  const fetchCourses = async () => {
    if (!semesterId) return;
    try {
      console.log(
        "Fetching courses with semesterId:",
        semesterId,
        "and departmentId:",
        departmentId
      );
      const response = await axios.get(`${baseUrl}Course`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          departmentId: departmentId,
          semesterId: semesterId,
        },
      });
      console.log("Courses Response:", response.data);
      setAllCourses(response.data.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching courses:", error.message);
      setError(error.response?.data?.message || error.message);
    }
  };

  // Handle semester selection
  const handleSemesterChange = (e) => {
    const selectedId = e.target.value;
    const selectedSemester = semesters.find(
      (semester) => semester.id === selectedId
    );
    setSemesterId(selectedId);
    setSemesterName(selectedSemester ? selectedSemester.name : "");
    setCurrentPage(1);
  };

  // First useEffect: Fetch semesters
  useEffect(() => {
    if (departmentId) {
      fetchSemesters();
    } else {
      setError("Department ID is missing.");
    }
  }, [departmentId]);

  // Second useEffect: Fetch courses when semesterId changes
  useEffect(() => {
    if (semesterId) {
      fetchCourses();
    }
  }, [semesterId]);

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset pagination to page 1 when search term changes
  };

  // Filter courses based on search term
  const filteredCourses = allCourses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCourses.length / pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      {/* Search Bar */}
      <div className={Search.searchWrapper}>
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search"
          className={Search.searchInput}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className={styles.container}>
        {/* Department Name */}
        <p className={styles.title}>{departmentName || "Department"}</p>

        {/* Semester Selection Dropdown */}
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="semesterSelect" style={{ marginRight: "10px" }}>
            Select Semester:
          </label>
          <select
            id="semesterSelect"
            value={semesterId}
            onChange={handleSemesterChange}
            style={{
              padding: "5px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          >
            {semesters.length === 0 ? (
              <option value="">No semesters available</option>
            ) : (
              semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Display Selected Semester */}
        <p className={styles.coursetitle}>
          Available Courses in {semesterName || "Selected Semester"}
        </p>

        {/* Error Message */}
        {error && (
          <div className="error" style={{ color: "red", marginBottom: "10px" }}>
            Error: {error}
          </div>
        )}

        {/* Courses Table */}
        <table className={Table.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Course Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length > 0 ? (
              filteredCourses
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((course, index) => (
                  <tr key={course.id}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td>{course.name}</td>
                    <td>
                      <button className={Table.infoButton}>
                        <Link
                          to={`/SuperAdminRole/ManageSemesters/InfoEashSemester/InfoEachDepartmentSemester/InfoEachCourseInSemester/${course.id}/${semesterId}`}
                          className="fa-solid fa-circle-info"
                        ></Link>
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="3">No courses available.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={Pagination.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={Pagination.pageButton}
          >
            ← Back
          </button>

          <div className={Pagination.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`${Pagination.pageNumber} ${
                  currentPage === page ? Pagination.activePage : ""
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={Pagination.pageButton}
          >
            Next →
          </button>
        </div>
      </div>
    </>
  );
}
