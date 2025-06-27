import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import SidebarStudentStyle from "./SidebarStudent.module.css";
import { sideLogo } from "./../../assets/Icons/SideLogo";

export default function SidebarStudent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // تعريف isSidebarOpen

  return (
    <>
      <div className={SidebarStudentStyle.container}>
        {/* Sidebar */}
        <div
          className={` ${SidebarStudentStyle.sidebar}  ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          } fixed lg:static h-full lg:h-auto bg-white shadow-md lg:shadow-none transition-transform duration-300 z-50 lg:w-1/4 w-64 p-4`}
        >
          <div className={SidebarStudentStyle.logo}>{sideLogo}</div>
          <div className={SidebarStudentStyle.line}></div>
          <h3 className={SidebarStudentStyle.menuTitle}>MAIN MENU</h3>
          <ul className={SidebarStudentStyle.menu}>
            <li>
              <NavLink to="/StudentRole">
                <i className="fa-solid fa-chart-pie"></i> <p>Dashboard</p>
              </NavLink>
            </li>
            <li>
              <NavLink to="/StudentRole/PersonalInformation" end>
                <i className="fa-solid fa-circle-info"></i>
                <p>Personal Information</p>
              </NavLink>
            </li>
            <li>
              <NavLink to="/StudentRole/EnrollOfCourses">
                <i className="fa-solid fa-circle-info"></i>
                <p>Enroll Of Courses</p>
              </NavLink>
            </li>
            <li>
              <NavLink to="/StudentRole/StudySchedule">
                <i className="fa-solid fa-database"></i>
                <p>Study Schedule</p>
              </NavLink>
            </li>
            <li>
              <NavLink to="/StudentRole/ExamSchedule">
                <i className="fa-solid fa-database"></i>
                <p>Exam Schedule</p>
              </NavLink>
            </li>
            <li>
              <NavLink to="/StudentRole/CourseResults">
                <i className="fa-solid fa-database"></i>
                <p>Course Results</p>
              </NavLink>
            </li>
            <li>
              <NavLink to="/StudentRole/StudentChat">
                <i class="fa-regular fa-message"></i>
                <p>Chats</p>
              </NavLink>
            </li>
          </ul>
          <h3 className={SidebarStudentStyle.SecondTitle}>OTHER</h3>
          <ul className={SidebarStudentStyle.menu}>
            <li>
              <NavLink to="/auth/change-password">
                <i className="fa-solid fa-right-from-bracket"></i>{" "}
                <p>Change Password</p>
              </NavLink>
            </li>
            <li>
              <NavLink to="/Login">
                <i className="fa-solid fa-lock"></i> <p>Logout</p>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* الجزء الأيمن (المحتوى اللي بيتغير) */}
        <div
          className={`${
            SidebarStudentStyle.content
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
