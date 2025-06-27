import React, { useContext, useEffect, useState } from "react";
import styles from "../AddAdmin/AddAdmin.module.css";
import Inputs from "../../../../Shared/Css/InputsDesign.module.css";
import AddText from "../../../../Shared/Css/AddTextDesign.module.css";
import ButtonDesign from "../../../../Shared/Css/ButtonDesign.module.css";
import { authContext } from "../../../../Context/AuthContextProvider";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import axios from "axios";
import { baseUrl } from "../../../../Env/Env";
import * as Yup from "yup";

export default function EditAdmin() {
  let { accessToken } = useContext(authContext);
  const navigate = useNavigate();
  const { adminId } = useParams();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [admin, setAdmin] = useState({});

  // جلب بيانات الأدمن
  const fetchAdmin = async () => {
    try {
      const response = await axios.get(`${baseUrl}Admin/${adminId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Admin data:", response.data.result);
      const adminData = response.data.result;
      setAdmin(adminData);
      // تعبئة النموذج ببيانات الأدمن
      formik.setValues({
        fullName: adminData.fullName || "",
        email: adminData.email || "",
        address: adminData.address || "",
        nationalId: adminData.nationalId || "",
        phoneNumber: adminData.phoneNumber || "",
        gender: adminData.gender || "",
        birthDate: adminData.birthDate
          ? new Date(adminData.birthDate).toISOString().split("T")[0]
          : "",
      });
    } catch (error) {
      console.error("Error fetching admin:", error.message);
      setError("Failed to fetch admin data.");
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  const validateSchema = Yup.object().shape({
    fullName: Yup.string()
      .matches(
        /^[A-Za-z\s]{3,50}$/,
        "FullName must be 3-50 characters and contain only letters and spaces."
      )
      .required("Name is required"),
    email: Yup.string()
      .email("invalid Email format")
      .required("Email is required"),
    address: Yup.string()
      .matches(
        /^[A-Za-z\s]{3,100}$/,
        "Address must be 3-100 characters and contain only letters and spaces."
      )
      .required("Address is required"),
    nationalId: Yup.string()
      .matches(/^\d{10,15}$/, "National ID must be 10-15 digits")
      .required("National ID is required"),
    phoneNumber: Yup.string()
      .matches(/^\+?[0-9]{10,15}$/, "Phone number must be 10-15 digits")
      .required("Phone number is required"),
    gender: Yup.string()
      .oneOf(["Male", "Female"], "Invalid gender selection")
      .required("Gender is required"),
    birthDate: Yup.date()
      .max(
        new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
        "You must be at least 18 years old"
      )
      .required("Birth date is required"),
  });

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      address: "",
      nationalId: "",
      phoneNumber: "",
      gender: "",
      birthDate: "",
    },
    validationSchema: validateSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      setError("");
      try {
        const payload = {
          fullName: values.fullName,
          email: values.email,
          address: values.address,
          nationalId: values.nationalId,
          phoneNumber: values.phoneNumber,
          gender: values.gender,
          birthDate: values.birthDate,
        };

        console.log("Payload:", payload);
        const response = await axios.put(
          `${baseUrl}Admin/${adminId}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("Updated successfully:", response.data);
        if (response.status === 200 || response.status === 201) {
          alert("Admin updated successfully!");
          navigate("/SuperAdminRole/ManageAdmins");
          resetForm();
        } else {
          throw new Error("Failed to update Admin");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Error updating Admin. Please try again.";
        console.error("Error updating admin:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className={Inputs.container}>
        <div className={Inputs.text}>
          <span className={AddText.text}>Edit</span> Admin
        </div>
        <div className={AddText.line}></div>

        <div className={Inputs.inputContainer}>
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formik.values.fullName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.fullName && formik.errors.fullName && (
            <div className="text-red-500">{formik.errors.fullName}</div>
          )}
        </div>

        <div className={Inputs.inputContainer}>
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.address && formik.errors.address && (
            <div className="text-red-500">{formik.errors.address}</div>
          )}
        </div>

        <div className={Inputs.inputRow}>
          <div className={Inputs.inputContainer}>
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <div className="text-red-500">{formik.errors.phoneNumber}</div>
            )}
          </div>

          <div className={Inputs.inputContainer}>
            <label htmlFor="nationalId">National Id</label>
            <input
              type="text"
              id="nationalId"
              name="nationalId"
              value={formik.values.nationalId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.nationalId && formik.errors.nationalId && (
              <div className="text-red-500">{formik.errors.nationalId}</div>
            )}
          </div>
        </div>

        <div className={Inputs.inputContainer}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-red-500">{formik.errors.email}</div>
          )}
        </div>

        <div className={Inputs.inputRow}>
          <div className={Inputs.inputContainer}>
            <label htmlFor="birthDate">Birth Date</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formik.values.birthDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.birthDate && formik.errors.birthDate && (
              <div className="text-red-500">{formik.errors.birthDate}</div>
            )}
          </div>

          <div className={Inputs.inputContainer}>
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {formik.touched.gender && formik.errors.gender && (
              <div className="text-red-500">{formik.errors.gender}</div>
            )}
          </div>
        </div>

        <div className={ButtonDesign.button}>
          <button type="submit" disabled={isLoading}>
            {isLoading ? <i className="fas fa-spin fa-spinner"></i> : "Edit"}
          </button>
        </div>

        {error && <div className="text-red-500 text-center mt-4">{error}</div>}
      </div>
    </form>
  );
}
