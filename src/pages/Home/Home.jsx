import React, { useEffect, useRef, useState } from "react";
import s from "./Home.module.css";

import { MainSection } from "../../components/MainSection/MainSection";
import { Works } from "../../components/Works/Works";

import { About } from "../../components/About/About";
import { BlockContainer } from "../../components/Elements/BlockContainer/BlockContainer";
import { Contacts } from "../../components/Contacts/Contacts";
import { SideNav } from "../../components/Elements/SideNav/SideNav";

export const Home = () => {
  const scrollRef = useRef(null);
  const [activeSection, setActiveSection] = useState("main");

  const handleScroll = (event) => {
    const container = scrollRef.current;
    if (!container) return;

    // const containerWidth = container.offsetWidth;

    if (window.innerWidth > 1280) {
      event.preventDefault(); // Блокуємо стандартний скрол тільки для великих екранів
      const containerHeight = container.offsetHeight;
      container.scrollTop +=
        event.deltaY > 0 ? containerHeight : -containerHeight;
    }
  };

  // Додаємо обробник події тільки якщо ширина > 1280px
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;

    if (containerWidth > 1280) {
      container.addEventListener("wheel", handleScroll, { passive: false });
    }

    return () => {
      container.removeEventListener("wheel", handleScroll);
    };
  }, []); // Виконуємо лише один раз при завантаженні

  useEffect(() => {
    const sections = document.querySelectorAll("div[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Ensure the activeSection only updates if the entry is fully visible
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id); // Update activeSection only if fully visible
          }
        });
      },
      {
        threshold: 0.5, // Adjust this value as necessary (0 means any visibility, 1 means fully visible)
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);
  return (
    <div className={s.container} ref={scrollRef} onWheel={handleScroll}>
      <SideNav activeSection={activeSection} sideLines={true} />
      <div id='main'>
        <BlockContainer children={<MainSection />} />
      </div>
      <div id='works'>
        <BlockContainer children={<Works />} />
      </div>
      <div id='about'>
        <BlockContainer children={<About />} />
      </div>
      <div id='contacts'>
        <BlockContainer children={<Contacts />} />
      </div>
    </div>
  );
};
