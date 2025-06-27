import React, { useEffect, useState } from "react";
import styles from "./PersonalInformation.module.css";
import Information from "../../../src/Shared/Css/InfoAndInformation.module.css";
import axios from "axios";

export default function PersonalInformation() {
  const [userData, setUserData] = useState({
    name: "",
    phoneNumber: "",
    gender: "",
    email: "",
    birthDate: "",
    address: "",
    nationalId: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token =
          localStorage.getItem("accesstoken") || authContextaccessToken;
        if (!token) {
          throw new Error("No token found. Please log in again.");
        }

        // جلب البيانات باستخدام Axios
        const response = await axios.get(
          "https://educredit.runasp.net/api/User/GetUserInfo",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Fetched Data:", response.data);

        // تحديث البيانات
        setUserData({
          name: response.data.fullName || "",
          phoneNumber: response.data.phoneNumber || "",
          gender: response.data.gender || "",
          email: response.data.email || "",
          birthDate: response.data.birthDate || "",
          address: response.data.address || "",
          nationalId: response.data.nationalId || "",
        });
      } catch (error) {
        // معالجة الأخطاء
        if (error.response) {
          // الـ API أرجع استجابة مع خطأ (مثل 401 Unauthorized)
          setError(
            `Error ${error.response.status}: ${
              error.response.data.message || "Failed to fetch user data"
            }`
          );
        } else if (error.request) {
          // لم يتم تلقي استجابة من الـ API (مشكلة في الشبكة)
          setError("Network error: Could not reach the server.");
        } else {
          // أخطاء أخرى (مثل خطأ في الكود)
          setError(error.message);
        }
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);
  return (
    <div className={Information.personalInfoContainer}>
      <h1 className={Information.welcomeTitle}>
        Welcome, {userData.name?.split(" ")[0] || "Loading..."}
      </h1>

      <div className={`${Information.line}`}></div>

      <div className={Information.row}>
        <span className={`${Information.Lable}`}>Name</span>
        <span className={`${Information.data}`}>
          {userData.name || "Loading..."}
        </span>
      </div>

      <div className={Information.row}>
        <span className={`${Information.Lable}`}>Phone Number</span>
        <span className={`${Information.data}`}>
          {userData.phoneNumber || "Loading..."}
        </span>
      </div>

      <div className={Information.row}>
        <span className={`${Information.Lable}`}>Gender</span>
        <span className={`${Information.data}`}>
          {userData.gender || "Loading..."}
        </span>
      </div>

      <div className={Information.row}>
        <span className={`${Information.Lable}`}>Email</span>
        <span className={`${Information.data}`}>
          {userData.email || "Loading..."}
        </span>
      </div>

      <div className={Information.row}>
        <span className={`${Information.Lable}`}>Birth Date</span>
        <span className={`${Information.data}`}>
          {userData.birthDate || "Loading..."}
        </span>
      </div>

      <div className={Information.row}>
        <span className={`${Information.Lable}`}>Address</span>
        <span className={`${Information.data}`}>
          {userData.address || "Loading..."}
        </span>
      </div>

      <div className={Information.row}>
        <span className={`${Information.Lable}`}>National ID</span>
        <span className={`${Information.data}`}>
          {userData.nationalId || "Loading..."}
        </span>
      </div>
    </div>
  );
}
