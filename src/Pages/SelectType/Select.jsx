import React from "react";
import { logo } from "../../assets/Icons/Logo";
import { Link } from "react-router-dom";
import Style from "./Select.module.css";

export default function Select() {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center ">
        <div className={`${Style.SelectUser}`}>
          {/* اللوجو */}
          <div className="p-8">{logo}</div>
          <h1 className={`${Style.TextSelect} p-8 pb-0`}>Select User Type</h1>
          <div className={`${Style.line} rounded m-8 mt-0`}></div>
          {/* الكروت */}
          <div className={`${Style.CardsSelect}`}>
            {/* card 1  */}
            <Link to="/Login" className={`${Style.CardSelect}`}>
              <i className="fa-solid fa-user-gear fa-flip-horizontal"></i>
              <p className="font-semibold text-center ">Super Admin</p>
            </Link>
            {/* card 2  */}
            <Link to="/Login" className={`${Style.CardSelect}`}>
              <i className="fa-solid fa-user-shield fa-flip-horizontal"></i>
              <p className="font-semibold text-center ">Admin</p>
            </Link>
            {/* card 3  */}
            <Link to="/Login" className={`${Style.CardSelect}`}>
              <i className="fa-solid fa-user-tie"></i>
              <p className="font-semibold text-center ">Teacher</p>
            </Link>
            {/* card 4  */}
            <Link to="/Login" className={`${Style.CardSelect}`}>
              <i className="fa-solid fa-user-graduate fa-flip-horizontal"></i>
              <p className="font-semibold text-center ">Student</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
