import React, { useContext, useState, useEffect } from "react";
import styles from "./AddDepartment.module.css";
import Inputs from "../../../../Shared/Css/InputsDesign.module.css";
import AddText from "../../../../Shared/Css/AddTextDesign.module.css";
import ButtonDesign from "../../../../Shared/Css/ButtonDesign.module.css";
import { authContext } from "../../../../Context/AuthContextProvider";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import axios from "axios";
import { baseUrl } from "../../../../Env/Env";
import * as Yup from "yup";

export default function AddDepartment() {
  let { accessToken } = useContext(authContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // للتحكم في الـ spinner

  // التحقق من صحة الإدخال
  const validateSchema = Yup.object().shape({
    name: Yup.string()
      .matches(
        /^[A-Za-z\s]{3,50}$/,
        "Name must be 3-50 characters and contain only letters and spaces."
      )
      .required("Name is required"),
  });

  // إعداد formik
  const formik = useFormik({
    initialValues: { name: "" },
    validationSchema: validateSchema,
    onSubmit: async (values, { resetForm }) => {
      console.log("Submitting values:", values);
      setIsLoading(true);
      setError(""); // إعادة تعيين الخطأ

      try {
        const response = await axios.post(`${baseUrl}Department`, values, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log("Response:", response);

        if (response.status === 200 || response.status === 201) {
          alert("Department added successfully!");
          navigate("/SuperAdminRole/ManageDepartments");
          resetForm();
        } else {
          throw new Error("Failed to add department");
        }
      } catch (error) {
        console.error("Error:", error.message);
        setError("Error adding department. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  // لمتابعة أي تغيير في القيم
  useEffect(() => {
    console.log("Formik values:", formik.values);
  }, [formik.values]);

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className={Inputs.container}>
          <div className={Inputs.text}>
            <span className={AddText.text}>Add</span> New Department
          </div>
          <div className={AddText.line}></div>

          {/* Department Name */}
          <div className={Inputs.inputContainer}>
            <label htmlFor="name">Department Name</label>
            <input
              type="text"
              id="name"
              name="name"
              onChange={formik.handleChange}
              value={formik.values.name}
              required
            />
            {formik.errors.name && formik.touched.name && (
              <p className="text-red-500 text-sm">{formik.errors.name}</p>
            )}
          </div>

          {/* General Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit Button */}
          <div className={ButtonDesign.button}>
            <button type="submit" disabled={isLoading}>
              {isLoading ? (
                <i className="fas fa-spin fa-spinner"></i>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
