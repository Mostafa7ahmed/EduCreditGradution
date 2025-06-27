import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // لاستيراد useParams
import axios from "axios";
import Information from "../../../../Shared/Css/InfoAndInformation.module.css";
import { baseUrl } from "../../../../Env/Env";
import { authContext } from "../../../../Context/AuthContextProvider";
import Button from "./InfoTeacher.module.css";
export default function InfoTeacher() {
  const { accessToken } = useContext(authContext);
  const { teacherId } = useParams(); // الحصول على المعرف من الـ URL
  const [userData, setUserData] = useState({
    fullName: "",
    phoneNumber: "",
    gender: "",
    email: "",
    birthDate: "",
    address: "",
    nationalId: "",
    departmentFullName: "",
    appointmentDate: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!teacherId) return; // التأكد من وجود teacherId

      try {
        const response = await axios.get(`${baseUrl}Teacher/${teacherId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setUserData(response.data.result);
      } catch (err) {
        setError("Failed to fetch teacher data.");
        console.error("Error fetching teacher data:", err.message);
      }
    };

    fetchTeacherData();
  }, [teacherId, accessToken]); // استخدام teacherId الذي يتم جلبه من URL

  return (
    <div className={Information.personalInfoContainer}>
      <h1 className={Information.welcomeTitle}>{userData.fullName || "N/A"}</h1>
      {error && <p className={Information.error}>{error}</p>}

      <div className={Information.row}>
        <span className={Information.Lable}>Phone Number</span>
        <span className={Information.data}>
          {userData.phoneNumber || "N/A"}
        </span>
      </div>

      <div className={Information.row}>
        <span className={Information.Lable}>Gender</span>
        <span className={Information.data}>{userData.gender || "N/A"}</span>
      </div>

      <div className={Information.row}>
        <span className={Information.Lable}>Email</span>
        <span className={Information.data}>{userData.email || "N/A"}</span>
      </div>

      <div className={Information.row}>
        <span className={Information.Lable}>Birth Date</span>
        <span className={Information.data}>{userData.birthDate || "N/A"}</span>
      </div>

      <div className={Information.row}>
        <span className={Information.Lable}>Address</span>
        <span className={Information.data}>{userData.address || "N/A"}</span>
      </div>

      <div className={Information.row}>
        <span className={Information.Lable}>National ID</span>
        <span className={Information.data}>{userData.nationalId || "N/A"}</span>
      </div>

      <div className={Information.row}>
        <span className={Information.Lable}>Department</span>
        <span className={Information.data}>
          {userData.departmentFullName || "N/A"}
        </span>
      </div>

      <div className={Information.row}>
        <span className={Information.Lable}>Appointment Date</span>
        <span className={Information.data}>
          {userData.appointmentDate || "N/A"}
        </span>
      </div>
      <button className={Button.button}>Course Scheduled</button>
      <button className={Button.button}>Manage Guidance</button>
    </div>
  );
}
