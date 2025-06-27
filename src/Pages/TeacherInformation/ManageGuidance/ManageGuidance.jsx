import React, { useContext, useEffect, useState } from "react";
import Search from "../../../Shared/Css/SearchInput.module.css";
import styles from "../CoursesScheduled/CoursesScheduled.module.css";
import Table from "../../../Shared/Css/TableDesign.module.css";
import Pagination from "../../../Shared/Css/Pagination.module.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { authContext } from "../../../Context/AuthContextProvider";

export default function StudentsByAcademicGuide() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 4;
  const { decodedToken, accessToken } = useContext(authContext);

  // Function to convert numeric level to word
  const getLevelInWords = (level) => {
    const levelMap = {
      1: "First",
      2: "Second",
      3: "Third",
      4: "Fourth",
    };
    return levelMap[level] || "Unknown";
  };

  const fetchStudents = async () => {
    if (!decodedToken || !decodedToken.userId) {
      console.error("decodedToken or userId is not available");
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        `https://educredit.runasp.net/api/Student?AcademicGuideId=${decodedToken.userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Include if required
          },
        }
      );
      setStudents(response.data.result.data); // Use result.data from the response
      setFilteredStudents(response.data.result.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (decodedToken?.userId) {
      fetchStudents();
    } else {
      setIsLoading(false);
    }
  }, [decodedToken?.userId]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);
    const filtered = students.filter((student) =>
      student.fullName.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(filteredStudents.length / pageSize);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Search Input */}
      <div className={Search.searchWrapper}>
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search"
          className={Search.searchInput}
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Table */}
      <div className={styles.container}>
        <table className={Table.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Level</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((student, index) => (
                  <tr key={student.id}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td>{student.fullName}</td>
                    <td>{getLevelInWords(student.level)}</td>

                    <td className={Table.actionButtons}>
                      <button className={Table.infoButton}>
                        <Link
                          to={`/TeacherRole/ManageGuidance/StudyScheduleTeacher/${student.id}`}
                          className="fa-solid fa-circle-info"
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
                    : "No students found for this academic guide."}
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
