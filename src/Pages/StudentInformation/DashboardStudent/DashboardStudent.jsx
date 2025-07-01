import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import SearchNotification from "../../../Shared/Css/SearchInputNotification.module.css";
import styles from "./DashboardStudent.module.css";
import Information from "../../../../src/Shared/Css/InfoAndInformation.module.css";
import Table from "../../../Shared/Css/TableDesign.module.css";
import Pagination from "../../../Shared/Css/Pagination.module.css";
import axios from "axios";
import { baseUrl } from "../../../Env/Env";
import { authContext } from "../../../Context/AuthContextProvider";
import { Link } from "react-router-dom";
import { useNotificationService } from "../../../Service/NotificationService";

export default function DashboardStudent() {
  const [studentData, setStudentData] = useState(null); // State for detailed student data
  const [studentsList, setStudentsList] = useState([]); // State for list of students
  const { accessToken, decodedToken } = useContext(authContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [allCourses, setAllCourses] = useState([]); // State for enrolled courses
  const [semesterId, setSemesterId] = useState(""); // State for current semester ID
  const [currentPage, setCurrentPage] = useState(1); // State for pagination
  const [showNotifications, setShowNotifications] = useState(false);
  const pageSize = 3; // Same page size as InfoEachDepartmentAdmin
  const location = useLocation();
  const notificationRef = useRef(null);
  
  // Use the notification service (API-based)
  const { notifications: apiNotifications } = useNotificationService();
  const [localNotifications, setLocalNotifications] = useState([]);

  // Show notifications from API (like teacher dashboard)
  useEffect(() => {
    if (Array.isArray(apiNotifications) && apiNotifications.length > 0) {
      setLocalNotifications(
        apiNotifications.map((n, idx) => ({
          id: n.createdAt + idx,
          message: n.message,
          title: n.title,
          read: false,
          timestamp: n.createdAt,
        }))
      );
    }
  }, [apiNotifications]);

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
        fetchStudentData(students[0].id); // Fetch details for the first student
      } else {
        throw new Error("No students found in response");
      }
    } catch (error) {
      console.error("Error fetching students:", error.message);
      const errorMessage = error.response?.data?.message || error.message;
    }
  };

  // Fetch detailed student data by ID
  const fetchStudentData = async (id) => {
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
    }
  };

  // Fetch current semester
  const fetchCurrentSemester = async () => {
    try {
      const response = await axios.get(`${baseUrl}Semester/CurrentSemester`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      console.log("Current semester response:", response.data);
      setSemesterId(response.data.result.id);
      console.log("Current semester ID:", response.data.result.id);
    } catch (error) {
      console.error("Error fetching semester:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage = error.response?.data?.message || error.message;
    }
  };

  // Fetch enrolled courses for the student
  const fetchCourses = async () => {
    if (!semesterId || !studentData?.id) return;
    try {
      const response = await axios.get(`${baseUrl}Course`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          studentId: studentData.id,
          semesterId: semesterId,
        },
      });
      setAllCourses(response.data.data);
      console.log("Enrolled courses:", response.data.data);
    } catch (error) {
      console.error("Error fetching courses:", error.message);
    }
  };

  // Fetch students and semester on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchCurrentSemester();
      fetchData();
    };
    fetchInitialData();
  }, []);

  // Fetch courses when semesterId or studentData changes
  useEffect(() => {
    fetchCourses();
  }, [semesterId, studentData]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter courses based on search term
  const filteredCourses = allCourses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = (notificationId) => {
    setLocalNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearAllNotifications = () => {
    setLocalNotifications([]);
  };



  // Close popup on outside click
  useEffect(() => {
    if (!showNotifications) return;
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        !event.target.closest(`.${SearchNotification.notificationIcon}`)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Close popup on route change
  useEffect(() => {
    setShowNotifications(false);
  }, [location]);

  // Get unread notifications count
  const unreadCount = localNotifications.filter((n) => !n.read).length;
  


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
              onChange={handleSearchChange}
            />
          </div>
          <div className={styles.notificationContainer}>
            <div
              className={SearchNotification.notificationIcon}
              onClick={toggleNotifications}
            >
              <i className="far fa-bell"></i>
              {unreadCount > 0 && (
                <span className={styles.notificationBadge}>
                  {unreadCount}
                </span>
              )}
            </div>

          </div>
        </div>
      </div>

      {showNotifications && (
        <div className={styles.notificationPopup} ref={notificationRef}>
          <div className={styles.notificationHeader}>
            <div className={styles.headerTitle}>
              <i className="fas fa-bell"></i>
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <span className={styles.headerBadge}>{unreadCount}</span>
              )}
            </div>
            {localNotifications.length > 0 && (
              <button
                className={styles.clearButton}
                onClick={clearAllNotifications}
                title="Clear All Notifications"
              >
                <i className="fas fa-trash-alt"></i>
                Clear All
              </button>
            )}
          </div>
          <div className={styles.notificationList}>
            {localNotifications.length === 0 ? (
              <div className={styles.noNotifications}>
                <div className={styles.emptyIcon}>
                  <i className="far fa-bell-slash"></i>
                </div>
                <h4>No notifications yet</h4>
                <p>You'll see enrollment updates and important messages here</p>
                {/* Connection info removed: no isConnected or connectionStatus in API notifications */}
              </div>
            ) : (
              localNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${
                    notification.read ? styles.read : styles.unread
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={styles.notificationIcon}>
                    {notification.type === "signalr" ? (
                      <i className="fas fa-graduation-cap"></i>
                    ) : (
                      <i className="fas fa-info-circle"></i>
                    )}
                  </div>
                  <div className={styles.notificationContent}>
                    <div className={styles.messageText}>
                      {notification.message}
                    </div>
                    <div className={styles.notificationMeta}>
                      <span className={styles.notificationTime}>
                        {new Date(notification.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className={styles.notificationDate}>
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className={styles.unreadIndicator}>
                      <div className={styles.unreadDot}></div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.cardsContainer}>
          <div className={`${styles.card} ${styles.cardBg1}`}>
            <div className={styles.cardLeft}>
              <div className={`${styles.iconCircle} ${styles.circle1}`}>
                <i className="fas fa-building"></i>
              </div>
            </div>
            <div className={styles.cardRight}>
              <div className={styles.description}>Credit Hours</div>
              <div className={styles.number}>
                {studentData ? studentData.obtainedhours : "Loading..."}
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardBg2}`}>
            <div className={styles.cardLeft}>
              <div className={`${styles.iconCircle} ${styles.circle2}`}>
                <i className="fa-solid fa-user-graduate fa-flip-horizontal"></i>
              </div>
            </div>
            <div className={styles.cardRight}>
              <div className={styles.description}>Level</div>
              <div className={styles.number}>
                {studentData ? studentData.level : "Loading..."}
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardBg3}`}>
            <div className={styles.cardLeft}>
              <div className={`${styles.iconCircle} ${styles.circle3}`}>
                <i className="fa-solid fa-user-tie"></i>
              </div>
            </div>
            <div className={styles.cardRight}>
              <div className={styles.description}>GPA</div>
              <div className={styles.number}>
                {studentData ? studentData.gpa || "N/A" : "Loading..."}
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardBg4}`}>
            <div className={styles.cardLeft}>
              <div className={`${styles.iconCircle} ${styles.circle4}`}>
                <i className="fa-solid fa-chart-simple"></i>
              </div>
            </div>
            <div className={styles.cardRight}>
              <div className={styles.description}>Courses</div>
              <div className={styles.number}>
                {studentData ? studentData.coursesCount || "N/A" : "Loading..."}
              </div>
            </div>
          </div>
        </div>

        <div className={`${Information.line}`}></div>
        <p className={styles.coursetitle}>Enrolled Courses in this Semester</p>
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
                        to={`/StudentRole/InfoEachCouseOfStudent/${course.id}`} // Replace with the correct route for course details
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
