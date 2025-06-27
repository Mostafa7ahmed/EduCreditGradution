import React, { useContext, useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import SidebarSuperAdminStyle from "./SidebarSuperAdmin.module.css";
import { sideLogo } from "./../../assets/Icons/SideLogo";
import axios from "axios";
import { baseUrl } from "../../Env/Env";
import { authContext } from "../../Context/AuthContextProvider";

export default function SidebarSuperAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { accessToken, setAccessToken, refreshToken, setRefreshToken } =
    useContext(authContext); // جيبي الدوال من authContext

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Logout handler
  const handleLogout = async () => {
    // التأكد من إن الـ accessToken موجود
    if (accessToken) {
      try {
        await axios.get(`${baseUrl}Account/logout`, {
          headers: {
            Authorization: `Bearer ${accessToken}`, // استخدام الـ accessToken من authContext
          },
        });
        console.log("Logout successful");
      } catch (error) {
        console.warn("Logout failed, token may already be invalid:", error);
      }
    } else {
      console.warn(
        "No access token found in authContext, proceeding with frontend logout."
      );
    }

    // مسح الـ accessToken و refreshToken من الـ Context
    setAccessToken(null);
    setRefreshToken(null);

    // مسح الـ accessToken و refreshToken و role من localStorage
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("refreshtoken");
    localStorage.removeItem("role");

    // التوجيه لصفحة الـ Login
    navigate("/Login");
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#0077B6] text-white rounded-md focus:outline-none"
        onClick={toggleSidebar}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={
              isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
            }
          />
        </svg>
      </button>

      <div className={SidebarSuperAdminStyle.container}>
        {/* Sidebar */}
        <div
          className={` ${SidebarSuperAdminStyle.sidebar}  ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          } fixed lg:static h-full lg:h-auto bg-white shadow-md lg:shadow-none transition-transform duration-300 z-50 lg:w-1/4 w-64 p-4`}
        >
          <div className={SidebarSuperAdminStyle.logo}>{sideLogo}</div>
          <div className={SidebarSuperAdminStyle.line}></div>
          <h3 className={SidebarSuperAdminStyle.menuTitle}>MAIN MENU</h3>
          <ul className={SidebarSuperAdminStyle.menu}>
            <li>
              <NavLink to="/SuperAdminRole">
                <i className="fa-solid fa-chart-pie"></i> <p>Dashboard</p>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/SuperAdminRole/PersonalInformation"
                className={({ isActive }) =>
                  `${isActive ? "bg-[#E6E6E6]" : "text-gray-600"}`
                }
              >
                <i className="fa-solid fa-circle-info"></i>
                <p>Personal Information</p>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/SuperAdminRole/ManageDepartments"
                className={({ isActive }) =>
                  `${isActive ? "bg-[#E6E6E6]" : "text-gray-600"}`
                }
              >
                <i className="fa-solid fa-database"></i>
                <p>Manage Departments</p>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/SuperAdminRole/ManageCourses"
                className={({ isActive }) =>
                  `${isActive ? "bg-[#E6E6E6]" : "text-gray-600"}`
                }
              >
                <i className="fa-solid fa-database"></i> <p>Manage Courses</p>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/SuperAdminRole/ManageStudents"
                className={({ isActive }) =>
                  `${isActive ? "bg-[#E6E6E6]" : "text-gray-600"}`
                }
              >
                <i className="fa-solid fa-database"></i>
                <p>Manage Students</p>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/SuperAdminRole/ManageTeachers"
                className={({ isActive }) =>
                  `${isActive ? "bg-[#E6E6E6]" : "text-gray-600"}`
                }
              >
                <i className="fa-solid fa-database"></i>
                <p>Manage Teachers</p>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/SuperAdminRole/ManageAdmins"
                className={({ isActive }) =>
                  `${isActive ? "bg-[#E6E6E6]" : "text-gray-600"}`
                }
              >
                <i className="fa-solid fa-database"></i>
                <p>Manage Admins</p>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/SuperAdminRole/ManageSemesters"
                className={({ isActive }) =>
                  `${isActive ? "bg-[#E6E6E6]" : "text-gray-600"}`
                }
              >
                <i className="fa-solid fa-database"></i>
                <p>Manage Semesters</p>
              </NavLink>
            </li>
          </ul>

          <h3 className={SidebarSuperAdminStyle.SecondTitle}>OTHER</h3>
          <ul className={SidebarSuperAdminStyle.menu}>
            {" "}
            <li>
              <NavLink
                to="/auth/change-password"
                className={({ isActive }) =>
                  `${isActive ? "bg-[#E6E6E6]" : "text-gray-600"}`
                }
              >
                <i className="fa-solid fa-key"></i> <p>Change Password</p>
              </NavLink>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2  hover:bg-[#E6E6E6] w-full px-3 py-2 rounded-md cursor-pointer"
              >
                <i className="fa-solid fa-lock"></i> <p>Logout</p>
              </button>
            </li>
          </ul>
        </div>

        {/* الجزء الأيمن (المحتوى اللي بيتغير) */}
        <div
          className={`${
            SidebarSuperAdminStyle.content
          }  bg-white transition-all duration-300 flex-1 ${
            isSidebarOpen ? "hidden lg:block" : "w-full"
          }`}
        >
          <Outlet />
        </div>
      </div>
    </>
  );
}
