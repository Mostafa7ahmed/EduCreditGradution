import React, { useContext, useEffect, useState } from "react";
import styles from "./AddTeacher.module.css";
import Inputs from "../../../../Shared/Css/InputsDesign.module.css";
import AddText from "../../../../Shared/Css/AddTextDesign.module.css";
import ButtonDesign from "../../../../Shared/Css/ButtonDesign.module.css";
import { authContext } from "../../../../Context/AuthContextProvider";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import axios from "axios";
import { baseUrl } from "../../../../Env/Env";
import * as Yup from "yup";

export default function AddTeacher() {
  let { accessToken } = useContext(authContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${baseUrl}Department`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setDepartments(response.data.data);
    } catch (error) {
      console.error("Error fetching Departments:", error.message);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const validateSchema = Yup.object().shape({
    fullName: Yup.string()
      .matches(/^[A-Za-z\s]{3,50}$/, "Full name must be 3-50 letters.")
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid Email format")
      .required("Email is required"),
    address: Yup.string().required("Address is required"),
    nationalId: Yup.string()
      .matches(/^\d{10,15}$/, "National ID must be 10-15 digits")
      .required("National ID is required"),
    phoneNumber: Yup.string()
      .matches(/^\+?[0-9]{10,15}$/, "Phone number must be 10-15 digits")
      .required("Phone number is required"),
    gender: Yup.string()
      .oneOf(["Male", "Female"], "Invalid gender")
      .required("Gender is required"),
    birthDate: Yup.date()
      .max(
        new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
        "Must be at least 18 years old"
      )
      .required("Birth date is required"),
    departmentId: Yup.string().required("Department is required"),
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
      departmentId: "",
    },
    validationSchema: validateSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      setError("");
      try {
        const response = await axios.post(
          `${baseUrl}Account/UserRegistration?role=2&RedirectUrl=https%3A%2F%2Fwww.google.com.eg%2F`,
          values,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          alert("Teacher added successfully!");
          resetForm();
          navigate("/SuperAdminRole/ManageTeachers");
        } else {
          throw new Error("Failed to add Teacher");
        }
      } catch (error) {
        setError("Error adding Teacher. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className={Inputs.container}>
      <div className={Inputs.text}>
        <span className={AddText.text}>Add</span> New Teacher
      </div>
      <div className={AddText.line}></div>

      {/* Full Name */}
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
          <div className="text-red-500 text-sm mt-1">
            {formik.errors.fullName}
          </div>
        )}
      </div>

      {/* Address */}
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
          <div className="text-red-500 text-sm mt-1">
            {formik.errors.address}
          </div>
        )}
      </div>

      {/* Phone & National ID */}
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
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.phoneNumber}
            </div>
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
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.nationalId}
            </div>
          )}
        </div>
      </div>

      {/* Email */}
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
          <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
        )}
      </div>

      {/* Department */}
      <div className={Inputs.inputContainer}>
        <label htmlFor="departmentId">Department</label>
        <select
          id="departmentId"
          name="departmentId"
          value={formik.values.departmentId}
          onChange={formik.handleChange}
        >
          <option value="" disabled>
            Select Department
          </option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        {formik.touched.departmentId && formik.errors.departmentId && (
          <div className="text-red-500 text-sm mt-1">
            {formik.errors.departmentId}
          </div>
        )}
      </div>

      {/* Birth Date & Gender */}
      <div className={Inputs.inputRow}>
        <div className={Inputs.inputContainer}>
          <label htmlFor="birthDate">Birth Date</label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formik.values.birthDate}
            onChange={formik.handleChange}
          />
        </div>

        <div className={Inputs.inputContainer}>
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formik.values.gender}
            onChange={formik.handleChange}
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className={ButtonDesign.button}>
        <button type="submit" disabled={isLoading}>
          {isLoading ? <i className="fas fa-spin fa-spinner"></i> : "Submit"}
        </button>
      </div>
    </form>
  );
}
