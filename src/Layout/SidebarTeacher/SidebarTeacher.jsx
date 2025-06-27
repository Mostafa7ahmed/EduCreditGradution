import React, { useContext, useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import SidebarTeacherStyle from "./SidebarTeacher.module.css";
import { sideLogo } from "./../../assets/Icons/SideLogo";
import axios from "axios";
import { baseUrl } from "../../Env/Env";
import { authContext } from "../../Context/AuthContextProvider";

export default function SidebarTeacher() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { accessToken, setAccessToken, refreshToken, setRefreshToken } =
    useContext(authContext);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    if (accessToken) {
      try {
        await axios.get(`${baseUrl}Account/logout`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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

    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem("accesstoken");
    localStorage.removeItem("refreshtoken");
    localStorage.removeItem("role");

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

      <div className={SidebarTeacherStyle.container}>
        {/* Sidebar */}
        <div
          className={` ${SidebarTeacherStyle.sidebar}  ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          } fixed lg:static h-full lg:h-auto bg-white shadow-md lg:shadow-none transition-transform duration-300 z-50 lg:w-1/4 w-64 p-4`}
        >
          <div className={SidebarTeacherStyle.logo}>{sideLogo}</div>
          <div className={SidebarTeacherStyle.line}></div>
          <h3 className={SidebarTeacherStyle.menuTitle}>MAIN MENU</h3>
          <ul className={SidebarTeacherStyle.menu}>
            <li>
              <NavLink to="/TeacherRole">
                <i className="fa-solid fa-chart-pie"></i> <p>Dashboard</p>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/TeacherRole/PersonalInformation"
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
                to="/TeacherRole/CoursesScheduled"
                className={({ isActive }) =>
                  `${isActive ? "bg-[#E6E6E6]" : "text-gray-600"}`
                }
              >
                <i className="fa-solid fa-database"></i>
                <p>Courses Scheduled</p>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/TeacherRole/ManageGuidance"
                className={({ isActive }) =>
                  `${isActive ? "bg-[#E6E6E6]" : "text-gray-600"}`
                }
              >
                <i className="fa-solid fa-database"></i>
                <p>Manage Guidance</p>
              </NavLink>
            </li>
          </ul>

          <h3 className={SidebarTeacherStyle.SecondTitle}>OTHER</h3>
          <ul className={SidebarTeacherStyle.menu}>
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
            SidebarTeacherStyle.content
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
