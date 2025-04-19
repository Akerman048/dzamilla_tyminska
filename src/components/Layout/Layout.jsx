import React, {useEffect} from "react";
import { Outlet } from "react-router-dom";
import s from "./Layout.module.css"

export const Layout = () => {

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <>
      <div className={s.container}>
        <Outlet />
      </div>
    </>
  );
};
