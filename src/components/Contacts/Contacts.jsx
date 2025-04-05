import React, { useState, useEffect } from "react";
import s from "./Contacts.module.css";
import { BlockTitle } from "../Elements/BlockTitle/BlockTitle";

import { Footer } from "../Footer/Footer";
import { FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import { storage, db } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const Contacts = () => {
  const [imgPosition, setImgPosition] = useState({ x: 0, y: 0 });
  const [rotateImg, setRotateImg] = useState({ x: 0, y: 0, scale: 1 });
  const [activeImg, setActiveImg] = useState(null);

  const [img1, setImg1] = useState(null);
  const [img2, setImg2] = useState(null);
  const [img3, setImg3] = useState(null);

  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [file3, setFile3] = useState(null);

  const [contactData, setContactData] = useState({
    paragraph: "",
    phone: "",
    address: "",
    email: "",
  });

  const { userLoggedIn } = useAuth();

  useEffect(() => {
    const fetchContent = async () => {
      const docRef = doc(db, "contactsContent", "text");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setContactData(docSnap.data());
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    const fetchContactsImages = async () => {
      const docRef = doc(db, "contactsImages", "images");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.img1) setImg1(data.img1);
        if (data.img2) setImg2(data.img2);
        if (data.img3) setImg3(data.img3);
      }
    };
    fetchContactsImages();
  }, []);

  const uploadContactImage = async (file, pathSetter, key) => {
    if (!file) return;
    const imgRef = ref(storage, `/dzamilla_tyminska/contacts/${file.name}`);
    const snapshot = await uploadBytes(imgRef, file);
    const url = await getDownloadURL(snapshot.ref);
    pathSetter(url);

    const docRef = doc(db, "contactsImages", "images");
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
    <>
      <div className={s.wrap}>
        <div
          className={s.img1}
          style={{
            transform: `${
              activeImg === "1" && window.innerWidth > 960
                ? `perspective(1000px) translate(${-offsetX}px, ${-offsetY}px) rotateX(${-rotateImg.x}deg) rotateY(${-rotateImg.y}deg) `
                : `perspective(1000px) translate(${-offsetX}px, ${-offsetY}px)`
            }`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <img
            alt='contact side 1'
            src={img1}
            onMouseMove={(e) => handleImageMouseMove(e, "1")}
            onMouseLeave={handleImageMouseLeave}
          />
          {userLoggedIn && (
            <div className={`${s.changePhotoLeft} ${s.leftImg}`}>
              <input
                type='file'
                onChange={(e) => setFile1(e.target.files[0])}
              />
              <button
                onClick={() => uploadContactImage(file1, setImg1, "img1")}
              >
                Upload left
              </button>
            </div>
          )}
        </div>
        <div
          className={s.img2}
          style={{
            transform: `${
              activeImg === "2" && window.innerWidth > 990
                ? `perspective(1000px) translate(${-offsetX}px, ${-offsetY}px) rotateX(${-rotateImg.x}deg) rotateY(${-rotateImg.y}deg) `
                : `perspective(1000px) translate(${-offsetX}px, ${-offsetY}px)`
            }`,
          }}
        >
          <img
            alt='contact side 2'
            src={img2}
            onMouseMove={(e) => handleImageMouseMove(e, "2")}
            onMouseLeave={handleImageMouseLeave}
          />{" "}
          {userLoggedIn && (
            <div className={s.changePhoto}>
              <input
                type='file'
                onChange={(e) => setFile2(e.target.files[0])}
              />
              <button
                onClick={() => uploadContactImage(file2, setImg2, "img2")}
              >
                Upload right up
              </button>
            </div>
          )}
        </div>
        <div
          className={s.img3}
          onMouseMove={(e) => handleImageMouseMove(e, "3")}
          onMouseLeave={handleImageMouseLeave}
          style={{
            transform: `${
              activeImg === "3" && window.innerWidth > 990
                ? `perspective(1000px) translate(${offsetX}px, ${offsetY}px) rotateX(${-rotateImg.x}deg) rotateY(${-rotateImg.y}deg) `
                : `perspective(1000px) translate(${offsetX}px, ${offsetY}px)`
            }`,
          }}
        >
          <img alt='contact side 3' src={img3} />{" "}
          {userLoggedIn && (
            <div className={s.changePhoto}>
              <input
                type='file'
                onChange={(e) => setFile3(e.target.files[0])}
              />
              <button
                onClick={() => uploadContactImage(file3, setImg3, "img3")}
              >
                Upload right down
              </button>
            </div>
          )}
        </div>
        <BlockTitle title='contacts' />
        <div className={s.content}>
          {userLoggedIn ? (
            <textarea
              className={s.textArea}
              value={contactData.paragraph}
              onChange={(e) =>
                setContactData({ ...contactData, paragraph: e.target.value })
              }
            />
          ) : (
            <p className={s.text}>{contactData.paragraph}</p>
          )}
          <div className={s.telNAddress}>
            {userLoggedIn ? (
              <input
                className={s.input}
                value={contactData.phone}
                onChange={(e) =>
                  setContactData({ ...contactData, phone: e.target.value })
                }
              />
            ) : (
              <a className={s.tel} href={`tel:${contactData.phone}`}>
                {contactData.phone}
              </a>
            )}
            {userLoggedIn ? (
              <input
                className={s.input}
                value={contactData.address}
                onChange={(e) =>
                  setContactData({ ...contactData, address: e.target.value })
                }
              />
            ) : (
              <span className={s.address}>{contactData.address}</span>
            )}
          </div>
          <div>
            {userLoggedIn ? (
              <input
                className={s.input}
                value={contactData.email}
                onChange={(e) =>
                  setContactData({ ...contactData, email: e.target.value })
                }
              />
            ) : (
              <a className={s.email} href={`${contactData.email}`}>
                {contactData.email}
              </a>
            )}
          </div>
          {userLoggedIn && (
            <button
              className={s.button}
              onClick={async () => {
                const docRef = doc(db, "contactsContent", "text");
                await setDoc(docRef, contactData, { merge: true });
                alert("Contact details updated!");
              }}
            >
              Save changes
            </button>
          )}
        </div>
        <Link to='https://www.instagram.com/d.cattleya/?fbclid=IwY2xjawIDKepleHRuA2FlbQIxMAABHR8x4009B-T7IDHMQT8LbjHuFod-WEQdcYgX9WXyt7hNTtRQOT157oKUew_aem_Hb4bxSMvRE1Q2UG3jKLxxw#'>
          <FaInstagram className={s.socialIcon} />
        </Link>
      </div>
      <Footer />
    </>
  );
};
