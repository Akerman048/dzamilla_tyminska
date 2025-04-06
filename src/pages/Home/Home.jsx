import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import s from "./Home.module.css";

import { MainSection } from "../../components/MainSection/MainSection";
import { Works } from "../../components/Works/Works";
import { About } from "../../components/About/About";
import { BlockContainer } from "../../components/Elements/BlockContainer/BlockContainer";
import { Contacts } from "../../components/Contacts/Contacts";
import { SideNav } from "../../components/Elements/SideNav/SideNav";
import { useLocation } from "react-router-dom";

export const Home = () => {
  const scrollRef = useRef(null);
  const [activeSection, setActiveSection] = useState("main");
  const [isScrolling, setIsScrolling] = useState(false);
  const location = useLocation();

useEffect(() => {
  if (location.state?.fromWorks) {
    const worksSection = document.getElementById("works");
    if (worksSection) {
      worksSection.scrollIntoView({ behavior: "smooth" });
    }

    // Очищаємо state, щоб не повторювалося
    window.history.replaceState({}, "");
  }
}, [location.state]);


  // Масив секцій для контролю скролу
  // ✅ Стабілізація масиву sections за допомогою useMemo()
  const sections = useMemo(
    () => ["main", "works", "about", "contacts"],
    [] // Масив sections не змінюється між рендерами
  );
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);


  const scrollToNextSection = useCallback(() => {
    if (currentSectionIndex < sections.length - 1) {
      setIsScrolling(true);
      setCurrentSectionIndex((prevIndex) => prevIndex + 1);

      const nextSection = document.getElementById(
        sections[currentSectionIndex + 1]
      );
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: "smooth" });

        // Додаємо затримку, щоб уникнути повторного скролу
        setTimeout(() => {
          setIsScrolling(false);
        }, 600); // Час залежить від тривалості анімації
      }
    }
  }, [currentSectionIndex, sections]);

  const scrollToPreviousSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setIsScrolling(true);
      setCurrentSectionIndex((prevIndex) => prevIndex - 1);

      const previousSection = document.getElementById(
        sections[currentSectionIndex - 1]
      );
      if (previousSection) {
        previousSection.scrollIntoView({ behavior: "smooth" });

        // Додаємо затримку перед повторним скролом
        setTimeout(() => {
          setIsScrolling(false);
        }, 600); // Час залежить від тривалості анімації
      }
    }
  }, [currentSectionIndex, sections]);

  const handleScroll = useCallback(
    (event) => {
      if (isScrolling) return; // Якщо вже йде скрол — ігноруємо подію

      event.preventDefault();

      if (event.deltaY > 0) {
        scrollToNextSection(); // Скрол вниз
      } else if (event.deltaY < 0) {
        scrollToPreviousSection(); // Скрол вгору
      }
    },
    [isScrolling , scrollToNextSection, scrollToPreviousSection] // ✅ Додаємо стабільні залежності
  );

  // Відстеження поточного компонента через IntersectionObserver
  useEffect(() => {
    const sectionElements = document.querySelectorAll("div[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            const newIndex = sections.indexOf(entry.target.id);
            if (newIndex !== -1) {
              setCurrentSectionIndex(newIndex);
            }
          }
        });
      },
      { threshold: 0.5 } // Відстежуємо тільки якщо компонент видно на 50%
    );

    sectionElements.forEach((section) => observer.observe(section));

    return () => {
      sectionElements.forEach((section) => observer.unobserve(section));
    };
  }, [sections]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#works") {
      const worksSection = document.getElementById("works");
      if (worksSection) {
        worksSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  // Додати обробник для мишки та тачпаду
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleScroll, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleScroll);
    };
  }, [currentSectionIndex, isScrolling, handleScroll]);


  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      const targetElement = document.querySelector(hash || "#works");
  
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    };
  
    window.addEventListener("popstate", handlePopState);
  
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  

  // Перехід до компонента з URL (#)
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
    <div className={s.container} ref={scrollRef}>
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
