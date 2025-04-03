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
  // updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
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
  // const [albumCount, setAlbumCount] = useState(0);
  const [rotate, setRotate] = useState({ x: 0, y: 0, scale: 1 });
  const [activeImage, setActiveImage] = useState(null);

  const [hideLeftArrow, setHideLeftArrow] = useState(true);
  const [hideRightArrow, setHideRightArrow] = useState(false);

  const albumsCollectionRef = collection(db, "albums");

  useEffect(() => {
    if (gridRef.current) {
      setGridWidth(gridRef.current.getBoundingClientRect().width);
    }

    const handleResize = () => {
      if (gridRef.current) {
        setGridWidth(gridRef.current.getBoundingClientRect().width);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [gridWidth]);

  useEffect(() => {
    const fetchAlbums = async () => {
      const albumsQuery = query(albumsCollectionRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(albumsQuery);
      const albumsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlbums(albumsData);
    };

    fetchAlbums();
  }, [albums, albumsCollectionRef]);

  const updateArrowsVisibility = () => {
    if (gridRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = gridRef.current;

      setHideLeftArrow(scrollLeft === 0);
      setHideRightArrow(scrollLeft + clientWidth >= scrollWidth);
    }
  };

  useEffect(() => {
    if (gridRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        setGridWidth(gridRef.current.getBoundingClientRect().width);
      });
      resizeObserver.observe(gridRef.current);

      return () => resizeObserver.disconnect();
    }
  }, []);

  useEffect(() => {
    if (gridRef.current) {
      setTimeout(() => {
        setGridWidth(gridRef.current.getBoundingClientRect().width);
      }, 100);
    }
  }, [albums]);

  useEffect(() => {
    const gridElement = gridRef.current;
    if (gridElement) {
      gridElement.addEventListener("scroll", updateArrowsVisibility);
      updateArrowsVisibility(); // Оновлення при завантаженні
    }
  
    return () => {
      if (gridElement) {
        gridElement.removeEventListener("scroll", updateArrowsVisibility);
      }
    };
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
      createdAt: new Date(),
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

      setAlbums((prevAlbums) => prevAlbums.filter((a) => a.id !== album.id));
    } catch (error) {
      console.error("Помилка при видаленні альбому:", error);
      alert("Не вдалося видалити альбом. Спробуйте ще раз.");
    }
  };

  const handleClickLeft = () => {
    if (gridRef.current) {
      const itemWidth =
        gridRef.current.firstChild?.getBoundingClientRect().width;
      gridRef.current.scrollBy({ left: -itemWidth, behavior: "smooth" }); // Зсув на третину контейнера
      console.log(itemWidth);
    }
  };

  const handleClickRight = () => {
    if (gridRef.current) {
      const itemWidth =
        gridRef.current.firstChild?.getBoundingClientRect().width;
      gridRef.current.scrollBy({ left: itemWidth, behavior: "smooth" }); // Зсув на третину контейнера
    }
  };

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

  return (
    <>
      <BlockTitle title='Works' />
      <div className={s.wrapper}>
        {userLoggedIn && (
          <div className={s.uploadWrap}>
            <input
              className={s.inputFile}
              type='file'
              onChange={(e) => setImageUpload(e.target.files[0])}
            />
            <input
              className={s.inputTitle}
              type='text'
              placeholder='Enter album name'
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
            />
            <button className={s.createAlbum} onClick={uploadImage}>
              Create Album
            </button>
          </div>
        )}
        <div className={s.galleryWrap}>
        {!hideLeftArrow && window.innerWidth > 430 &&(
  <IoIosArrowBack onClick={handleClickLeft} className={s.leftArrow} />
)}
          <div className={s.grid} ref={gridRef}>
            {albums.map((album) => (
              <div
                key={album.id}
                className={s.albumWrap}
                onClick={() => navigate(`album/${album.name}`)}
              >
                <img
                  onMouseMove={(e) => handleImageMouseMove(e, album.cover)}
                  onMouseLeave={handleImageMouseLeave}
                  className={s.image}
                  src={album.cover}
                  alt={album.name}
                  style={{
                    transform: `${
                      activeImage === album.cover && window.innerWidth > 960
                        ? `perspective(1000px) rotateX(${-rotate.x}deg) rotateY(${-rotate.y}deg)`
                        : `perspective(1000px) `
                    }`,
                    transition: "transform 0.1s ease-out",
                  }}
                />
                <span className={s.title}>{album.name}</span>
                {userLoggedIn && (
                  <button
                    style={{
                      transform: `${
                        activeImage === album.cover && window.innerWidth > 960
                          ? `perspective(1000px) rotateX(20deg) rotateY(${-rotate.y}deg)`
                          : `perspective(1000px) `
                      }`,
                      transition: "transform 0.1s ease-out",
                    }}
                    onClick={(e) => handleDelete(e, album)}
                    className={s.deleteAlbum}
                  >
                    <MdClose  className={s.deleteAlbumIcon}/>
                  </button>
                )}
              </div>
            ))}
          </div>
          {!hideRightArrow &&  window.innerWidth > 430 && (
  <IoIosArrowForward onClick={handleClickRight} className={s.rightArrow} />
)}

        </div>
      </div>
    </>
  );
};
