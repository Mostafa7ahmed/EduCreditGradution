import React, { useEffect, useState, useContext } from "react";
import Inputs from "../../../../Shared/Css/InputsDesign.module.css";
import AddText from "./EditStudentGrade.module.css";
import ButtonDesign from "../../../../Shared/Css/ButtonDesign.module.css";
import { useParams, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { authContext } from "../../../../Context/AuthContextProvider";
import { baseUrl } from "../../../../Env/Env";
import Swal from "sweetalert2";

export default function EditStudentGrade() {
  const { enrollmentTableId, courseId } = useParams();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [student, setStudent] = useState({ studentName: "", grade: "" });
  const { decodedToken, accessToken } = useContext(authContext);
  const [teacherId, setTeacherId] = useState(decodedToken?.userId || "");

  const fetchStudentData = async () => {
    if (!teacherId || !enrollmentTableId || !courseId) return;
    try {
      const response = await axios.get(
        `${baseUrl}Course/${teacherId}/courses`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Find the course by courseId
      const course = response.data.result.find(
        (course) => course.id === courseId
      );
      if (!course) {
        throw new Error("Course not found");
      }

      // Find the student by enrollmentTableId
      const studentData = course.students.find(
        (student) => student.enrollmentTableId === enrollmentTableId
      );
      if (!studentData) {
        throw new Error("Student not found");
      }

      // Update student state
      setStudent({
        studentName: studentData.studentName,
        grade: studentData.grade.toString(), // Convert to string for form input
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: `Failed to fetch student data: ${errorMessage}`,
        confirmButtonText: "Ok!",
      });
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [teacherId, enrollmentTableId, courseId]);

  useEffect(() => {
    if (decodedToken?.nameid) {
      setTeacherId(decodedToken.nameid);
    }
  }, [decodedToken]);

  const formik = useFormik({
    initialValues: {
      grade: student.grade || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      grade: Yup.number()
        .typeError("Grade must be a number")
        .required("Grade is required")
        .min(0, "Grade must be at least 0")
        .max(400, "Grade cannot exceed 400"),
    }),
    onSubmit: async (values) => {
      try {
        await axios.put(
          `${baseUrl}Enrollment/${enrollmentTableId}/${courseId}`,
          { grade: values.grade },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "text/plain",
            },
          }
        );
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Grade updated successfully!",
          confirmButtonText: "Ok!",
        });
        navigate(
          `/TeacherRole/CoursesScheduled/InfoStudentsNameAndGrade/${courseId}`
        );
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to update grade.";
        setError(errorMessage);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: errorMessage,
          confirmButtonText: "Ok!",
        });
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className={Inputs.container}>
        <div className={AddText.text}>
          <span className={AddText.text}>Assign</span>{" "}
          <span className={AddText.grade}>Grade to </span>
          <span>{student.studentName || "Loading..."}</span>
        </div>
        <div className={AddText.line}></div>

        {/* Grade input */}
        <div className={Inputs.inputContainer}>
          <label htmlFor="grade">Grade</label>
          <input
            type="text"
            id="grade"
            name="grade"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.grade}
          />
          {formik.errors.grade && formik.touched.grade && (
            <p className="text-red-500 text-sm">{formik.errors.grade}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className={ButtonDesign.button}>
          <button type="submit" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? (
              <i className="fas fa-spin fa-spinner"></i>
            ) : (
              "Edit"
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </form>
  );
}
