import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Search from "../../../../Shared/Css/SearchInput.module.css";
import styles from "./InfoEachDepartment.module.css";
import Information from "../../../../../src/Shared/Css/InfoAndInformation.module.css";
import Table from "../../../../Shared/Css/TableDesign.module.css";
import { authContext } from "../../../../Context/AuthContextProvider";
import { baseUrl } from "../../../../Env/Env";
import Pagination from "../../../../Shared/Css/Pagination.module.css";

export default function InfoEachDepartment() {
  const { accessToken } = useContext(authContext);
  const { departmentId, departmentName } = useParams();
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

  // State for modal and deletion
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

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
      const errorMessage = error.response?.data?.message || error.message;
      alert(errorMessage);
    }
  };

  const fetchCourses = async () => {
    if (!semesterId) return;
    try {
      console.log("semesterId used:", semesterId);
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

  // Open delete modal
  const openDeleteModal = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!selectedCourse) return;

    try {
      console.log(`Deleting course: ${selectedCourse.id}`);

      const response = await axios.delete(
        `${baseUrl}Schedule/${selectedCourse.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 204) {
        // Remove course from state
        setAllCourses((prev) =>
          prev.filter((course) => course.id !== selectedCourse.id)
        );

        // Refresh courses list
        await fetchCourses();
        alert("Course deleted successfully!");

        setDeleteSuccess(true);
        setTimeout(() => setDeleteSuccess(false), 2000);
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error(
        "Error deleting course:",
        error.response ? error.response.data : error.message
      );
      alert(
        error.response?.data?.message ||
          "Failed to delete course. Please try again."
      );
    }

    setShowModal(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchCurrentSemester();
      fetchStatistics();
    };
    fetchData();
  }, [departmentId]);

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
                        to={`/SuperAdminRole/InfoEachDepartment/InfoEachCourse/${course.id}`}
                        className="fa-solid fa-circle-info"
                      ></Link>
                    </button>
                    <button className={Table.editButton}>
                      <Link
                        className="fas fa-edit"
                        to={`/SuperAdminRole/InfoEachDepartment/EditEachCourse/${course.id}`}
                      ></Link>
                    </button>
                    <button
                      className={Table.deleteButton}
                      onClick={() => openDeleteModal(course)}
                    >
                      <i className="fas fa-trash"></i>
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

        {/* Delete Modal */}
        {showModal && selectedCourse && (
          <div
            id="popup-modal"
            tabIndex="-1"
            className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50 backdrop-blur-[3px]"
          >
            <div className="relative p-4 w-full max-w-md max-h-full">
              <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                <button
                  type="button"
                  className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={() => setShowModal(false)}
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
                <div className="p-4 md:p-5 text-center">
                  <svg
                    className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete the course "
                    <span className="text-gray-900 font-semibold dark:text-white">
                      {selectedCourse.name}
                    </span>
                    "?
                  </h3>
                  <button
                    onClick={confirmDelete}
                    className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                  >
                    Yes, I'm sure
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    No, cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
