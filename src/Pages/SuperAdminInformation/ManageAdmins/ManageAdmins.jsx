import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import styles from "./ManageAdmins.module.css";
import Table from "../../../Shared/Css/TableDesign.module.css";
import Search from "../../../Shared/Css/SearchInput.module.css";
import ButtonAddSuperAdmin from "../../../Components/ButtonAddSuperAdmin/ButtonAddSuperAdmin";
import { authContext } from "../../../Context/AuthContextProvider";
import { baseUrl } from "../../../Env/Env";
import { Link } from "react-router-dom";

export default function ManageAdmins() {
  const [allAdmins, setAllAdmins] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const { accessToken } = useContext(authContext);

  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ جلب الإداريين
  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${baseUrl}Admin`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Fetched Admins:", response.data.result.data);
      setAllAdmins(response.data.result.data);
      setAdmins(response.data.result.data.slice(0, pageSize));
    } catch (error) {
      console.error("Error fetching Admins:", error.message);
    }
  };

  // ✅ جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchAdmins();
  }, []);

  // ✅ تحديث البحث
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // ✅ تصفية الإداريين بناءً على البحث
  const filteredAdmins = allAdmins.filter((admin) =>
    admin.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAdmins.length / pageSize);

  // ✅ تغيير الصفحة
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ✅ فتح المودال للحذف
  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  // ✅ تأكيد الحذف
  const confirmDelete = async () => {
    if (!selectedAdmin) return;

    try {
      console.log(`Deleting admin: ${selectedAdmin.id}`);

      const response = await axios.delete(
        `${baseUrl}Admin/${selectedAdmin.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      console.log("Response:", response.data);

      if (response.status === 200) {
        // ✅ حذف الإداري من القائمة
        setAllAdmins((prev) =>
          prev.filter((admin) => admin.id !== selectedAdmin.id)
        );

        // ✅ تحديث البيانات بعد الحذف
        await fetchAdmins();
        alert("Admin deleted successfully!");
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error(
        "Error deleting admin:",
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
          text="Add New Admin"
          bgColor="#99C9E2"
          routeLink="/SuperAdminRole/AddAdmin"
        />

        {/* ✅ الجدول */}
        <table className={Table.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Admin</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((admin, index) => (
                <tr key={admin.id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{admin.fullName}</td>
                  <td>
                    <button className={Table.infoButton}>
                      <Link
                        to={`/SuperAdminRole/ManageAdmins/InfoAdmin/${admin.id}`}
                      >
                        <i className="fa-solid fa-circle-info"></i>
                      </Link>
                    </button>
                    <button className={Table.editButton}>
                      <Link
                        to={`/SuperAdminRole/ManageAdmins/EditAdmin/${admin.id}`}
                      >
                        <i className="fas fa-edit"></i>{" "}
                      </Link>
                    </button>
                    <button
                      className={Table.deleteButton}
                      onClick={() => openDeleteModal(admin)}
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
      {showModal && selectedAdmin && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50 backdrop-blur-[3px]">
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
              <div className="p-4 md:p-5 text-center">
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete the admin "
                  <span className="text-gray-900 font-semibold dark:text-white">
                    {selectedAdmin.fullName}
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
