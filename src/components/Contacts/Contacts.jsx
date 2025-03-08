import React, { useState, useEffect } from "react";
import s from "./Contacts.module.css";
import { BlockTitle } from "../Elements/BlockTitle/BlockTitle";
import { Link } from "react-router-dom";
import contacts1 from "../../assets/contacts/1.jpg";
import contacts2 from "../../assets/contacts/2.jpg";
import contacts3 from "../../assets/contacts/3.jpg";

export const Contacts = () => {
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
    <div className={s.wrap}>
      <div className={s.img1}>
        <img
          src={contacts1}
          onMouseMove={(e) => handleImageMouseMove(e, "1")}
          onMouseLeave={handleImageMouseLeave}
          style={{
            transform: `${
              activeImg === "1" && window.innerWidth > 960
                ? `perspective(1000px) translate(${-offsetX}px, ${-offsetY}px) rotateX(${-rotateImg.x}deg) rotateY(${-rotateImg.y}deg) `
                : `perspective(1000px) translate(${-offsetX}px, ${-offsetY}px)`
            }`,transition: "transform 0.1s ease-out",
          }}
        />
      </div>
      <div className={s.img2}>
        <img
          src={contacts2}
          onMouseMove={(e) => handleImageMouseMove(e, "2")}
          onMouseLeave={handleImageMouseLeave}
          style={{
            transform: `${
              activeImg === "2" && window.innerWidth > 990
                ? `perspective(1000px) translate(${-offsetX}px, ${-offsetY}px) rotateX(${-rotateImg.x}deg) rotateY(${-rotateImg.y}deg) `
                : `perspective(1000px) translate(${-offsetX}px, ${-offsetY}px)`
            }`,
          }}
        />
      </div>
      <div className={s.img3}>
        <img
          src={contacts3}
          onMouseMove={(e) => handleImageMouseMove(e, "3")}
          onMouseLeave={handleImageMouseLeave}
          style={{
            transform: `${
              activeImg === "3" && window.innerWidth > 990
                ? `perspective(1000px) translate(${offsetX}px, ${offsetY}px) rotateX(${-rotateImg.x}deg) rotateY(${
                    -rotateImg.y
                  }deg) `
                : `perspective(1000px) translate(${offsetX}px, ${offsetY}px)`
            }`,
          }}
        />
      </div>
      <BlockTitle title='contacts' />
      <div className={s.content}>
        <p className={s.text}>
          Tell me about your story, your passion, your love.<br/> And I'll be happy
          to get back to you and talk about our common project. Let's connect
          here.
        </p>
        <div className={s.telNAddress}>
          <a className={s.tel} href='tel:+125610870000'>+1 256 10 87 0000</a>
          <span className={s.address}>4401 Waldeck Street Grapevine, Nashville, TX 76051</span>
        </div>
        <div><a className={s.email} href="info@demolink.org">info@demolink.org</a></div>
      </div>
    </div>
  );
};
