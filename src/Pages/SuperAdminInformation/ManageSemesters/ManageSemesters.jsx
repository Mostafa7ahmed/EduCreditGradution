import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import styles from "./ManageSemesters.module.css";
import Table from "../../../Shared/Css/TableDesign.module.css";
import Search from "../../../Shared/Css/SearchInput.module.css";
import ButtonAddSuperAdmin from "../../../Components/ButtonAddSuperAdmin/ButtonAddSuperAdmin";
import { authContext } from "../../../Context/AuthContextProvider";
import { baseUrl } from "../../../Env/Env";
import { Link } from "react-router-dom";

export default function ManageSemesters() {
  const [allSemesters, setAllSemesters] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const { accessToken } = useContext(authContext);

  const [selectedSemester, setSelectedSemester] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // ✅ دالة لتحويل semesterType من رقم لاسم
  const getSemesterTypeName = (type) => {
    switch (type) {
      case 0:
        return "First Term";
      case 1:
        return "Second Term";
      case 2:
        return "Summer Course";
      default:
        return "Unknown";
    }
  };

  // ✅ دالة لجلب الـ Semesters
  const fetchSemesters = async () => {
    try {
      const response = await axios.get(`${baseUrl}Semester`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Fetched Semesters:", response.data.result.data);
      const semestersData = response.data.result.data.map((semester) => ({
        ...semester,
        semesterTypeName: getSemesterTypeName(semester.semesterType), // إضافة اسم الـ semesterType
      }));
      setAllSemesters(semestersData);
      setSemesters(semestersData.slice(0, pageSize));
    } catch (error) {
      console.error("Error fetching Semesters:", error.message);
    }
  };

  // ✅ جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchSemesters();
  }, []);

  // ✅ تحديث قيمة البحث
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // ✅ تصفية الـ Semesters بناءً على البحث
  const filteredSemesters = allSemesters.filter((semester) =>
    semester.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSemesters.length / pageSize);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ✅ فتح المودال للحذف
  const openDeleteModal = (semester) => {
    setSelectedSemester(semester);
    setShowModal(true);
  };

  // ✅ تأكيد الحذف
  const confirmDelete = async () => {
    if (!selectedSemester) return;

    try {
      console.log(`Deleting semester: ${selectedSemester.id}`);

      const response = await axios.delete(
        `${baseUrl}Semester/${selectedSemester.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      console.log("Response:", response.data);

      if (response.status === 200) {
        // ✅ حذف الـ Semester من الحالة مباشرةً
        setAllSemesters((prev) =>
          prev.filter((semester) => semester.id !== selectedSemester.id)
        );

        // ✅ تحديث البيانات بعد الحذف
        await fetchSemesters();
        alert("Semester deleted successfully!");

        setDeleteSuccess(true);
        setTimeout(() => setDeleteSuccess(false), 2000);
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error(
        "Error deleting semester:",
        error.response ? error.response.data : error.message
      );
    }

    setShowModal(false);
  };

  return (
    <>
      {/* ✅ شريط البحث وزر الإضافة */}
      <div className={Search.searchWrapper}>
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearchChange}
          className={Search.searchInput}
        />
      </div>

      <div className={styles.container}>
        <ButtonAddSuperAdmin
          text="Add New Semester"
          bgColor="#CAF0F8"
          routeLink="/SuperAdminRole/ManageSemesters/AddSemester"
        />

        {/* ✅ الجدول */}
        <table className={Table.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Semester</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSemesters
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((semester, index) => (
                <tr key={semester.id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{semester.name}</td>
                  <td>
                    <button className={Table.infoButton}>
                      <Link
                        to={`/SuperAdminRole/ManageSemesters/InfoEashSemester/${semester.id}`}
                      >
                        <i className="fa-solid fa-circle-info"></i>
                      </Link>
                    </button>
                    <button className={Table.editButton}>
                      <Link
                        to={`/SuperAdminRole/ManageSemesters/EditSemester/${semester.id}`}
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                    </button>
                    <button
                      className={Table.deleteButton}
                      onClick={() => openDeleteModal(semester)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* ✅ الترقيم */}
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            ← Back
          </button>

          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`${styles.pageNumber} ${
                  currentPage === page ? styles.activePage : ""
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
          >
            Next →
          </button>
        </div>
      </div>

      {/* ✅ المودال للحذف */}
      {showModal && selectedSemester && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50 backdrop-blur-[3px]">
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
              <div className="p-4 md:p-5 text-center">
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete the semester "
                  <span className="text-gray-900 font-semibold dark:text-white">
                    {selectedSemester.name}
                  </span>
                  "?
                </h3>
                <button
                  onClick={confirmDelete}
                  className="text-white bg-red-600 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5"
                >
                  Yes, I'm sure
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 bg-white rounded-lg border hover:bg-gray-100"
                >
                  No, cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
