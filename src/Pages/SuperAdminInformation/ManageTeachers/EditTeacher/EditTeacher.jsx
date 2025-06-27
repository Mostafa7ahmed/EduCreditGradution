import React, { useContext, useEffect, useState } from "react";
import styles from "../AddTeacher/AddTeacher.module.css";
import Inputs from "../../../../Shared/Css/InputsDesign.module.css";
import AddText from "../../../../Shared/Css/AddTextDesign.module.css";
import ButtonDesign from "../../../../Shared/Css/ButtonDesign.module.css";
import { authContext } from "../../../../Context/AuthContextProvider";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import axios from "axios";
import { baseUrl } from "../../../../Env/Env";
import * as Yup from "yup";

export default function EditTeacher() {
  let { accessToken } = useContext(authContext);
  const navigate = useNavigate();
  const { teacherId } = useParams(); // جلب teacherId من الـ URL
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [teacher, setTeacher] = useState({}); // لحفظ بيانات المعلم

  // جلب الأقسام
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${baseUrl}Department`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching Departments:", error.message);
      setError("Failed to fetch departments.");
    }
  };

  // جلب بيانات المعلم
  const fetchTeacher = async () => {
    try {
      const response = await axios.get(`${baseUrl}Teacher/${teacherId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Teacher data:", response);
      const teacherData = response.data.result;
      setTeacher(teacherData);
      // تعبئة النموذج ببيانات المعلم
      formik.setValues({
        fullName: teacherData.fullName || "",
        email: teacherData.email || "",
        address: teacherData.address || "",
        nationalId: teacherData.nationalId || "",
        phoneNumber: teacherData.phoneNumber || "",
        gender: teacherData.gender || "",
        birthDate: teacherData.birthDate
          ? new Date(teacherData.birthDate).toISOString().split("T")[0]
          : "",
        departmentId: teacherData.departmentId || "",
      });
    } catch (error) {
      console.error("Error fetching teacher:", error.message);
      setError("Failed to fetch teacher data.");
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchTeacher();
  }, []);

  // التحقق من صحة الإدخال
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

  // Formik إعداد
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
    onSubmit: async (values) => {
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
          departmentId: values.departmentId,
        };

        console.log("Payload:", payload);
        const response = await axios.put(
          `${baseUrl}Teacher/${teacherId}`,
          payload,
          {
            headers: {
              Accept: "text/plain", // نفس الـ headers اللي في EditStudent
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("Updated successfully:", response.data);
        alert("Teacher updated successfully!");
        navigate("/SuperAdminRole/ManageTeachers");
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "An unexpected error occurred";
        console.error("Error updating teacher:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className={Inputs.container}>
      <div className={Inputs.text}>
        <span className={AddText.text}>Edit</span> Teacher
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
          <div className={Inputs.error}>{formik.errors.fullName}</div>
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
          <div className={Inputs.error}>{formik.errors.address}</div>
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
            <div className={Inputs.error}>{formik.errors.phoneNumber}</div>
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
            <div className={Inputs.error}>{formik.errors.nationalId}</div>
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
          <div className={Inputs.error}>{formik.errors.email}</div>
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
          onBlur={formik.handleBlur}
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
          <div className={Inputs.error}>{formik.errors.departmentId}</div>
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
            onBlur={formik.handleBlur}
          />
          {formik.touched.birthDate && formik.errors.birthDate && (
            <div className={Inputs.error}>{formik.errors.birthDate}</div>
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
            <div className={Inputs.error}>{formik.errors.gender}</div>
          )}
        </div>
      </div>

      {/* رسالة الخطأ إذا وجدت */}
      {error && <div className={Inputs.error}>{error}</div>}

      {/* Submit Button */}
      <div className={ButtonDesign.button}>
        <button type="submit" disabled={isLoading}>
          {isLoading ? <i className="fas fa-spin fa-spinner"></i> : "Edit"}
        </button>
      </div>
    </form>
  );
}
