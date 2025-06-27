import React, { useState, useEffect, useContext } from "react";
import Inputs from "../../../../Shared/Css/InputsDesign.module.css";
import ButtonDesign from "../../../../Shared/Css/ButtonDesign.module.css";
import styles from "./EditEachCourse.module.css";
import { authContext } from "./../../../../Context/AuthContextProvider";
import { useFormik } from "formik";
import axios from "axios";
import { baseUrl } from "../../../../Env/Env";
import { useNavigate, useParams } from "react-router-dom";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";

export default function EditEachCourse() {
  const { courseId } = useParams();
  const { accessToken } = useContext(authContext);
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [originalData, setOriginalData] = useState({});
  const [scheduleId, setScheduleId] = useState(null);
  const [schedualName, setSchedualName] = useState(null);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const formik = useFormik({
    initialValues: {
      teacherIds: [],
      day: "",
      lectureStart: "00:00",
      lectureEnd: "00:00",
      lectureLocation: "",
      examDate: "",
      examLocation: "",
      examStart: "00:00",
      examEnd: "00:00",
    },
    onSubmit: async (values) => {
      const payload = {
        teacherIds:
          values.teacherIds.length > 0
            ? values.teacherIds
            : [originalData.teacherId],
        day: values.day !== "" ? values.day : originalData.day,
        lectureStart:
          values.lectureStart !== ""
            ? `${values.lectureStart}:00`
            : (originalData.lectureStart?.slice(0, 5) || "00:00") + ":00",
        lectureEnd:
          values.lectureEnd !== ""
            ? `${values.lectureEnd}:00`
            : (originalData.lectureEnd?.slice(0, 5) || "00:00") + ":00",
        lectureLocation:
          values.lectureLocation !== ""
            ? values.lectureLocation
            : originalData.lectureLocation,
        examDate:
          values.examDate !== "" ? values.examDate : originalData.examDate,
        examLocation:
          values.examLocation !== ""
            ? values.examLocation
            : originalData.examLocation,
        examStart:
          values.examStart !== ""
            ? `${values.examStart}:00`
            : (originalData.examStart?.slice(0, 5) || "00:00") + ":00",
        examEnd:
          values.examEnd !== ""
            ? `${values.examEnd}:00`
            : (originalData.examEnd?.slice(0, 5) || "00:00") + ":00",
      };

      try {
        await axios.put(`${baseUrl}Schedule/${courseId}`, payload, {
          headers: {
            Accept: "text/plain",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const updatedCourseResponse = await axios.get(
          `${baseUrl}Schedule/${courseId}`,
          {
            headers: {
              Accept: "text/plain",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const updatedCourse = updatedCourseResponse.data.result;

        formik.setValues({
          teacherIds: updatedCourse.teacherIds,
          day: updatedCourse.day,
          lectureStart: updatedCourse.lectureStart?.slice(0, 5) || "00:00",
          lectureEnd: updatedCourse.lectureEnd?.slice(0, 5) || "00:00",
          lectureLocation: updatedCourse.lectureLocation || "",
          examDate: updatedCourse.examDate || "",
          examLocation: updatedCourse.examLocation || "",
          examStart: updatedCourse.examStart?.slice(0, 5) || "00:00",
          examEnd: updatedCourse.examEnd?.slice(0, 5) || "00:00",
        });

        alert("Schedule updated successfully!");
        navigate(
          `/SuperAdminRole/InfoEachDepartment/InfoEachCourse/${courseId}`
        );
      } catch (err) {
        console.error("Error updating course:", err);
        if (err.response && err.response.data && err.response.data.message) {
          alert(`Error: ${err.response.data.message}`);
        } else {
          alert("Something went wrong while updating the schedule.");
        }
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teachersResponse = await axios.get(`${baseUrl}Teacher`, {
          headers: {
            Accept: "text/plain",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const fetchedTeachers = teachersResponse.data.result.data;
        setTeachers(fetchedTeachers);

        const courseResponse = await axios.get(
          `${baseUrl}Schedule/${courseId}`,
          {
            headers: {
              Accept: "text/plain",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const course = courseResponse.data.result;
        setScheduleId(course.id);
        setOriginalData(course);
        setSchedualName(course.courseName);

        const matchedTeachers = fetchedTeachers.filter((teacher) =>
          course.teachersName?.includes(teacher.fullName)
        );

        formik.setValues({
          teacherIds: matchedTeachers.map((teacher) => teacher.id) || [],
          day: course.day || "",
          lectureStart: course.lectureStart?.slice(0, 5) || "00:00",
          lectureEnd: course.lectureEnd?.slice(0, 5) || "00:00",
          lectureLocation: course.lectureLocation || "",
          examDate: course.examDate || "",
          examLocation: course.examLocation || "",
          examStart: course.examStart?.slice(0, 5) || "00:00",
          examEnd: course.examEnd?.slice(0, 5) || "00:00",
        });

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [accessToken, courseId]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className={Inputs.container}>
        <div className={styles.title}>
          <span className={styles.text}>Edit</span> Schedule of
          <span className={styles.Data}> {schedualName} </span>
        </div>
        <div className={styles.line}></div>

        {/* Teachers Multi Select */}
        <div className={Inputs.inputContainer}>
          <FormControl fullWidth>
            <InputLabel id="teacherIds-label">Teachers</InputLabel>
            <Select
              labelId="teacherIds-label"
              id="teacherIds"
              name="teacherIds"
              multiple
              value={formik.values.teacherIds}
              onChange={(e) =>
                formik.setFieldValue("teacherIds", e.target.value)
              }
              input={<OutlinedInput label="Teachers" />}
              renderValue={(selected) =>
                teachers
                  .filter((teacher) => selected.includes(teacher.id))
                  .map((teacher) => teacher.fullName)
                  .join(", ")
              }
            >
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  <Checkbox
                    checked={formik.values.teacherIds.includes(teacher.id)}
                  />
                  <ListItemText primary={teacher.fullName} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Day Dropdown */}
        <div className={Inputs.inputContainer}>
          <label htmlFor="day">Day</label>
          <select
            id="day"
            name="day"
            onChange={formik.handleChange}
            value={formik.values.day}
            required
          >
            <option value="" disabled>
              Select a day
            </option>
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* Lecture Start & End */}
        <div className={Inputs.inputRow}>
          <div className={Inputs.inputContainer}>
            <label htmlFor="lectureStart">Lecture Start</label>
            <input
              type="time"
              id="lectureStart"
              name="lectureStart"
              onChange={formik.handleChange}
              value={formik.values.lectureStart}
            />
          </div>
          <div className={Inputs.inputContainer}>
            <label htmlFor="lectureEnd">Lecture End</label>
            <input
              type="time"
              id="lectureEnd"
              name="lectureEnd"
              onChange={formik.handleChange}
              value={formik.values.lectureEnd}
            />
          </div>
        </div>

        {/* Lecture Location */}
        <div className={Inputs.inputContainer}>
          <label htmlFor="lectureLocation">Lecture Location</label>
          <input
            type="text"
            id="lectureLocation"
            name="lectureLocation"
            onChange={formik.handleChange}
            value={formik.values.lectureLocation}
          />
        </div>

        {/* Exam Date & Location */}
        <div className={Inputs.inputRow}>
          <div className={Inputs.inputContainer}>
            <label htmlFor="examDate">Exam Date</label>
            <input
              type="date"
              id="examDate"
              name="examDate"
              onChange={formik.handleChange}
              value={formik.values.examDate}
            />
          </div>
          <div className={Inputs.inputContainer}>
            <label htmlFor="examLocation">Exam Location</label>
            <input
              type="text"
              id="examLocation"
              name="examLocation"
              onChange={formik.handleChange}
              value={formik.values.examLocation}
            />
          </div>
        </div>

        {/* Exam Start & End */}
        <div className={Inputs.inputRow}>
          <div className={Inputs.inputContainer}>
            <label htmlFor="examStart">Exam Start</label>
            <input
              type="time"
              id="examStart"
              name="examStart"
              onChange={formik.handleChange}
              value={formik.values.examStart}
            />
          </div>
          <div className={Inputs.inputContainer}>
            <label htmlFor="examEnd">Exam End</label>
            <input
              type="time"
              id="examEnd"
              name="examEnd"
              onChange={formik.handleChange}
              value={formik.values.examEnd}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className={ButtonDesign.button}>
          <button type="submit">Edit</button>
        </div>
      </div>
    </form>
  );
}
