import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./ManageTeachers.module.css";
import Table from "../../../Shared/Css/TableDesign.module.css";
import Search from "../../../Shared/Css/SearchInput.module.css";
import ButtonAddSuperAdmin from "../../../Components/ButtonAddSuperAdmin/ButtonAddSuperAdmin";
import { authContext } from "../../../Context/AuthContextProvider";
import { baseUrl } from "../../../Env/Env";

export default function ManageTeachers() {
  const [allTeachers, setAllTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const pageSize = 6;
  const { accessToken } = useContext(authContext);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`${baseUrl}Teacher`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setAllTeachers(response.data.result.data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error.message);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredTeachers = allTeachers.filter((teacher) =>
    teacher.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTeachers.length / pageSize);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const openDeleteModal = (teacher) => {
    setSelectedTeacher(teacher);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedTeacher) return;
    try {
      await axios.delete(`${baseUrl}Teacher/${selectedTeacher.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
      setAllTeachers((prev) => prev.filter((t) => t.id !== selectedTeacher.id));
      setShowModal(false);
      alert("Teacher deleted successfully!");
    } catch (error) {
      console.error("Error deleting teacher:", error.message);
    }
  };

  return (
    <>
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
          text="Add New Teacher"
          bgColor="#6CC7BD"
          routeLink="/SuperAdminRole/AddTeacher"
        />
        <table className={Table.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Teacher</th>
              <th>Department</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((teacher, index) => (
                <tr key={teacher.id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{teacher.fullName || "N/A"}</td>
                  <td>{teacher.departmentFullName || "N/A"}</td>
                  <td>
                    <button
                      className={Table.infoButton}
                      onClick={() => setSelectedTeacherId(teacher.id)}
                    >
                      <Link
                        className="fa-solid fa-circle-info"
                        to={`/SuperAdminRole/ManageTeachers/InfoTeacher/${teacher.id}`} // تمرير الـ id في الرابط
                      ></Link>
                    </button>
                    <button className={Table.editButton}>
                      <Link
                        to={`/SuperAdminRole/ManageTeachers/EditTeacher/${teacher.id}`}
                      >
                        <i className="fas fa-edit"></i>{" "}
                      </Link>
                    </button>
                    <button
                      className={Table.deleteButton}
                      onClick={() => openDeleteModal(teacher)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
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
      {showModal && selectedTeacher && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50 backdrop-blur-[3px]">
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow-sm">
              <div className="p-4 text-center">
                <h3 className="mb-5 text-lg font-normal text-gray-500">
                  Are you sure you want to delete the teacher "
                  <span className="text-gray-900 font-semibold">
                    {selectedTeacher.fullName}
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
