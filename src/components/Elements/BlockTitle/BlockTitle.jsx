import React from "react";
import s from "./BlockTitle.module.css";

export const BlockTitle = ({ title }) => {
  return <div className={s.title}>{title}</div>;
};
