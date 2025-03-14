import React, { useEffect, useRef, useState } from "react";
import s from "./Works.module.css";
import { BlockTitle } from "../Elements/BlockTitle/BlockTitle";
import { storage, db } from "../../config/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { MdClose } from "react-icons/md";
import { useAuth } from "../../contexts/authContext";

export const Works = () => {
  const { userLoggedIn } = useAuth();
  const [albumName, setAlbumName] = useState("");
  const [imageUpload, setImageUpload] = useState(null);
  const [albums, setAlbums] = useState([]);
  const navigate = useNavigate();
  const gridRef = useRef(null);
  const [gridWidth, setGridWidth] = useState(0);
  const [albumCount, setAlbumCount] = useState(0);
  const [rotate, setRotate] = useState({ x: 0, y: 0, scale: 1 });
  const [activeImage, setActiveImage] = useState(null);

  const albumsCollectionRef = collection(db, "albums");

  // ✅ Завантаження альбомів
  useEffect(() => {
    const fetchAlbums = async () => {
      const snapshot = await getDocs(albumsCollectionRef);
      setAlbumCount(snapshot.size);
      const albumsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlbums(albumsData);
    };

    fetchAlbums();
  }, [albumsCollectionRef]);

  // ✅ Використовуємо ResizeObserver для правильного обчислення розміру сітки
  useEffect(() => {
    if (gridRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        setGridWidth(gridRef.current.getBoundingClientRect().width);
      });
      resizeObserver.observe(gridRef.current);

      return () => resizeObserver.disconnect();
    }
  }, []);

  // ✅ Невеликий setTimeout, щоб примусити перерахунок розмірів після завантаження DOM
  useEffect(() => {
    if (gridRef.current) {
      setTimeout(() => {
        setGridWidth(gridRef.current.getBoundingClientRect().width);
      }, 100);
    }
  }, [albums]);

  const uploadImage = async () => {
    if (!imageUpload || !albumName) {
      alert("Виберіть файл і введіть назву альбому!");
      return;
    }

    const imageRef = ref(storage, `albums/${albumName}/${imageUpload.name}`);
    const snapshot = await uploadBytes(imageRef, imageUpload);
    const url = await getDownloadURL(snapshot.ref);

    const newAlbumRef = await addDoc(albumsCollectionRef, {
      name: albumName,
      cover: url,
    });
    setAlbums((prev) => [
      ...prev,
      { id: newAlbumRef.id, name: albumName, cover: url },
    ]);
    setAlbumName("");
    setImageUpload(null);
  };

  const handleDelete = async (e, album) => {
    e.stopPropagation();

    const albumRef = doc(db, "albums", album.id);
    const imageRef = ref(storage, album.cover);
    try {
      await deleteDoc(albumRef);
      await deleteObject(imageRef);

      setAlbums((prev) => prev.filter((a) => a.id !== album.id));
    } catch (error) {
      console.error("Помилка при видаленні альбому:", error);
    }
  };

  const handleClickLeft = () => {
    gridRef.current.scrollBy({ left: -gridWidth, behavior: "smooth" });
  };

  const handleClickRight = () => {
    gridRef.current.scrollBy({ left: gridWidth, behavior: "smooth" });
  };

  return (
    <>
      <BlockTitle title="Works" />
      <div className={s.wrapper}>
        <div className={s.galleryWrap}>
          {albumCount > 6 && window.innerWidth > 901 && (
            <IoIosArrowBack onClick={handleClickLeft} className={s.leftArrow} />
          )}
          <div className={s.grid} ref={gridRef} key={albums.length}>
            {albums.map((album) => (
              <div
                key={album.id}
                className={s.albumWrap}
                onClick={() => navigate(`album/${album.name}`)}
              >
                <img
                  className={s.image}
                  src={album.cover}
                  alt={album.name}
                />
                <span className={s.title}>{album.name}</span>
                {userLoggedIn && (
                  <button
                    onClick={(e) => handleDelete(e, album)}
                    className={s.deleteAlbum}
                  >
                    <MdClose />
                  </button>
                )}
              </div>
            ))}
          </div>
          {albumCount > 6 && window.innerWidth > 901 && (
            <IoIosArrowForward
              onClick={handleClickRight}
              className={s.rightArrow}
            />
          )}
        </div>
      </div>
    </>
  );
};
