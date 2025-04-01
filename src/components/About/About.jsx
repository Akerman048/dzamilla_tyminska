import React, { useState, useEffect } from "react";
import { BlockTitle } from "../Elements/BlockTitle/BlockTitle";
import s from "./About.module.css";

import { useAuth } from "../../contexts/authContext";
import { storage, db } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const About = () => {
  const [imgPosition, setImgPosition] = useState({ x: 0, y: 0 });
  const [rotateImg, setRotateImg] = useState({ x: 0, y: 0, scale: 1 });
  const [activeImg, setActiveImg] = useState(null);

  const [left, setLeft] = useState(null);
  const [rightDown, setRightDown] = useState(null);
  const [rightUp, setRightUp] = useState(null);

  const [leftFile, setLeftFile] = useState(null);
  const [rightDownFile, setRightDownFile] = useState(null);
  const [rightUpFile, setRightUpFile] = useState(null);

  const { userLoggedIn } = useAuth();

    useEffect(() => {
    const fetchImages = async () => {
      const docRef = doc(db, "aboutImages", "images");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.left) setLeft(data.left);
        if (data.rightDown) setRightDown(data.rightDown);
        if (data.rightUp) setRightUp(data.rightUp);
      }
    };
    fetchImages();
  }, []);

  const uploadImage = async (file, pathSetter, key) => {
    if (!file) return;
    const imgRef = ref(storage, `/dzamilla_tyminska/images/${file.name}`);
    const snapshot = await uploadBytes(imgRef, file);
    const url = await getDownloadURL(snapshot.ref);
    pathSetter(url);

    const docRef = doc(db, "aboutImages", "images");
    await setDoc(docRef, { [key]: url }, { merge: true });
  };

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

    setRotateImg({ x: angleX, y: angleY, scale: 1.1 });
    setActiveImg(imgType);
  };

  const handleImageMouseLeave = () => {
    setRotateImg({ x: 0, y: 0, scale: 1 });
    setActiveImg(null);
  };

  const offsetX =
    window.innerWidth > 960 ? (imgPosition.x - window.innerWidth / 2) / 20 : 0;
  const offsetY = (imgPosition.y - window.innerHeight / 2) / 20;
  return (
    <div className={s.container}>
      <div className={s.img1}  style={{
            transform: `${
              activeImg === "1" && window.innerWidth > 960
                ? `perspective(1000px) translate(${-offsetX}px, ${-offsetY}px) rotateX(${-rotateImg.x}deg) rotateY(${-rotateImg.y}deg) `
                : `perspective(1000px) translate(${-offsetX}px, ${-offsetY}px)`
            }`,
            transition: "transform 0.1s ease-out",
          }}>
        <img
          alt='about side 1'
          src={left}
          onMouseMove={(e) => handleImageMouseMove(e, "1")}
          onMouseLeave={handleImageMouseLeave}
         
        />
         {userLoggedIn && (
            <div className={s.changePhoto} onMouseMove={(e) => handleImageMouseMove(e, "main")}
            onMouseLeave={handleImageMouseLeave}
            style={{
              
              transition: "transform 0.1s ease-out",
            }}>
              <input
                type="file"
                onChange={(e) => setLeftFile(e.target.files[0])}
              />
              <button
                onClick={() => uploadImage(leftFile, setLeft, "left")}
              >
                Upload left
              </button>
            </div>
          )}
      </div>
      <div className={s.img2} onMouseMove={(e) => handleImageMouseMove(e, "2")}
          onMouseLeave={handleImageMouseLeave}
          style={{
            transform: `${
              activeImg === "2" && window.innerWidth > 990
                ? `perspective(1000px) translate(${offsetX}px, ${offsetY}px) rotateX(${-rotateImg.x}deg) rotateY(${-rotateImg.y}deg) `
                : `perspective(1000px) translate(${offsetX}px, ${offsetY}px)`
            }`,
          }}>
        <img
          alt='about side 2'
          src={rightUp}
          
        />{userLoggedIn && (
          <div className={s.changePhoto} onMouseMove={(e) => handleImageMouseMove(e, "main")}
          onMouseLeave={handleImageMouseLeave}
          style={{
            
            transition: "transform 0.1s ease-out",
          }}>
            <input
              type="file"
              onChange={(e) => setRightUpFile(e.target.files[0])}
            />
            <button
              onClick={() => uploadImage(rightUpFile, setRightUp, "rightUp")}
            >
              Upload right up
            </button>
          </div>
        )}
      </div>
      <div className={s.img3} style={{
            transform: `${
              activeImg === "3" && window.innerWidth > 990
                ? `perspective(1000px) translate(${offsetX}px, ${offsetY}px) rotateX(${-rotateImg.x}deg) rotateY(${
                    rotateImg.y
                  }deg) `
                : `perspective(1000px) translate(${-offsetX}px, ${-offsetY}px)`
            }`,
          }}>
        <img
          alt='about side 3'
          src={rightDown}
          onMouseMove={(e) => handleImageMouseMove(e, "3")}
          onMouseLeave={handleImageMouseLeave}
          
        />{userLoggedIn && (
          <div className={`${s.changePhoto} ${s.reverse}`} onMouseMove={(e) => handleImageMouseMove(e, "main")}
          onMouseLeave={handleImageMouseLeave}
          style={{
            
            transition: "transform 0.1s ease-out",
          }}>
            <input
              type="file"
              onChange={(e) => setRightDownFile(e.target.files[0])}
            />
            <button
              onClick={() => uploadImage(rightDownFile, setRightDown, "rightDown")}
            >
              Upload right down
            </button>
          </div>
        )}
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
          <img alt='about' src={rightDown} />
        </div>
      </div>
    </div>
  );
};
