import React, { useContext, useEffect, useState } from "react";
import SearchNotification from "../../../Shared/Css/SearchInputNotification.module.css";
import dashboardTeacher from "./DashboardTeacher.module.css";
import Information from "../../../../src/Shared/Css/InfoAndInformation.module.css";
import Table from "../../../Shared/Css/TableDesign.module.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { authContext } from "../../../Context/AuthContextProvider";
import { baseUrl } from "../../../Env/Env";
import Swal from "sweetalert2";
import Pagination from "../../../Shared/Css/Pagination.module.css"; // Import Pagination styles

export default function DashboardTeacher() {
  const [teacherId, setTeacherId] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]); // State for filtered data
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [data, setData] = useState({
    students: 0,
    courses: 0,
    successRate: 0,
  });
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const pageSize = 4; // Number of items per page

  const { decodedToken, accessToken } = useContext(authContext);

  // Fetch statistics for the cards
  const fetchStatistics = async () => {
    try {
      const [studentsRes, coursesRes, successRateRes] = await Promise.all([
        axios.get(
          `https://educredit.runasp.net/api/teacher/statistics/1/${decodedToken.userId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        ),
        axios.get(
          `https://educredit.runasp.net/api/teacher/statistics/0/${decodedToken.userId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        ),
        axios.get(
          `https://educredit.runasp.net/api/teacher/statistics/2/${decodedToken.userId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        ),
      ]);

      setData({
        students: studentsRes.data.total,
        courses: coursesRes.data.total,
        successRate: successRateRes.data.total,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: `Failed to fetch statistics data: ${errorMessage}`,
        confirmButtonText: "Ok!",
      });
    }
  };

  // Fetch course data for the table
  const fetchCourses = async () => {
    if (!teacherId) return;
    try {
      const response = await axios.get(
        `https://educredit.runasp.net/api/Course/${teacherId}/courses`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSchedules(response.data.result);
      setFilteredSchedules(response.data.result); // Initialize filtered data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: `Failed to fetch courses: ${errorMessage}`,
        confirmButtonText: "Ok!",
      });
    }
  };

  // Handle search input change
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on new search

    // Filter schedules based on the search term (case-insensitive)
    const filtered = schedules.filter((schedule) =>
      schedule.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredSchedules(filtered);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    if (decodedToken?.userId) {
      setTeacherId(decodedToken.userId);
      fetchStatistics(); // Fetch statistics for the cards
    }
  }, [decodedToken, accessToken]);

  useEffect(() => {
    if (teacherId) {
      fetchCourses(); // Fetch courses once teacherId is available
    }
  }, [teacherId]);

  const totalPages = Math.ceil(filteredSchedules.length / pageSize);

  return (
    <>
      <div className={SearchNotification.searchWrapper}>
        <div className={SearchNotification.searchContainer}>
          <div className={SearchNotification.inputWrapper}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search"
              className={SearchNotification.searchInput}
              value={searchTerm}
              onChange={handleSearch} // Update search term on input change
            />
          </div>
          <div className={SearchNotification.notificationIcon}>
            <i className="far fa-bell"></i>
          </div>
        </div>
      </div>
      <div className={dashboardTeacher.container}>
        <div className={dashboardTeacher.cardsContainer}>
          <div
            className={`${dashboardTeacher.card} ${dashboardTeacher.cardBg1}`}
          >
            <div className={dashboardTeacher.cardLeft}>
              <div
                className={`${dashboardTeacher.iconCircle} ${dashboardTeacher.circle1}`}
              >
                <i className="fa-solid fa-user-graduate fa-flip-horizontal"></i>
              </div>
            </div>
            <div className={dashboardTeacher.cardRight}>
              <div className={dashboardTeacher.description}>
                Guidance of Students
              </div>
              <div className={dashboardTeacher.number}>{data.students}</div>
            </div>
          </div>
          <div
            className={`${dashboardTeacher.card} ${dashboardTeacher.cardBg2}`}
          >
            <div className={dashboardTeacher.cardLeft}>
              <div
                className={`${dashboardTeacher.iconCircle} ${dashboardTeacher.circle2}`}
              >
                <i className="fas fa-building"></i>
              </div>
            </div>
            <div className={dashboardTeacher.cardRight}>
              <div className={dashboardTeacher.description}>Courses</div>
              <div className={dashboardTeacher.number}>{data.courses}</div>
            </div>
          </div>
          <div
            className={`${dashboardTeacher.card} ${dashboardTeacher.cardBg3}`}
          >
            <div className={dashboardTeacher.cardLeft}>
              <div
                className={`${dashboardTeacher.iconCircle} ${dashboardTeacher.circle3}`}
              >
                <i className="fa-solid fa-chart-simple"></i>
              </div>
            </div>
            <div className={dashboardTeacher.cardRight}>
              <div className={dashboardTeacher.description}>Success Rate</div>
              <div className={dashboardTeacher.number}>{data.successRate}%</div>
            </div>
          </div>
        </div>

        <div className={`${Information.line}`}></div>
        <p className={dashboardTeacher.coursetitle}>
          Courses Scheduled in this Semester
        </p>

        <table className={Table.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Courses Name</th>
              <th>Count</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.length > 0 ? (
              filteredSchedules
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((schedule, index) => (
                  <tr key={schedule.id}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td>{schedule.name}</td>
                    <td>{schedule.count}</td>
                    <td className={Table.actionButtons}>
                      <button className={Table.infoButton}>
                        <Link
                          to={`/TeacherRole/InfoOfEachCourseByTeacher/${schedule.id}`}
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
                    ? "No matching courses found."
                    : "No scheduled courses found."}
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
