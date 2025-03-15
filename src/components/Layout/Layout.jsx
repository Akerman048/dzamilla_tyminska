import React from "react";
import { Outlet } from "react-router-dom";
import s from "./Layout.module.css"

export const Layout = () => {
  return (
    <>
      <div className={s.container}>
        <Outlet />
      </div>
    </>
  );
};
