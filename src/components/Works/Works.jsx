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
  const [albumCount, setAlbumCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gridReady, setGridReady] = useState(false);

  const albumsCollectionRef = collection(db, "albums");

  useEffect(() => {
    const fetchAlbums = async () => {
      const cachedAlbums = localStorage.getItem("albums");
      if (cachedAlbums) {
        setAlbums(JSON.parse(cachedAlbums));
        setAlbumCount(JSON.parse(cachedAlbums).length);
        setLoading(false);
        return;
      }

      const snapshot = await getDocs(albumsCollectionRef);
      const albumsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAlbums(albumsData);
      setAlbumCount(albumsData.length);
      localStorage.setItem("albums", JSON.stringify(albumsData));
      setLoading(false);
    };

    fetchAlbums();
  }, [albumsCollectionRef]);

  // ✅ Визначаємо ширину сітки після завантаження альбомів
  useEffect(() => {
    if (gridRef.current && albums.length > 0) {
      setGridWidth(gridRef.current.getBoundingClientRect().width);
      setGridReady(true); // ✅ Оновлюємо стан тільки коли сітка готова
    }
  }, [albums]); // Оновлюємо при зміні стану `albums`

  const handleClickLeft = () => {
    if (gridRef.current) {
      const itemWidth =
        gridRef.current.firstChild?.getBoundingClientRect().width;
      gridRef.current.scrollBy({ left: -itemWidth, behavior: "smooth" });
    }
  };

  const handleClickRight = () => {
    if (gridRef.current) {
      const itemWidth =
        gridRef.current.firstChild?.getBoundingClientRect().width;
      gridRef.current.scrollBy({ left: itemWidth, behavior: "smooth" });
    }
  };

  return (
    <>
      <BlockTitle title="Works" />
      <div className={s.wrapper}>
        {loading ? (
          <div className={s.grid} ref={gridRef}>
            {[...Array(4)].map((_, index) => (
              <div key={index} className={s.albumWrap}>
                <div className={s.skeleton}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className={s.grid} ref={gridRef}>
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
                    className={s.deleteAlbum}
                    onClick={(e) => handleDelete(e, album)}
                  >
                    <MdClose />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
