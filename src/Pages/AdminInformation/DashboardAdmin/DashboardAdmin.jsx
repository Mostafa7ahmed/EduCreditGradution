import React, { useState, useEffect, useContext } from "react";
import styles from "../../SuperAdminInformation/DashboardSuperAdmin/DashboardSuperAdmin.module.css";
import Table from "../../../Shared/Css/TableDesign.module.css";
import SearchNotification from "../../../Shared/Css/SearchInputNotification.module.css";
import Cards from "../../../Components/cards/cards";
import Information from "../../../../src/Shared/Css/InfoAndInformation.module.css";
import Pagination from "../../../Shared/Css/Pagination.module.css";
import { Link } from "react-router-dom";
import { authContext } from "../../../Context/AuthContextProvider";
import axios from "axios";
import { baseUrl } from "../../../Env/Env";

export default function DashboardAdmin() {
  const [allDepartments, setAllDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const { accessToken } = useContext(authContext);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${baseUrl}Department`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setAllDepartments(response.data.data);
    } catch (error) {
      console.error("Error fetching Departments:", error.message);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredDepartments = allDepartments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDepartments.length / pageSize);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

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
          <div className={SearchNotification.notificationIcon}>
            <i className="far fa-bell"></i>
          </div>
        </div>
      </div>
      <div className={styles.container}>
        <Cards />
        <div className={`${Information.line}`}></div>
        <table className={Table.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Departments</th>
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
                  <td className={Table.actionButtons}>
                    <button className={Table.infoButton}>
                      <Link
                        to={`/AdminRole/InfoEachDepartmentAdmin/${dept.id}/${dept.name}`}
                        className="fa-solid fa-circle-info"
                      ></Link>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* ✅ الترقيم */}
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
