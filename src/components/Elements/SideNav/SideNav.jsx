import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import s from "./SideNav.module.css";
import { TfiLayoutLineSolid } from "react-icons/tfi";

export const SideNav = ({ activeSection, sideLines }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {}, [isOpen]);
  return (
    <>
      <div className={s.wrap} onClick={() => setIsOpen(!isOpen)}>
        <span className={`${s.burger} ${isOpen ? s.active : ""}`}></span>
      </div>
      {sideLines && window.innerWidth > 1280 && (
        <ul className={s.navPoints}>
          <a href='#main'>
            <TfiLayoutLineSolid
              className={activeSection === "main" ? s.navLineActive : s.navLine}
            />
          </a>
          <a href='#works'>
            <TfiLayoutLineSolid
              className={
                activeSection === "works" ? s.navLineActive : s.navLine
              }
            />
          </a>
          <a href='#about'>
            <TfiLayoutLineSolid
              className={
                activeSection === "about" ? s.navLineActive : s.navLine
              }
            />
          </a>
          <a href='#contacts'>
            <TfiLayoutLineSolid
              className={
                activeSection === "contacts" ? s.navLineActive : s.navLine
              }
            />
          </a>
        </ul>
      )}
      {isOpen && (
        <div className={s.overlay} onClick={() => setIsOpen(false)}>
          <div className={s.nameNSubtitle}>
            <h1 className={s.name}>
              <a
                href='#main'
                onClick={() => {
                  setIsOpen(!isOpen);
                  navigate("/#main");
                }}
              >
                Dżamilla Tymińska{" "}
              </a>
            </h1>
            <span className={s.subtitle}>creative photography</span>
          </div>
          <ul className={s.navLinks}>
            <li
              onClick={() => {
                setIsOpen(!isOpen);
                navigate("/#works");
              }}
            >
              <a href='#works'>portfolio</a>
            </li>
            <li
              onClick={() => {
                setIsOpen(!isOpen);
                navigate("/#about");
              }}
            >
              <a href='#about'>about</a>
            </li>
            <li
              onClick={() => {
                setIsOpen(!isOpen);
                navigate("/#contact");
              }}
            >
              <a href='#contacts'>contact</a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};
