import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthContextProvider from "./Context/AuthContextProvider";
import Select from "./Pages/SelectType/Select";
import Login from "./Pages/Auth/Login/Login";
import PersonalInformation from "./Pages/PersonalInformation/PersonalInformation";
import SidebarSuperAdmin from "./Layout/SidebarSuperAdmin/SidebarSuperAdmin";
import DashboardSuperAdmin from "./Pages/SuperAdminInformation/DashboardSuperAdmin/DashboardSuperAdmin";
import ManageStudents from "./Pages/SuperAdminInformation/ManageStudents/ManageStudents";
import ManageAdmins from "./Pages/SuperAdminInformation/ManageAdmins/ManageAdmins";
import ManageCourses from "./Pages/SuperAdminInformation/ManageCourses/ManageCourses";
import ManageDepartments from "./Pages/SuperAdminInformation/ManageDepartments/ManageDepartments";
import ManageTeachers from "./Pages/SuperAdminInformation/ManageTeachers/ManageTeachers";
import SidebarStudent from "./Layout/SidebarStudent/SidebarStudent";
import EnrollOfCourses from "./Pages/StudentInformation/EnrollOfCourses/EnrollOfCourses";
import StudySchedule from "./Pages/StudentInformation/StudySchedule/StudySchedule";
import ExamSchedule from "./Pages/StudentInformation/ExamSchedule/ExamSchedule";
import CourseResults from "./Pages/StudentInformation/CourseResults/CourseResults";
import AddDepartment from "./Pages/SuperAdminInformation/ManageDepartments/AddDepartment/AddDepartment";
import AddCourse from "./Pages/SuperAdminInformation/ManageCourses/AddCourse/AddCourse";
import AddStudent from "./Pages/SuperAdminInformation/ManageStudents/AddStudent/AddStudent";
import AddTeacher from "./Pages/SuperAdminInformation/ManageTeachers/AddTeacher/AddTeacher";
import AddAdmin from "./Pages/SuperAdminInformation/ManageAdmins/AddAdmin/AddAdmin";
import ManageSemesters from "./Pages/SuperAdminInformation/ManageSemesters/ManageSemesters";
import EditDepartment from "./Pages/SuperAdminInformation/ManageDepartments/EditDepartment/EditDepartment";
import InfoCourse from "./Pages/SuperAdminInformation/ManageCourses/InfoCourse/InfoCourse";
import InfoTeacher from "./Pages/SuperAdminInformation/ManageTeachers/InfoTeacher/InfoTeacher";
import InfoAdmin from "./Pages/SuperAdminInformation/ManageAdmins/InfoAdmin/InfoAdmin";
import InfoStudent from "./Pages/SuperAdminInformation/ManageStudents/InfoStudent/InfoStudent";
import EditCourse from "./Pages/SuperAdminInformation/ManageCourses/EditCourse/EditCourse";
import AddSemester from "./Pages/SuperAdminInformation/ManageSemesters/AddSemester/AddSemester";
import InfoEachDepartment from "./Pages/SuperAdminInformation/DashboardSuperAdmin/InfoEachDepartment/InfoEachDepartment";
import InfoEachCourse from "./Pages/SuperAdminInformation/DashboardSuperAdmin/InfoEachCourse/InfoEachCourse";
import SidebarAdmin from "./Layout/SidebarAdmin/SidebarAdmin";
import DashboardAdmin from "./Pages/AdminInformation/DashboardAdmin/DashboardAdmin";
import ManageStudentAdmin from "./Pages/AdminInformation/ManageStudentAdmin/ManageStudentAdmin";
import SidebarTeacher from "./Layout/SidebarTeacher/SidebarTeacher";
import DashboardTeacher from "./Pages/TeacherInformation/DashboardTeacher/DashboardTeacher";
import CoursesScheduled from "./Pages/TeacherInformation/CoursesScheduled/CoursesScheduled";
import ManageGuidance from "./Pages/TeacherInformation/ManageGuidance/ManageGuidance";
import InfoEachDepartmentAdmin from "./Pages/AdminInformation/DashboardAdmin/InfoEachDepartmentAdmin/InfoEachDepartmentAdmin";
import AddStudentAdmin from "./Pages/AdminInformation/ManageStudentAdmin/AddStudentAdmin/AddStudentAdmin";
import EditStudentAdmin from "./Pages/AdminInformation/ManageStudentAdmin/EditStudentAdmin/EditStudentAdmin";
import InfoStudentAdmin from "./Pages/AdminInformation/ManageStudentAdmin/InfoStudentAdmin/InfoStudentAdmin";
import EditEachCourse from "./Pages/SuperAdminInformation/DashboardSuperAdmin/EditEachCourse/EditEachCourse";
import InfoEachCourseAdmin from "./Pages/AdminInformation/DashboardAdmin/InfoEachCourseAdmin/InfoEachCourseAdmin";
import EditSemester from "./Pages/SuperAdminInformation/ManageSemesters/EditSemester/EditSemester";
import InfoEashSemester from "./Pages/SuperAdminInformation/ManageSemesters/InfoEashSemester/InfoEashSemester";
import EditStudent from "./Pages/SuperAdminInformation/ManageStudents/EditStudent/EditStudent";
import EditAdmin from "./Pages/SuperAdminInformation/ManageAdmins/EditAdmin/EditAdmin";
import EditTeacher from "./Pages/SuperAdminInformation/ManageTeachers/EditTeacher/EditTeacher";
import InfoEachDepartmentSemester from "./Pages/SuperAdminInformation/ManageSemesters/InfoEachDepartmentSemester/InfoEachDepartmentSemester";
import DashboardStudent from "./Pages/StudentInformation/DashboardStudent/DashboardStudent";
import InfoEachCouseOfStudent from "./Pages/StudentInformation/DashboardStudent/InfoEachCouseOfStudent/InfoEachCouseOfStudent";
import InfoEachCourseInSemester from "./Pages/SuperAdminInformation/ManageSemesters/InfoEachCourseInSemester/InfoEachCourseInSemester";
import StudyScheduleAdmin from "./Pages/AdminInformation/ManageStudentAdmin/StudySchedule/StudyScheduleAdmin";
import CoursesResultAdmin from "./Pages/AdminInformation/ManageStudentAdmin/CoursesResultAdmin/CoursesResultAdmin";
import EnrollOfCoursesByAdmin from "./Pages/AdminInformation/ManageStudentAdmin/EnrollOfCoursesByAdmin/EnrollOfCoursesByAdmin";
import InfoOfEachCourseByTeacher from "./Pages/TeacherInformation/DashboardTeacher/InfoOfEachCourseByTeacher/InfoOfEachCourseByTeacher";
import InfoStudentsNameAndGrade from "./Pages/TeacherInformation/CoursesScheduled/InfoStudentsNameAndGrade/InfoStudentsNameAndGrade";
import EditStudentGrade from "./Pages/TeacherInformation/CoursesScheduled/EditStudentGrade/EditStudentGrade";
import StudyScheduleTeacher from "./Pages/TeacherInformation/ManageGuidance/StudyScheduleTeacher/StudyScheduleTeacher";
import CourseResultsByTeachers from "./Pages/TeacherInformation/ManageGuidance/StudyScheduleTeacher/CourseResultsByTeachers/CourseResultsByTeachers";
import AvailableCourses from "./Pages/TeacherInformation/ManageGuidance/StudyScheduleTeacher/AvailableCourses/AvailableCourses";
import StudentChat from "./Pages/StudentInformation/StudentChat/StudentChat";
import ForgetPassword from "./Pages/Auth/ForgetPassword";
import ChangePassword from "./Pages/Auth/ChangePassword";
import ResetPassword from "./Pages/Auth/ResetPassword";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Select />,
  },
  {
    path: "/Login",
    element: <Login />,
  },
  {
    path: "/SuperAdminRole",
    element: <SidebarSuperAdmin />, // جعل الـ Sidebar هو الأب
    children: [
      {
        path: "", // المسار الفارغ يعني الصفحة الرئيسية داخل هذا القسم
        element: <DashboardSuperAdmin />,
      },
      {
        path: "PersonalInformation",
        element: <PersonalInformation />,
      },
      {
        path: "ManageStudents",
        element: <ManageStudents />,
      },
      {
        path: "ManageSemesters",
        element: <ManageSemesters />,
      },
      {
        path: "ManageSemesters/AddSemester",
        element: <AddSemester />,
      },
      {
        path: "ManageSemesters/EditSemester/:semesterId",
        element: <EditSemester />,
      },
      {
        path: "ManageSemesters/InfoEashSemester/:semesterId",
        element: <InfoEashSemester />,
      },
      {
        path: "ManageSemesters/InfoEashSemester/InfoEachDepartmentSemester/:departmentId/:departmentName",
        element: <InfoEachDepartmentSemester />,
      },
      {
        path: "ManageSemesters/InfoEashSemester/InfoEachDepartmentSemester/InfoEachCourseInSemester/:courseId/:semesterId",
        element: <InfoEachCourseInSemester />,
      },
      {
        path: "ManageAdmins",
        element: <ManageAdmins />,
      },
      {
        path: "ManageCourses",
        element: <ManageCourses />,
      },
      {
        path: "ManageDepartments",
        element: <ManageDepartments />,
      },
      {
        path: "ManageTeachers",
        element: <ManageTeachers />,
      },
      {
        path: "ManageDepartments/AddDepartment",
        element: <AddDepartment />,
      },
      {
        path: "ManageCourses/AddCourse",
        element: <AddCourse />,
      },
      {
        path: "AddStudent",
        element: <AddStudent />,
      },
      {
        path: "ManageStudents/EditStudent/:studentId",
        element: <EditStudent />,
      },
      {
        path: "AddTeacher",
        element: <AddTeacher />,
      },
      {
        path: "ManageTeachers/EditTeacher/:teacherId",
        element: <EditTeacher />,
      },
      {
        path: "AddAdmin",
        element: <AddAdmin />,
      },
      {
        path: "ManageAdmins/EditAdmin/:adminId",
        element: <EditAdmin />,
      },
      {
        path: "ManageDepartments/EditDepartment/:departmentId",
        element: <EditDepartment />,
      },
      {
        path: "ManageCourses/EditCourse/:courseId",
        element: <EditCourse />,
      },
      {
        path: "ManageCourses/InfoCourse/:courseId",
        element: <InfoCourse />,
      },
      {
        path: "ManageTeachers/InfoTeacher/:teacherId", // إضافة المعرف :teacherId في المسار
        element: <InfoTeacher />,
      },
      {
        path: "ManageAdmins/InfoAdmin/:adminId", // إضافة المعرف :teacherId في المسار
        element: <InfoAdmin />,
      },
      {
        path: "ManageStudents/InfoStudent/:studentId", // إضافة المعرف :teacherId في المسار
        element: <InfoStudent />,
      },
      {
        path: "/SuperAdminRole/InfoEachDepartment/:departmentId/:departmentName", // إضافة المعرف :teacherId في المسار
        element: <InfoEachDepartment />,
      },
      {
        path: "/SuperAdminRole/InfoEachDepartment/InfoEachCourse/:courseId", // إضافة المعرف :teacherId في المسار
        element: <InfoEachCourse />,
      },
      {
        path: "/SuperAdminRole/InfoEachDepartment/EditEachCourse/:courseId", // إضافة المعرف :teacherId في المسار
        element: <EditEachCourse />,
      },
    ],
  },
  {
    path: "/StudentRole",
    element: <SidebarStudent />,
    children: [
      {
        path: "", // المسار الفارغ يعني الصفحة الرئيسية داخل هذا القسم
        element: <DashboardStudent />,
      },
      {
        path: "InfoEachCouseOfStudent/:courseId",
        element: <InfoEachCouseOfStudent />,
      },

      {
        path: "PersonalInformation",
        element: <PersonalInformation />,
      },
      {
        path: "EnrollOfCourses",
        element: <EnrollOfCourses />,
      },
      {
        path: "StudentChat",
        element: <StudentChat />,
      },
      {
        path: "StudySchedule",
        element: <StudySchedule />,
      },
      {
        path: "ExamSchedule",
        element: <ExamSchedule />,
      },
      {
        path: "CourseResults",
        element: <CourseResults />,
      },
    ],
  },
  {
    path: "/AdminRole",
    element: <SidebarAdmin />,
    children: [
      {
        path: "", // المسار الفارغ يعني الصفحة الرئيسية داخل هذا القسم
        element: <DashboardAdmin />,
      },
      {
        path: "PersonalInformation",
        element: <PersonalInformation />,
      },
      {
        path: "ManageStudentAdmin",
        element: <ManageStudentAdmin />,
      },
      {
        path: "/AdminRole/InfoEachDepartmentAdmin/:departmentId/:departmentName", // إضافة المعرف :teacherId في المسار
        element: <InfoEachDepartmentAdmin />,
      },
      {
        path: "/AdminRole/InfoEachDepartmentAdmin/InfoEachCourseAdmin/:courseId", // إضافة المعرف :teacherId في المسار
        element: <InfoEachCourseAdmin />,
      },

      {
        path: "ManageStudentAdmin/AddStudentAdmin",
        element: <AddStudentAdmin />,
      },
      {
        path: "ManageStudentAdmin/StudyScheduleAdmin/:studentId",
        element: <StudyScheduleAdmin />,
      },
      {
        path: "ManageStudentAdmin/CoursesResultAdmin/:studentId",
        element: <CoursesResultAdmin />,
      },
      {
        path: "ManageStudentAdmin/EnrollOfCoursesByAdmin/:studentId",
        element: <EnrollOfCoursesByAdmin />,
      },
      {
        path: "ManageStudentAdmin/EditStudentAdmin/:studentId",
        element: <EditStudentAdmin />,
      },
      {
        path: "ManageStudentAdmin/InfoStudentAdmin/:studentId",
        element: <InfoStudentAdmin />,
      },
    ],
  },
  {
    path: "/TeacherRole",
    element: <SidebarTeacher />,
    children: [
      {
        path: "", // المسار الفارغ يعني الصفحة الرئيسية داخل هذا القسم
        element: <DashboardTeacher />,
      },
      {
        path: "/TeacherRole/InfoOfEachCourseByTeacher/:courseId", // المسار الفارغ يعني الصفحة الرئيسية داخل هذا القسم
        element: <InfoOfEachCourseByTeacher />,
      },
      {
        path: "/TeacherRole/CoursesScheduled/InfoStudentsNameAndGrade/:courseId", // المسار الفارغ يعني الصفحة الرئيسية داخل هذا القسم
        element: <InfoStudentsNameAndGrade />,
      },
      {
        path: "/TeacherRole/CoursesScheduled/InfoStudentsNameAndGrade/EditStudentGrade/:enrollmentTableId/:courseId", // المسار الفارغ يعني الصفحة الرئيسية داخل هذا القسم
        element: <EditStudentGrade />,
      },
      {
        path: "PersonalInformation",
        element: <PersonalInformation />,
      },
      {
        path: "CoursesScheduled",
        element: <CoursesScheduled />,
      },
      {
        path: "ManageGuidance",
        element: <ManageGuidance />,
      },
      {
        path: "/TeacherRole/ManageGuidance/StudyScheduleTeacher/:studentId",
        element: <StudyScheduleTeacher />,
      },
      {
        path: "/TeacherRole/ManageGuidance/StudyScheduleTeacher/CourseResultsByTeachers/:studentId",
        element: <CourseResultsByTeachers />,
      },
      {
        path: "/TeacherRole/ManageGuidance/StudyScheduleTeacher/AvailableCourses/:studentId",
        element: <AvailableCourses />,
      },
    ],
  },
  {
    path: "/auth/forget-password",
    element: <ForgetPassword />,
  },
  {
    path: "/auth/change-password",
    element: <ChangePassword />,
  },
  {
    path: "/auth/reset-password",
    element: <ResetPassword />,
  },
]);

function App() {
  return (
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
  );
}

export default App;
