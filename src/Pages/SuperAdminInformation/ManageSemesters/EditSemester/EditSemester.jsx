import React, { useContext, useEffect, useState } from "react";
import Inputs from "../../../../Shared/Css/InputsDesign.module.css";
import AddText from "../../../../Shared/Css/AddTextDesign.module.css";
import ButtonDesign from "../../../../Shared/Css/ButtonDesign.module.css";
import { authContext } from "../../../../Context/AuthContextProvider";
import { useFormik } from "formik";
import axios from "axios";
import { baseUrl } from "../../../../Env/Env";
import * as Yup from "yup";
import { useParams } from "react-router-dom";
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

export default function EditSemester() {
  const { accessToken } = useContext(authContext);
  const { semesterId } = useParams();
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [initialValues, setInitialValues] = useState(null);

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
      setError("Failed to fetch departments and courses.");
    }
  };

  const fetchSemesterData = async () => {
    try {
      const res = await axios.get(`${baseUrl}Semester/${semesterId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = res.data.result;
      setInitialValues({
        semesterType: data.semesterType.toString(),
        year: data.year,
        startDate: data.startDate.split("T")[0],
        endDate: data.endDate.split("T")[0],
        enrollmentOpen: data.enrollmentOpen,
        enrollmentClose: data.enrollmentClose,
        departmentId: data.departmentId,
        courseIds: data.courseIds,
      });
    } catch (error) {
      console.error("Error fetching semester data:", error);
      setError("Failed to fetch semester details.");
    }
  };

  useEffect(() => {
    fetchDepartmentsWithCourses();
    fetchSemesterData();
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues || {
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
        await axios.put(
          `${baseUrl}Semester/${semesterId}`,
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
        alert("Semester updated successfully!");
      } catch (error) {
        console.error("Error updating semester:", error);
        alert("Failed to update semester");
      }
    },
  });

  const filteredCourses =
    departments.find((dept) => dept.id === formik.values.departmentId)
      ?.courses || [];

  if (!initialValues) {
    return <div className="text-center text-2xl">Loading...</div>;
  }

  return (
    <form onSubmit={formik.handleSubmit} className={Inputs.container}>
      <div className={Inputs.text}>
        <span className={AddText.text}>Edit</span> Semester
      </div>
      <div className={AddText.line}></div>

      <div className={Inputs.inputContainer}>
        <label htmlFor="semesterType">Semester Type</label>
        <select
          id="semesterType"
          name="semesterType"
          onChange={formik.handleChange}
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
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldValue("courseIds", []); // Reset courses when department changes
          }}
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
        <button type="submit">Edit</button>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </form>
  );
}
