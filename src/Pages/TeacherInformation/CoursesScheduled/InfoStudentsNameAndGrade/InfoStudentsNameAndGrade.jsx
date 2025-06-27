import React, { useContext, useEffect, useState } from "react";
import Search from "../../../../Shared/Css/SearchInput.module.css";
import styles from "../CoursesScheduled.module.css";
import Table from "../../../../Shared/Css/TableDesign.module.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { authContext } from "../../../../Context/AuthContextProvider";
import { baseUrl } from "../../../../Env/Env";
import Swal from "sweetalert2";
import Pagination from "../../../../Shared/Css/Pagination.module.css"; // Import Pagination styles

export default function InfoStudentsNameAndGrade() {
  const [students, setStudents] = useState([]); // State for flattened student data
  const [filteredStudents, setFilteredStudents] = useState([]); // State for filtered student data
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const { decodedToken, accessToken } = useContext(authContext);
  const [teacherId, setTeacherId] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const pageSize = 4; // Number of items per page

  // Fetch course data and flatten the students array
  const fetchCourses = async () => {
    if (!teacherId) return;
    try {
      const response = await axios.get(
        `${baseUrl}Course/${teacherId}/courses`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Flatten the students array from all courses and include courseId
      const allStudents = response.data.result.flatMap((course) =>
        course.students.map((student) => ({
          enrollmentTableId: student.enrollmentTableId,
          studentName: student.studentName,
          grade: student.grade,
          courseId: course.id, // Include courseId for each student
        }))
      );

      setStudents(allStudents);
      setFilteredStudents(allStudents); // Initialize filtered data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: `Failed to fetch student data: ${errorMessage}`,
        confirmButtonText: "Ok!",
      });
    }
  };

  // Handle search input change
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on new search

    // Filter students based on the search term (case-insensitive)
    const filtered = students.filter((student) =>
      student.studentName.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    if (decodedToken?.userId) {
      setTeacherId(decodedToken.userId);
    }
  }, [decodedToken]);

  useEffect(() => {
    if (teacherId) {
      fetchCourses(); // Fetch data once teacherId is available
    }
  }, [teacherId]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize);

  return (
    <>
      <div className={Search.searchWrapper}>
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search"
          className={Search.searchInput}
          value={searchTerm}
          onChange={handleSearch} // Update search term on input change
        />
      </div>
      <div className={styles.container}>
        <table className={Table.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Grade</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((student, index) => (
                  <tr key={student.enrollmentTableId}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td>{student.studentName}</td>
                    <td>{student.grade}</td>
                    <td className={Table.actionButtons}>
                      <button className={Table.editButton}>
                        <Link
                          to={`/TeacherRole/CoursesScheduled/InfoStudentsNameAndGrade/EditStudentGrade/${student.enrollmentTableId}/${student.courseId}`}
                          className="fas fa-edit"
                        ></Link>
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="4">
                  {searchTerm
                    ? "No matching students found."
                    : "No student data found."}
                </td>
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
