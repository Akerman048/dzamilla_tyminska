import React, { useState, useEffect } from "react";
import { BlockTitle } from "../Elements/BlockTitle/BlockTitle";
import s from "./About.module.css";
import about1 from "../../assets/about/about1.jpg";
import about2 from "../../assets/about/about2.jpg";
import about3 from "../../assets/about/about3.jpg";

export const About = () => {
  const [imgPosition, setImgPosition] = useState({ x: 0, y: 0 });
  const [rotateImg, setRotateImg] = useState({ x: 0, y: 0, scale: 1 });
  const [activeImg, setActiveImg] = useState(null);

  useEffect(() => {
    const handleImgMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      setImgPosition({ x: mouseX, y: mouseY });
    };

    window.addEventListener('mousemove', handleImgMove);

    return(() => {
      window.removeEventListener('mousemove', handleImgMove);
    })
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

    setRotateImg({ x: angleX, y: angleY, scale: 1.1 });
    setActiveImg(imgType);
  };

  const handleImageMouseLeave = () => {
    setRotateImg({ x: 0, y: 0, scale: 1 });
    setActiveImg(null);
  };

  const offsetX = window.innerWidth > 960 ? (imgPosition.x - window.innerWidth / 2) / 20 : 0;
  const offsetY = (imgPosition.y - window.innerHeight / 2) / 20 ;
  return (
    <div className={s.container}>
      <div className={s.img1}>
        <img alt="about side 1"
          src={about1}
          onMouseMove={(e) => handleImageMouseMove(e, "1")}
          onMouseLeave={handleImageMouseLeave}
          style={{
            transform: `${
              activeImg === "1" && window.innerWidth > 960
                ? `perspective(1000px) translate(${-offsetX}px, ${-offsetY}px) rotateX(${-rotateImg.x}deg) rotateY(${-rotateImg.y}deg) `
                : `perspective(1000px) translate(${-offsetX}px, ${offsetY}px)`
            }`,transition: "transform 0.1s ease-out",
          }}
        />
      </div>
      <div className={s.img2}>
        <img alt="about side 2"
          src={about2}
          onMouseMove={(e) => handleImageMouseMove(e, "2")}
          onMouseLeave={handleImageMouseLeave}
          style={{
            transform: `${
              activeImg === "2" && window.innerWidth > 990
                ? `perspective(1000px) translate(${offsetX}px, ${offsetY}px) rotateX(${-rotateImg.x}deg) rotateY(${-rotateImg.y}deg) `
                : `perspective(1000px) translate(${offsetX}px, ${offsetY}px)`
            }`,
          }}
        />
      </div>
      <div className={s.img3}>
        <img alt="about side 3"
          src={about3}
          onMouseMove={(e) => handleImageMouseMove(e, "3")}
          onMouseLeave={handleImageMouseLeave}
          style={{
            transform: `${
              activeImg === "3" && window.innerWidth > 990
                ? `perspective(1000px) translate(${offsetX}px, ${offsetY}px) rotateX(${-rotateImg.x}deg) rotateY(${
                    rotateImg.y
                  }deg) `
                : `perspective(1000px) translate(${offsetX}px, ${offsetY}px)`
            }`,
          }}
        />
      </div>
      <BlockTitle title='About' />
      <div className={s.content}>
        <h2 className={s.title}>Dżamilla Tymińska</h2>
        <div>
          <p className={s.text}>
            I specialize in lifestyle and travel photography. I not only shoot
            in and around the streets of the city, but also in apartments,
            shops, parks – anywhere and everywhere my clients FEEL happy.
            Finding places that make people feel happy, as well as creating
            memories while we shoot. And that is what makes great photos!
            <p>
              My work in photography is a natural extension of my desire to tell
              stories. I’ve always been a nostalgic and romantic person, and I
              love that my work allows me to express those traits in such a
              meaningful way.
            </p>
          </p>
        </div>
        <div className={s.img}>
          <img alt="about" src={about3} />
        </div>
      </div>
    </div>
  );
};
