import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../../../Env/Env";
import { authContext } from "../../../../Context/AuthContextProvider";
import Information from "../../../../Shared/Css/InfoAndInformation.module.css";

export default function InfoAdmin() {
  const { adminId } = useParams(); // استخراج adminId من الرابط
  const { accessToken } = useContext(authContext);
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get(`${baseUrl}Admin/${adminId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setAdminData(response.data.result);
      } catch (err) {
        setError("Failed to fetch admin data.");
      }
    };

    fetchAdminData();
  }, [adminId, accessToken]);

  return (
    <div className={Information.personalInfoContainer}>
      {adminData ? (
        <>
          <h1 className={Information.welcomeTitle}>{adminData.fullName}</h1>
          {error && <p className={Information.error}>{error}</p>}
          <div className={Information.row}>
            <span className={Information.Lable}>Phone Number</span>
            <span className={Information.data}>
              {adminData.phoneNumber || "N/A"}
            </span>
          </div>

          <div className={Information.row}>
            <span className={Information.Lable}>Gender</span>
            <span className={Information.data}>
              {adminData.gender || "N/A"}
            </span>
          </div>

          <div className={Information.row}>
            <span className={Information.Lable}>Email</span>
            <span className={Information.data}>{adminData.email || "N/A"}</span>
          </div>

          <div className={Information.row}>
            <span className={Information.Lable}>Birth Date </span>
            <span className={Information.data}>
              {adminData.birthDate || "N/A"}
            </span>
          </div>
          <div className={Information.row}>
            <span className={Information.Lable}>Address </span>
            <span className={Information.data}>
              {adminData.address || "N/A"}
            </span>
          </div>
          <div className={Information.row}>
            <span className={Information.Lable}>National Id </span>
            <span className={Information.data}>
              {adminData.nationalId || "N/A"}
            </span>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
