import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import styles from "./ManageDepartments.module.css";
import Table from "../../../Shared/Css/TableDesign.module.css";
import Search from "../../../Shared/Css/SearchInput.module.css";
import ButtonAddSuperAdmin from "../../../Components/ButtonAddSuperAdmin/ButtonAddSuperAdmin";
import { authContext } from "../../../Context/AuthContextProvider";
import { baseUrl } from "../../../Env/Env";
import { Link } from "react-router-dom";

export default function ManageDepartments() {
  const [allDepartments, setAllDepartments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const { accessToken } = useContext(authContext);

  const [selectedDept, setSelectedDept] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // ✅ دالة لجلب الأقسام
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${baseUrl}Department`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Fetched Data:", response.data.data);
      setAllDepartments(response.data.data);
      setDepartments(response.data.data.slice(0, pageSize));
    } catch (error) {
      console.error("Error fetching Departments:", error.message);
    }
  };

  // ✅ جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchDepartments();
  }, []);

  // ✅ تحديث قيمة البحث
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // ✅ تصفية الأقسام بناءً على البحث
  const filteredDepartments = allDepartments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDepartments.length / pageSize);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ✅ فتح المودال للحذف
  const openDeleteModal = (dept) => {
    setSelectedDept(dept);
    setShowModal(true);
  };

  // ✅ تأكيد الحذف
  const confirmDelete = async () => {
    if (!selectedDept) return;

    try {
      console.log(`Deleting department: ${selectedDept.id}`);

      const response = await axios.delete(
        `${baseUrl}Department/${selectedDept.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 204) {
        // ✅ حذف القسم من الحالة مباشرةً
        setAllDepartments((prev) =>
          prev.filter((dept) => dept.id !== selectedDept.id)
        );

        // ✅ تحديث الصفحة بعد الحذف
        await fetchDepartments();
        alert("Department deleted successfully!");

        setDeleteSuccess(true);
        setTimeout(() => setDeleteSuccess(false), 2000);
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error(
        "Error deleting department:",
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
          text="Add New Department"
          bgColor="#CAF0F8"
          routeLink="/SuperAdminRole/ManageDepartments/AddDepartment"
        />

        {/* ✅ الجدول */}
        <table className={Table.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Departments</th>
              <th>Department Head</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((dept, index) => (
                <tr key={dept.id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{dept.name}</td>
                  <td>{dept.departmentHeadFullName || "N/A"}</td>
                  <td className={Table.actionButtons}>
                    <button className={Table.editButton}>
                      <Link
                        to={`/SuperAdminRole/ManageDepartments/EditDepartment/${dept.id}`}
                        className="fas fa-edit"
                      ></Link>
                    </button>
                    <button
                      className={Table.deleteButton}
                      onClick={() => openDeleteModal(dept)}
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
      {showModal && selectedDept && (
        <div
          id="popup-modal"
          tabindex="-1"
          className="fixed inset-0 flex items-center justify-center  bg-opacity-50  z-50 backdrop-blur-[3px]"
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
                  Are you sure you want to delete the department "
                  <span className="text-gray-900 font-semibold dark:text-white">
                    {selectedDept.name}
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
    </>
  );
}
