import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Search from "../../../../Shared/Css/SearchInput.module.css";
import styles from "./InfoEachDepartmentAdmin.module.css";
import Information from "../../../../../src/Shared/Css/InfoAndInformation.module.css";
import Table from "../../../../Shared/Css/TableDesign.module.css";
import { authContext } from "../../../../Context/AuthContextProvider";
import { baseUrl } from "../../../../Env/Env";
import Pagination from "../../../../Shared/Css/Pagination.module.css";

export default function InfoEachDepartmentAdmin() {
  const { accessToken } = useContext(authContext);
  const { departmentId, departmentName } = useParams(); // Added departmentName
  const [semesterId, setSemesterId] = useState("");
  const [allCourses, setAllCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  const [data, setData] = useState({
    departments: 0,
    students: 0,
    teachers: 0,
    successRate: 0,
  });

  const fetchStatistics = async () => {
    try {
      const [coursesRes, studentsRes, teachersRes, successRateRes] =
        await Promise.all([
          axios.get(
            `${baseUrl}Admin/statistics/6?departmentId=${departmentId}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          ),
          axios.get(
            `${baseUrl}Admin/statistics/7?departmentId=${departmentId}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          ),
          axios.get(
            `${baseUrl}Admin/statistics/8?departmentId=${departmentId}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          ),
          axios.get(
            `${baseUrl}Admin/statistics/5?departmentId=${departmentId}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          ),
        ]);

      setData({
        departments: coursesRes.data.total,
        students: studentsRes.data.total,
        teachers: teachersRes.data.total,
        successRate: successRateRes.data.total,
      });
    } catch (err) {
      console.error(
        "Error fetching statistics:",
        err.response?.data || err.message
      );
    }
  };

  const fetchCurrentSemester = async () => {
    try {
      const response = await axios.get(`${baseUrl}Semester/CurrentSemester`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setSemesterId(response.data.result.id);
    } catch (error) {
      console.error("Error fetching semester:", error.message);
    }
  };

  const fetchCourses = async () => {
    if (!semesterId) return;
    try {
      const response = await axios.get(`${baseUrl}Course`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          departmentId: departmentId,
          semesterId: semesterId,
        },
      });
      setAllCourses(response.data.data);
    } catch (error) {
      console.error("Error fetching courses:", error.message);
    }
  };

  // Fetch semester and statistics on mount or when departmentId changes
  useEffect(() => {
    const fetchData = async () => {
      await fetchCurrentSemester();
      fetchStatistics();
    };
    fetchData();
  }, [departmentId]);

  // Fetch courses when semesterId changes
  useEffect(() => {
    if (semesterId) {
      fetchCourses();
    }
  }, [semesterId]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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
        <p className={styles.title}>{departmentName}</p>
        {/* Use departmentName from useParams */}
        <div className={styles.cardsContainer}>
          <div className={`${styles.card} ${styles.cardBg1}`}>
            <div className={styles.cardLeft}>
              <div className={`${styles.iconCircle} ${styles.circle1}`}>
                <i className="fas fa-building"></i>
              </div>
            </div>
            <div className={styles.cardRight}>
              <div className={styles.description}>Courses</div>
              <div className={styles.number}>{data.departments}</div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardBg2}`}>
            <div className={styles.cardLeft}>
              <div className={`${styles.iconCircle} ${styles.circle2}`}>
                <i className="fa-solid fa-user-graduate fa-flip-horizontal"></i>
              </div>
            </div>
            <div className={styles.cardRight}>
              <div className={styles.description}>Students</div>
              <div className={styles.number}>{data.students}</div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardBg3}`}>
            <div className={styles.cardLeft}>
              <div className={`${styles.iconCircle} ${styles.circle3}`}>
                <i className="fa-solid fa-user-tie"></i>
              </div>
            </div>
            <div className={styles.cardRight}>
              <div className={styles.description}>Teachers</div>
              <div className={styles.number}>{data.teachers}</div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardBg4}`}>
            <div className={styles.cardLeft}>
              <div className={`${styles.iconCircle} ${styles.circle4}`}>
                <i className="fa-solid fa-chart-simple"></i>
              </div>
            </div>
            <div className={styles.cardRight}>
              <div className={styles.description}>Success Rate</div>
              <div className={styles.number}>{data.successRate}%</div>
            </div>
          </div>
        </div>
        <div className={`${Information.line}`}></div>
        <p className={styles.coursetitle}>Available Courses in this Semester</p>
        <table className={Table.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Course Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((course, index) => (
                <tr key={course.id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{course.name}</td>
                  <td>
                    <button className={Table.infoButton}>
                      <Link
                        to={`/AdminRole/InfoEachDepartmentAdmin/InfoEachCourseAdmin/${course.id}`}
                        className="fa-solid fa-circle-info"
                      ></Link>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
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
