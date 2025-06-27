import React, { useContext, useState } from "react";
import Image from "../../../assets/Images/LoginImage/Frame 3.png";
import { logo } from "../../../assets/Icons/Logo";
import { Link, useNavigate } from "react-router-dom";
import LoginStyle from "./Login.module.css";
import { authContext } from "../../../Context/AuthContextProvider";
import * as Yup from "yup";
import { useFormik } from "formik";
import LoginService from "../../../Service/LoginService";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { baseUrl } from "../../../Env/Env";

export default function Login() {
  let { setaccessToken, setrefreshToken, setDecodedToken } =
    useContext(authContext);
  const navigate = useNavigate();
  const [ErrorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); //spinner

  const validateSchema = Yup.object().shape({
    email: Yup.string().email("Email is invalid").required("Email is required"),
    password: Yup.string()
      .matches(
        /^\d{6,15}$/,
        "Password must start with a letter and be 6-15 characters"
      )
      .required("Password is required"),
  });

  async function handleLogin(values) {
    setIsLoading(true);
    console.log("🟡 Sending Login Request with:", values);
    try {
      const res = await axios.post(`${baseUrl}Account/login`, values);
      // console.log("🔵 Response received:", res);

      if (res.data.result.accessToken) {
        const decoded = jwtDecode(res.data.result.accessToken);
        console.log("🔵 Decoded Token Data:", decoded.role);
        navigate(`/${decoded.role}`);

        // ✅ Save Tokens
        localStorage.setItem("accesstoken", res.data.result.accessToken);
        localStorage.setItem("refreshtoken", res.data.result.refreshToken);
        setaccessToken(res.data.result.accessToken);
        setrefreshToken(res.data.result.refreshToken);
        setDecodedToken(decoded); // Save decoded token in context

        setIsLoading(false);
        setErrorMessage(null);

        // ✅ Navigate to PersonalInformation after successful login
      } else {
        setIsLoading(false);
        throw new Error("Login failed! Invalid response from server.");
      }
    } catch (error) {
      console.error("Login failed", error.response.data.result.errorMessage);
      const errorMsg = error.response.data.result.errorMessage;
      setErrorMessage(errorMsg);
      setIsLoading(false);
    }
  }

  let formikLoginStudent = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: handleLogin,
    validationSchema: validateSchema,
  });

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className={`${LoginStyle.Card}`}>
        <div className={`${LoginStyle.LeftSection}`}>
          <img
            src={Image}
            alt="Books and Icons"
            className={`${LoginStyle.Image}`}
          />
        </div>
        <div className={`${LoginStyle.RightSection}`}>
          <div className={`${LoginStyle.Logo}`}>{logo}</div>
          <h1 className={`${LoginStyle.Title}`}>WELCOME BACK!</h1>
          <p className={`${LoginStyle.Subtitle}`}>
            Access your personal account by logging in.
          </p>
          <form
            className={`${LoginStyle.Form}`}
            onSubmit={formikLoginStudent.handleSubmit}
          >
            <div className={`${LoginStyle.InputGroup}`}>
              <label htmlFor="email">Email</label>
              <div className={`${LoginStyle.InputWrapper}`}>
                <i className="fa-solid fa-envelope"></i>
                <input
                  name="email"
                  value={formikLoginStudent.values.email}
                  onChange={formikLoginStudent.handleChange}
                  onBlur={formikLoginStudent.handleBlur}
                  type="email"
                  id="email"
                  placeholder="Enter Email"
                  className={`${LoginStyle.Input} placeholder-[#00000099]`}
                />
              </div>

              {formikLoginStudent.errors.email &&
              formikLoginStudent.touched.email ? (
                <div>
                  <span className="font-medium text-[red]">
                    {formikLoginStudent.errors.email}
                  </span>
                </div>
              ) : null}
            </div>

            <div className={`${LoginStyle.InputGroup}`}>
              <label htmlFor="password">Password</label>
              <div className={`${LoginStyle.InputWrapper}`}>
                <i className="fa-solid fa-lock"></i>
                <input
                  name="password"
                  value={formikLoginStudent.values.password}
                  onChange={formikLoginStudent.handleChange}
                  onBlur={formikLoginStudent.handleBlur}
                  type="password"
                  id="password"
                  placeholder="Enter Password"
                  className={`${LoginStyle.Input} placeholder-[#00000099]`}
                />
              </div>

              {formikLoginStudent.errors.password &&
              formikLoginStudent.touched.password ? (
                <div>
                  <span className="font-medium text-[red]">
                    {formikLoginStudent.errors.password}
                  </span>
                </div>
              ) : null}

              {ErrorMessage && (
                <div className="text-center text-[red]">
                  <span className="font-medium">{ErrorMessage}</span>
                </div>
              )}
            </div>

            <div className={`${LoginStyle.Options}`}>
              <label className={`${LoginStyle.RememberMe}`}>
                <input type="checkbox" /> {/* radio -> checkbox */}
                Remember Me
              </label>
              <Link
                to="/auth/forget-password"
                className={`${LoginStyle.ForgotPassword}`}
              >
                Forgot Password?
              </Link>
            </div>
            <button type="submit" className={`${LoginStyle.LoginButton}`}>
              {isLoading ? <i className="fas fa-spin fa-spinner"></i> : "Login"}
            </button>
            <Link to="/">
              <button type="button" className={`${LoginStyle.BackButton}`}>
                Back
              </button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
