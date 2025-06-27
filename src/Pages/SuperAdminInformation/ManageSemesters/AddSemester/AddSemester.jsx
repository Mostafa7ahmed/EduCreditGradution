import React, { useContext, useEffect, useState } from "react";
import Inputs from "../../../../Shared/Css/InputsDesign.module.css";
import AddText from "../../../../Shared/Css/AddTextDesign.module.css";
import ButtonDesign from "../../../../Shared/Css/ButtonDesign.module.css";
import { authContext } from "../../../../Context/AuthContextProvider";
import { useFormik } from "formik";
import axios from "axios";
import { baseUrl } from "../../../../Env/Env";
import * as Yup from "yup";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormHelperText,
} from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";

export default function AddSemester() {
  const { accessToken } = useContext(authContext);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchDepartmentsWithCourses = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}Department/departments-with-courses`,
        {
          headers: {
            Accept: "text/plain",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setDepartments(res.data.result);
    } catch (error) {
      console.error("Error fetching departments with courses:", error);
    }
  };

  useEffect(() => {
    fetchDepartmentsWithCourses();
  }, []);

  const formik = useFormik({
    initialValues: {
      semesterType: "",
      startDate: "",
      endDate: "",
      enrollmentOpen: "",
      enrollmentClose: "",
      departmentId: "",
      courseIds: [],
    },
    validationSchema: Yup.object({
      semesterType: Yup.string().required("Semester Type is required"),
      startDate: Yup.date().required("Start Date is required"),
      endDate: Yup.date().required("End Date is required"),
      enrollmentOpen: Yup.string().required(
        "Enrollment Open date and time are required"
      ),
      enrollmentClose: Yup.string().required(
        "Enrollment Close date and time are required"
      ),
      departmentId: Yup.string().required("Department is required"),
      courseIds: Yup.array().min(1, "At least one course is required"),
    }),
    onSubmit: async (values) => {
      try {
        await axios.post(
          "https://educredit.runasp.net/api/Semester/AssignCoursesToSemester",
          {
            semesterType: values.semesterType,
            startDate: values.startDate,
            endDate: values.endDate,
            enrollmentOpen: values.enrollmentOpen,
            enrollmentClose: values.enrollmentClose,
            courseIds: values.courseIds,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        alert("Semester added successfully!");
        navigate("/SuperAdminRole/ManageSemesters");
        formik.resetForm();
      } catch (error) {
        console.error("Error submitting semester:", error);
        const errorMessage = error.response?.data?.message || error.message;
        alert(errorMessage);
      }
    },
  });

  const filteredCourses =
    departments.find((dept) => dept.id === formik.values.departmentId)
      ?.courses || [];

  useEffect(() => {
    if (formik.values.departmentId) {
      formik.setFieldValue("courseIds", []);
    }
  }, [formik.values.departmentId]);

  return (
    <form onSubmit={formik.handleSubmit} className={Inputs.container}>
      <div className={Inputs.text}>
        <span className={AddText.text}>Add</span> New Semester
      </div>
      <div className={AddText.line}></div>

      <div className={Inputs.inputContainer}>
        <label htmlFor="semesterType">Semester Type</label>
        <select
          id="semesterType"
          name="semesterType"
          onChange={(e) =>
            formik.setFieldValue("semesterType", Number(e.target.value))
          }
          value={formik.values.semesterType}
          className={Inputs.options}
        >
          <option value="" disabled>
            Select Semester Type
          </option>
          <option value="1">First Term</option>
          <option value="2">Second Term</option>
          <option value="3">Summer Course</option>
        </select>
        {formik.touched.semesterType && formik.errors.semesterType && (
          <div className="text-red-500 text-sm">
            {formik.errors.semesterType}
          </div>
        )}
      </div>

      <div className={Inputs.inputRow}>
        <div className={Inputs.inputContainer}>
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            onChange={formik.handleChange}
            value={formik.values.startDate}
          />
          {formik.touched.startDate && formik.errors.startDate && (
            <div className="text-red-500 text-sm">
              {formik.errors.startDate}
            </div>
          )}
        </div>
        <div className={Inputs.inputContainer}>
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            onChange={formik.handleChange}
            value={formik.values.endDate}
          />
          {formik.touched.endDate && formik.errors.endDate && (
            <div className="text-red-500 text-sm">{formik.errors.endDate}</div>
          )}
        </div>
      </div>

      <div className={Inputs.inputRow}>
        <div className={Inputs.inputContainer}>
          <label>Enrollment Open</label>
          <input
            type="datetime-local"
            name="enrollmentOpen"
            onChange={formik.handleChange}
            value={formik.values.enrollmentOpen}
            className="w-full"
          />
          {formik.touched.enrollmentOpen && formik.errors.enrollmentOpen && (
            <div className="text-red-500 text-sm">
              {formik.errors.enrollmentOpen}
            </div>
          )}
        </div>

        <div className={Inputs.inputContainer}>
          <label>Enrollment Close</label>
          <input
            type="datetime-local"
            name="enrollmentClose"
            onChange={formik.handleChange}
            value={formik.values.enrollmentClose}
            className="w-full"
          />
          {formik.touched.enrollmentClose && formik.errors.enrollmentClose && (
            <div className="text-red-500 text-sm">
              {formik.errors.enrollmentClose}
            </div>
          )}
        </div>
      </div>

      <div className={Inputs.inputContainer}>
        <label htmlFor="departmentId">Department</label>
        <select
          id="departmentId"
          name="departmentId"
          onChange={formik.handleChange}
          value={formik.values.departmentId}
          className={Inputs.options}
        >
          <option value="" disabled>
            Select Department
          </option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.departmentName}
            </option>
          ))}
        </select>
        {formik.touched.departmentId && formik.errors.departmentId && (
          <div className="text-red-500 text-sm">
            {formik.errors.departmentId}
          </div>
        )}
      </div>

      <FormControl
        fullWidth
        error={formik.touched.courseIds && Boolean(formik.errors.courseIds)}
        disabled={!formik.values.departmentId}
      >
        <InputLabel id="courseIds-label">Courses</InputLabel>
        <Select
          labelId="courseIds-label"
          id="courseIds"
          name="courseIds"
          multiple
          value={formik.values.courseIds || []}
          onChange={(e) => formik.setFieldValue("courseIds", e.target.value)}
          input={<OutlinedInput label="Courses" />}
          renderValue={(selected) =>
            filteredCourses
              .filter((course) => selected.includes(course.id))
              .map((course) => course.name)
              .join(", ")
          }
        >
          {filteredCourses.map((course) => (
            <MenuItem key={course.id} value={course.id}>
              <Checkbox
                checked={formik.values.courseIds?.includes(course.id)}
              />
              <ListItemText primary={course.name} />
            </MenuItem>
          ))}
        </Select>
        {formik.touched.courseIds && formik.errors.courseIds && (
          <FormHelperText>{formik.errors.courseIds}</FormHelperText>
        )}
      </FormControl>

      <div className={ButtonDesign.button}>
        <button type="submit">Submit</button>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </form>
  );
}
