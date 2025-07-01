import React, { useContext, useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import SearchNotification from "../../../Shared/Css/SearchInputNotification.module.css";
import dashboardTeacher from "./DashboardTeacher.module.css";
import Information from "../../../../src/Shared/Css/InfoAndInformation.module.css";
import Table from "../../../Shared/Css/TableDesign.module.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { authContext } from "../../../Context/AuthContextProvider";
import { baseUrl } from "../../../Env/Env";
import Swal from "sweetalert2";
import Pagination from "../../../Shared/Css/Pagination.module.css";
import { useNotificationService } from "../../../Service/NotificationService";

export default function DashboardTeacher() {
  const [teacherId, setTeacherId] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState({
    students: 0,
    courses: 0,
    successRate: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotifications, setShowNotifications] = useState(false);
  const pageSize = 4;
  const location = useLocation();
  const notificationRef = useRef(null);

  const { decodedToken, accessToken } = useContext(authContext);
  const { notifications: apiNotifications } = useNotificationService();
  const [localNotifications, setLocalNotifications] = useState([]);

  // Fetch statistics and courses when decodedToken and accessToken are available
  useEffect(() => {
    if (!decodedToken?.userId || !accessToken) {
      return;
    }

    setTeacherId(decodedToken.userId);

    const fetchData = async () => {
      try {
        // Fetch statistics
        const [studentsRes, coursesRes, successRateRes] = await Promise.all([
          axios.get(
            `https://educredit.runasp.net/api/teacher/statistics/1/${decodedToken.userId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          ),
          axios.get(
            `https://educredit.runasp.net/api/teacher/statistics/0/${decodedToken.userId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          ),
          axios.get(
            `https://educredit.runasp.net/api/teacher/statistics/2/${decodedToken.userId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          ),
        ]);

        setData({
          students: studentsRes.data.total,
          courses: coursesRes.data.total,
          successRate: successRateRes.data.total,
        });

        // Fetch courses
        const response = await axios.get(
          `https://educredit.runasp.net/api/Course/${decodedToken.userId}/courses`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setSchedules(response.data.result);
        setFilteredSchedules(response.data.result);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        // Optionally handle error message
      }
    };

    fetchData();
  }, [decodedToken, accessToken]);

  // Show notifications from API
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

  // Fetch courses function
  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        `https://educredit.runasp.net/api/Course/${decodedToken.userId}/courses`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setSchedules(response.data.result);
      setFilteredSchedules(response.data.result);
    } catch (error) {
      console.error("Error fetching courses:", error.message);
      const errorMessage = error.response?.data?.message || error.message;
    }
  };

  // Handle search input change
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);

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

  // Notification management functions
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

  const totalPages = Math.ceil(filteredSchedules.length / pageSize);
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
              onChange={handleSearch} // Update search term on input change
            />
          </div>
          <div className={dashboardTeacher.notificationContainer}>
            <div
              className={SearchNotification.notificationIcon}
              onClick={toggleNotifications}
            >
              <i className="far fa-bell"></i>
              {unreadCount > 0 && (
                <span className={dashboardTeacher.notificationBadge}>
                  {unreadCount}
                </span>
              )}
            </div>
            {/* Connection status indicator removed (API notifications) */}
          </div>
        </div>
      </div>

      {showNotifications && (
        <div
          className={dashboardTeacher.notificationPopup}
          ref={notificationRef}
        >
          <div className={dashboardTeacher.notificationHeader}>
            <div className={dashboardTeacher.headerTitle}>
              <i className="fas fa-bell"></i>
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <span className={dashboardTeacher.headerBadge}>
                  {unreadCount}
                </span>
              )}
            </div>
            {localNotifications.length > 0 && (
              <button
                className={dashboardTeacher.clearButton}
                onClick={clearAllNotifications}
                title="Clear All Notifications"
              >
                <i className="fas fa-trash-alt"></i>
                Clear All
              </button>
            )}
          </div>
          <div className={dashboardTeacher.notificationList}>
            {localNotifications.length === 0 ? (
              <div className={dashboardTeacher.noNotifications}>
                <div className={dashboardTeacher.emptyIcon}>
                  <i className="far fa-bell-slash"></i>
                </div>
                <h4>No notifications yet</h4>
                <p>
                  You'll see student enrollment updates and course notifications
                  here
                </p>
                <div className={dashboardTeacher.connectionInfo}>
                  <div className={dashboardTeacher.connectionIndicator}>
                    <span
                      className={`${dashboardTeacher.statusDot} ${
                        isConnected
                          ? dashboardTeacher.connected
                          : dashboardTeacher.disconnected
                      }`}
                    ></span>
                    <span>{connectionStatus}</span>
                  </div>
                </div>
              </div>
            ) : (
              localNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${dashboardTeacher.notificationItem} ${
                    notification.read
                      ? dashboardTeacher.read
                      : dashboardTeacher.unread
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={dashboardTeacher.notificationIcon}>
                    {notification.type === "signalr" ? (
                      <i className="fas fa-chalkboard-teacher"></i>
                    ) : (
                      <i className="fas fa-info-circle"></i>
                    )}
                  </div>
                  <div className={dashboardTeacher.notificationContent}>
                    <div className={dashboardTeacher.messageText}>
                      {notification.message}
                    </div>
                    <div className={dashboardTeacher.notificationMeta}>
                      <span className={dashboardTeacher.notificationTime}>
                        {new Date(notification.timestamp).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                      <span className={dashboardTeacher.notificationDate}>
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className={dashboardTeacher.unreadIndicator}>
                      <div className={dashboardTeacher.unreadDot}></div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
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
