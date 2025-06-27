import React, { useContext, useEffect, useState } from "react";
import styles from "./AddCourse.module.css";
import Inputs from "../../../../Shared/Css/InputsDesign.module.css";
import AddText from "../../../../Shared/Css/AddTextDesign.module.css";
import ButtonDesign from "../../../../Shared/Css/ButtonDesign.module.css";
import { authContext } from "./../../../../Context/AuthContextProvider";
import { useFormik } from "formik";
import axios from "axios";
import { baseUrl } from "../../../../Env/Env";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

export default function AddCourse() {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken } = useContext(authContext);
  const navigate = useNavigate();

  async function fetchDepartments() {
    try {
      const response = await axios.get(
        `${baseUrl}Department/departments-with-courses`,
        {
          headers: {
            Accept: "text/plain",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setDepartments(response.data.result);
      const allCourses = response.data.result.flatMap((dept) => dept.courses);
      setCourses(allCourses);
    } catch (error) {
      setError("Failed to fetch departments and courses.");
    }
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .matches(/^[A-Za-z\s]+$/, "Name must contain only letters and spaces")
      .required("Name is required"),
    creditHours: Yup.number()
      .typeError("Credit Hours must be a number")
      .positive("Credit Hours must be a positive number")
      .test(
        "is-decimal",
        "Credit Hours must have at most 2 decimal places",
        (value) =>
          value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
      )
      .required("Credit Hours is required"),
    duration: Yup.number()
      .typeError("Duration must be a number")
      .positive("Duration must be a positive number")
      .required("Duration is required"),
    minimumDegree: Yup.number()
      .typeError("Minimum Degree must be a number")
      .positive("Minimum Degree must be positive")
      .required("Minimum Degree is required")
      .when("creditHours", (creditHours, schema) =>
        schema.max(
          creditHours * 100,
          `Minimum Degree must be less than ${creditHours * 100}`
        )
      ),
    departmentId: Yup.string().required("Department is required"),
    previousCourseId: Yup.string(), // optional
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      creditHours: "",
      duration: "",
      minimumDegree: "",
      previousCourseId: "",
      departmentId: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      setError("");

      // حذف previousCourseId لو مفيش قيمة
      const payload = {
        ...values,
        previousCourseId: values.previousCourseId || null,
      };

      try {
        const response = await axios.post(`${baseUrl}Course`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 200 || response.status === 201) {
          alert("Course added successfully!");
          resetForm();
          navigate("/SuperAdminRole/ManageCourses");
        } else {
          throw new Error("Failed to add course");
        }
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Error adding course. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  const filteredCourses =
    departments.find((dept) => dept.id === formik.values.departmentId)
      ?.courses || [];

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className={Inputs.container}>
        <div className={Inputs.text}>
          <span className={AddText.text}>Add</span> New Course
        </div>
        <div className={AddText.line}></div>

        <div className={Inputs.inputContainer}>
          <label htmlFor="name">Course Name</label>
          <input
            type="text"
            id="name"
            name="name"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
            required
          />
          {formik.errors.name && formik.touched.name && (
            <p className="text-red-500 text-sm">{formik.errors.name}</p>
          )}
        </div>

        <div className={Inputs.inputContainer}>
          <label htmlFor="creditHours">Credit Hours</label>
          <input
            type="number"
            id="creditHours"
            name="creditHours"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.creditHours}
            required
          />
          {formik.errors.creditHours && formik.touched.creditHours && (
            <p className="text-red-500 text-sm">{formik.errors.creditHours}</p>
          )}
        </div>

        <div className={Inputs.inputContainer}>
          <label htmlFor="duration">Duration</label>
          <input
            type="number"
            id="duration"
            name="duration"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.duration}
            required
          />
          {formik.errors.duration && formik.touched.duration && (
            <p className="text-red-500 text-sm">{formik.errors.duration}</p>
          )}
        </div>

        <div className={Inputs.inputContainer}>
          <label htmlFor="minimumDegree">Minimum Degree</label>
          <input
            type="number"
            id="minimumDegree"
            name="minimumDegree"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.minimumDegree}
            required
          />
          {formik.errors.minimumDegree && formik.touched.minimumDegree && (
            <p className="text-red-500 text-sm">
              {formik.errors.minimumDegree}
            </p>
          )}
        </div>

        <div className={Inputs.inputContainer}>
          <label htmlFor="departmentId">Department Name</label>
          <select
            id="departmentId"
            name="departmentId"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.departmentId}
            required
          >
            <option value="" disabled>
              Select Department Name
            </option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.departmentName}
              </option>
            ))}
          </select>
          {formik.errors.departmentId && formik.touched.departmentId && (
            <p className="text-red-500 text-sm">{formik.errors.departmentId}</p>
          )}
        </div>

        <div className={Inputs.inputContainer}>
          <label htmlFor="previousCourseId">Previous Course Name</label>
          <select
            id="previousCourseId"
            name="previousCourseId"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.previousCourseId || ""}
            disabled={!formik.values.departmentId}
          >
            <option value="">Select Previous Course Name (optional)</option>
            {filteredCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <div className={ButtonDesign.button}>
          <button type="submit" disabled={isLoading}>
            {isLoading ? <i className="fas fa-spin fa-spinner"></i> : "Submit"}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </form>
  );
}
