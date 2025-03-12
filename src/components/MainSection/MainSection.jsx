import React, { useEffect, useState } from "react";
import s from "./MainSection.module.css";
import homeImg from "../../assets/homeimg/homeimg.jpg";
import homeSideImg from "../../assets/homeimg/homesideimg.jpg";
import homeSmallImg from "../../assets/homeimg/homesmallimg.jpg";

export const MainSection = () => {
  const [imgPosition, setImgPosition] = useState({ x: 0, y: 0 });
  const [rotate, setRotate] = useState({ x: 0, y: 0, scale: 1 });
  const [activeImage, setActiveImage] = useState(null); 
  
  useEffect(() => {
    const handleImgMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      setImgPosition({ x: mouseX, y: mouseY });
    };

    window.addEventListener("mousemove", handleImgMove);

    return () => {
      window.removeEventListener("mousemove", handleImgMove);
    };
  }, []);

  const handleImageMouseMove = (e, imgType) => {
    const rect = e.target.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    const angleX = -(deltaY / centerY) * 10; 
    const angleY = (deltaX / centerX) * 10; 

    setRotate({ x: angleX, y: angleY, scale: 1.1 });
    setActiveImage(imgType); 
  };

  const handleImageMouseLeave = () => {
    setRotate({ x: 0, y: 0, scale: 1 });
    setActiveImage(null); 
  };

  const offsetX = window.innerWidth > 960 ? (imgPosition.x - window.innerWidth / 2) / 20 : 0;
  const offsetY = window.innerWidth > 960 ? (imgPosition.y - window.innerHeight / 2) / 20 : 0;

  
  return (
    <div id="main" className={s.MainSection}>
      <div className={s.imgWrap}>
        <div className={s.homeImgWrap}>
        <img alt="main photo" className={s.homeImg}
          onMouseMove={(e) => handleImageMouseMove(e, "main")}
          onMouseLeave={handleImageMouseLeave}
          style={{
            transform: `${
              activeImage === "main" && window.innerWidth > 960
                ? `perspective(1000px) translate(${-offsetX}px, ${-offsetY}px) rotateX(${-rotate.x}deg) rotateY(${-rotate.y}deg)`
                : `perspective(1000px) translate(${-offsetX}px, ${-offsetY}px)`
            }`,
            transition: "transform 0.1s ease-out",
          }}
          src={homeImg}
        /></div>
        <div className={s.homeSideImgWrap}>
        <img alt="main side photo"
          onMouseMove={(e) => handleImageMouseMove(e, "side")}
          onMouseLeave={handleImageMouseLeave}
          style={{
            transform: `${
              activeImage === "side"
                ? `perspective(1000px) translate(${offsetX}px, ${offsetY}px) rotateX(${-rotate.x}deg) rotateY(${-rotate.y}deg)`
                : `perspective(1000px) translate(${offsetX}px, ${offsetY}px)`
            }`,
            transition: "transform 0.1s ease-out",
          }}
          className={s.homeSideImg}
          src={homeSideImg}
        /></div>
        <div className={s.homeSmallImgWrap}>
        <img alt="main small photo"
          onMouseMove={(e) => handleImageMouseMove(e, "small")}
          onMouseLeave={handleImageMouseLeave}
          style={{
            transform: `${
              activeImage === "small"
                ? `perspective(1000px) translate(${offsetX}px, ${offsetY}px) rotateX(${-rotate.x}deg) rotateY(${-rotate.y}deg)`
                : `perspective(1000px) translate(${offsetX}px, ${offsetY}px)`
            }`,
            transition: "transform 0.1s ease-out",
          }}
          className={s.homeSmallImg}
          src={homeSmallImg}
        /></div>
      </div>

      <div className={s.author}>
        <h1 className={s.name}>Dżamilla Tymińska</h1>
        <p className={s.profession}>creative photography</p>
      </div>
    </div>
  );
};
