import React, { useEffect, useState } from "react";
import s from "./SideNav.module.css";
import { FiAlignRight } from "react-icons/fi";

export const SideNav = ({ activeSection, sideLines }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {}, [isOpen]);
  return (
    <>
      <div className={s.wrap} onClick={() => setIsOpen(!isOpen)}>
        <span className={`${s.burger} ${isOpen ? s.active : ""}`}></span>
      </div>
      {sideLines && window.innerWidth > 1280 && (
        <ul className={s.navPoints}>
          <li className={activeSection === "main" ? s.active : ""}></li>
          <li className={activeSection === "works" ? s.active : ""}></li>
          <li className={activeSection === "about" ? s.active : ""}></li>
          <li className={activeSection === "contacts" ? s.active : ""}></li>
        </ul>
      )}
      {isOpen && (
        <div className={s.overlay}>
          <div>
            <h1 className={s.name}>Dżamilla Tymińska</h1>
            <span className={s.subtitle}>creative photography</span>
          </div>
          <ul className={s.navLinks}>
            <li onClick={() => setIsOpen(!isOpen)}>
              <a href='#works'>works</a>
            </li>
            <li onClick={() => setIsOpen(!isOpen)}>
              <a href='#about'>about</a>
            </li>
            <li onClick={() => setIsOpen(!isOpen)}>
              <a href='#contacts'>contacts</a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};
