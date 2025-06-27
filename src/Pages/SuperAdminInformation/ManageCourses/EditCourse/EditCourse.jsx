import React, { useContext, useEffect, useState } from "react";
import Inputs from "../../../../Shared/Css/InputsDesign.module.css";
import AddText from "../../../../Shared/Css/AddTextDesign.module.css";
import ButtonDesign from "../../../../Shared/Css/ButtonDesign.module.css";
import { authContext } from "./../../../../Context/AuthContextProvider";
import { useFormik } from "formik";
import axios from "axios";
import { baseUrl } from "../../../../Env/Env";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";

export default function EditCourse() {
  const [course, setCourse] = useState({});
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultPreviousCourseId, setDefaultPreviousCourseId] = useState(null); // لحفظ الـ id بتاع Lurean

  let { accessToken } = useContext(authContext);
  const navigate = useNavigate();
  const { courseId } = useParams();

  useEffect(() => {
    fetchCourse();
    fetchDepartments();
  }, []);

  async function fetchCourse() {
    try {
      const response = await axios.get(`${baseUrl}Course/${courseId}`, {
        headers: {
          Accept: "text/plain",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Course data:", response.data.result);
      setCourse(response.data.result);
      formik.setValues({
        name: response.data.result.name || "",
        creditHours: response.data.result.creditHours || "",
        duration: response.data.result.duration || "",
        minimumDegree: response.data.result.minimumDegree || "",
        departmentId: response.data.result.department?.id || "",
        previousCourseId: response.data.result.previousCourseId || "",
      });
    } catch (error) {
      setError(error.message);
    }
  }

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
      console.log("Departments data:", response.data.result);
      setDepartments(response.data.result || []);

      // ابحث عن الكورس اللي اسمه "lurean" (بتجاهل الحروف الكبيرة والصغيرة)
      let lureanCourseId = null;
      for (const dept of response.data.result) {
        const lureanCourse = dept.courses.find(
          (course) => course.name.toLowerCase() === "lurean"
        );
        if (lureanCourse) {
          lureanCourseId = lureanCourse.id;
          break;
        }
      }
      setDefaultPreviousCourseId(lureanCourseId);
      console.log("Lurean Course ID:", lureanCourseId);
    } catch (error) {
      setError("Failed to fetch departments and courses.");
    }
  }

  const validationSchema = Yup.object({
    name: Yup.string()
      .matches(
        /^[A-Za-z\s]{3,50}$/,
        "Name must be 3-50 characters and contain only letters and spaces."
      )
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
    minimumDegree: Yup.number()
      .typeError("Minimum Degree must be a number")
      .required("Minimum Degree is required")
      .when("creditHours", (creditHours, schema) =>
        schema.max(
          creditHours * 100,
          `Minimum Degree must be less than ${creditHours * 100}`
        )
      ),
    departmentId: Yup.string().nullable(),
    previousCourseId: Yup.string().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      creditHours: "",
      duration: "",
      minimumDegree: "",
      departmentId: "",
      previousCourseId: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const payload = {
          name: values.name,
          creditHours: values.creditHours,
          duration: values.duration,
          minimumDegree: values.minimumDegree,
          departmentId: values.departmentId || course.id,
          previousCourseId:
            values.previousCourseId ||
            course.previousCourseId ||
            defaultPreviousCourseId ||
            null, // استخدام الـ id بتاع Lurean لو ما فيش قيمة
        };

        console.log("Payload:", payload);
        const response = await axios.put(
          `${baseUrl}Course/${courseId}`,
          payload,
          {
            headers: {
              Accept: "text/plain",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log("Updated successfully:", response.data);
        alert("Course Updated successfully");
        navigate("/SuperAdminRole/ManageCourses");
      } catch (error) {
        console.error(
          "Error updating course:",
          error.response?.data || error.message
        );
        const errorMessage =
          error.response?.data?.message || // لو فيه حقل message
          "An unexpected error occurred"; // رسالة افتراضية
        setError(errorMessage);
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
          <span className={AddText.text}>Edit</span> Course
        </div>
        <div className={AddText.line}></div>

        {/* Course Name */}
        <div className={Inputs.inputContainer}>
          <label htmlFor="name">Course Name</label>
          <input
            type="text"
            id="name"
            name="name"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
          />
          {formik.errors.name && formik.touched.name && (
            <p className="text-red-500 text-sm">{formik.errors.name}</p>
          )}
        </div>

        {/* Credit Hours */}
        <div className={Inputs.inputContainer}>
          <label htmlFor="creditHours">Credit Hours</label>
          <input
            type="number"
            id="creditHours"
            name="creditHours"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.creditHours}
          />
          {formik.errors.creditHours && formik.touched.creditHours && (
            <p className="text-red-500 text-sm">{formik.errors.creditHours}</p>
          )}
        </div>

        {/* Duration */}
        <div className={Inputs.inputContainer}>
          <label htmlFor="duration">Duration</label>
          <input
            type="number"
            id="duration"
            name="duration"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.duration}
          />
          {formik.errors.duration && formik.touched.duration && (
            <p className="text-red-500 text-sm">{formik.errors.duration}</p>
          )}
        </div>

        {/* Minimum Degree */}
        <div className={Inputs.inputContainer}>
          <label htmlFor="minimumDegree">Minimum Degree</label>
          <input
            type="number"
            id="minimumDegree"
            name="minimumDegree"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.minimumDegree}
          />
          {formik.errors.minimumDegree && formik.touched.minimumDegree && (
            <p className="text-red-500 text-sm">
              {formik.errors.minimumDegree}
            </p>
          )}
        </div>

        {/* Department Selection */}
        <div className={Inputs.inputContainer}>
          <label htmlFor="departmentId">Department Name</label>
          <select
            id="departmentId"
            name="departmentId"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.departmentId || course.department?.id || ""}
          >
            <option value={course.department?.id || ""}>
              {course.departmentName || "Select Department"}
            </option>
            {departments
              .filter((dept) => dept.id !== course.department?.id)
              .map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.departmentName}
                </option>
              ))}
          </select>
          {formik.errors.departmentId && formik.touched.departmentId && (
            <p className="text-red-500 text-sm">{formik.errors.departmentId}</p>
          )}
        </div>

        {/* Previous Course Selection */}
        <div className={Inputs.inputContainer}>
          <label htmlFor="previousCourseId">Previous Course Name</label>
          <select
            id="previousCourseId"
            name="previousCourseId"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={
              formik.values.previousCourseId ||
              course.previousCourseId ||
              defaultPreviousCourseId ||
              ""
            }
            disabled={!formik.values.departmentId}
          >
            <option
              value={course.previousCourseId || defaultPreviousCourseId || ""}
            >
              {course.previousCourseName || "None"}
            </option>
            {filteredCourses
              .filter(
                (courseItem) =>
                  courseItem.id !==
                  (course.previousCourseId || defaultPreviousCourseId)
              )
              .map((courseItem) => (
                <option key={courseItem.id} value={courseItem.id}>
                  {courseItem.name}
                </option>
              ))}
          </select>
          {formik.errors.previousCourseId &&
            formik.touched.previousCourseId && (
              <p className="text-red-500 text-sm">
                {formik.errors.previousCourseId}
              </p>
            )}
        </div>

        {/* Submit Button */}
        <div className={ButtonDesign.button}>
          <button type="submit" disabled={isLoading}>
            {isLoading ? <i className="fas fa-spin fa-spinner"></i> : "Edit"}
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </form>
  );
}
