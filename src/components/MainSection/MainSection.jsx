import React, { useEffect, useState } from "react";
import s from "./MainSection.module.css";

import { useAuth } from "../../contexts/authContext";
import { storage, db } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const MainSection = () => {
  const [imgPosition, setImgPosition] = useState({ x: 0, y: 0 });
  const [rotate, setRotate] = useState({ x: 0, y: 0, scale: 1 });
  const [activeImage, setActiveImage] = useState(null);

  const { userLoggedIn } = useAuth();

  const [mainImg, setMainImg] = useState(null);
  const [sideImg, setSideImg] = useState(null);
  const [smallImg, setSmallImg] = useState(null);

  const [mainImgFile, setMainImgFile] = useState(null);
  const [sideImgFile, setSideImgFile] = useState(null);
  const [smallImgFile, setSmallImgFile] = useState(null);

  // Завантаження URL-ів з Firestore при старті
  useEffect(() => {
    const fetchImages = async () => {
      const docRef = doc(db, "mainImages", "main");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.mainImg) setMainImg(data.mainImg);
        if (data.sideImg) setSideImg(data.sideImg);
        if (data.smallImg) setSmallImg(data.smallImg);
      }
    };
    fetchImages();
  }, []);

  // Завантаження фото та збереження URL у Firestore
  const uploadImage = async (file, pathSetter, key) => {
    if (!file) return;
    const imgRef = ref(storage, `/dzamilla_tyminska/main/${file.name}`);
    const snapshot = await uploadBytes(imgRef, file);
    const url = await getDownloadURL(snapshot.ref);
    pathSetter(url);

    const docRef = doc(db, "mainImages", "main");
    await setDoc(docRef, { [key]: url }, { merge: true });
  };

  useEffect(() => {
    const handleImgMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      setImgPosition({ x: mouseX, y: mouseY });
    };

    window.addEventListener("mousemove", handleImgMove);
    return () => window.removeEventListener("mousemove", handleImgMove);
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

  const offsetX =
    window.innerWidth > 960 ? (imgPosition.x - window.innerWidth / 2) / 20 : 0;
  const offsetY =
    window.innerWidth > 960 ? (imgPosition.y - window.innerHeight / 2) / 20 : 0;

  return (
    <div id='main' className={s.MainSection}>
      <div className={s.imgWrap}>
        {/* Main Image */}
        <div className={s.homeImgWrap}>
          <img
            alt='main'
            className={s.homeImg}
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
            src={mainImg}
          />
          {userLoggedIn && (
            <div
              className={s.changePhoto}
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
            >
              <input
                className={s.changePhotoInput}
                type='file'
                onChange={(e) => setMainImgFile(e.target.files[0])}
              />
              <button
                className={s.changePhotoButton}
                onClick={() => uploadImage(mainImgFile, setMainImg, "mainImg")}
              >
                Upload Main
              </button>
            </div>
          )}
        </div>

        {/* Side Image */}
        <div className={s.homeSideImgWrap}>
          <img
            alt='side'
            className={s.homeSideImg}
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
            src={sideImg}
          />
          {userLoggedIn && (
            <div
              className={s.changePhoto}
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
            >
              <input
                className={s.changePhotoInput}
                type='file'
                onChange={(e) => setSideImgFile(e.target.files[0])}
              />
              <button
                className={s.changePhotoButton}
                onClick={() => uploadImage(sideImgFile, setSideImg, "sideImg")}
              >
                Upload Side
              </button>
            </div>
          )}
        </div>

        {/* Small Image */}
        <div
          className={s.homeSmallImgWrap}
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
        >
          <img alt='small' className={s.homeSmallImg} src={smallImg} />
          {userLoggedIn && (
            <div
              className={s.changePhoto}
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
            >
              <input
                className={s.changePhotoInput}
                type='file'
                onChange={(e) => setSmallImgFile(e.target.files[0])}
              />
              <button
                className={s.changePhotoButton}
                onClick={() =>
                  uploadImage(smallImgFile, setSmallImg, "smallImg")
                }
              >
                Upload Small
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={s.author}>
        <h1 className={s.name}>Dżamilla Tymińska</h1>
        <p className={s.profession}>creative photography</p>
      </div>
    </div>
  );
};
