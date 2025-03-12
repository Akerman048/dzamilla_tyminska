import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import s from "./AlbumPage.module.css";
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
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { MdClose } from "react-icons/md";
import { useAuth } from "../../contexts/authContext";

export const AlbumPage = () => {
  const { userLoggedIn } = useAuth();
  const { albumName } = useParams();
  const navigate = useNavigate();
  const [imageUpload, setImageUpload] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [mainPhoto, setMainPhoto] = useState(null);
  const [albumId, setAlbumId] = useState(null);

  const photosCollectionRef = collection(db, "photos");
  const albumsCollectionRef = collection(db, "albums");

  useEffect(() => {
    const fetchAlbumData = async () => {
      const albumQuery = query(
        albumsCollectionRef,
        where("name", "==", albumName)
      );
      const albumSnapshot = await getDocs(albumQuery);

      if (!albumSnapshot.empty) {
        const albumDoc = albumSnapshot.docs[0];
        setAlbumId(albumDoc.id);
        setMainPhoto(albumDoc.data().mainPhoto || null);
      } else {
        const newAlbumRef = await addDoc(albumsCollectionRef, {
          name: albumName,
          mainPhoto: "",
        });
        setAlbumId(newAlbumRef.id);
      }

      const photosQuery = query(
        photosCollectionRef,
        where("album", "==", albumName)
      );
      const photosSnapshot = await getDocs(photosQuery);
      const photosData = photosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPhotos(photosData);
    };

    fetchAlbumData();
  }, [albumName, albumsCollectionRef]);

  const uploadPhoto = async () => {
    if (!imageUpload) {
      alert("Select file!");
      return;
    }

    const imageRef = ref(
      storage,
      `/dzamilla_tyminska/albums/${albumName}/${imageUpload.name}`
    );
    const snapshot = await uploadBytes(imageRef, imageUpload);
    const url = await getDownloadURL(snapshot.ref);

    await addDoc(photosCollectionRef, { url, album: albumName });
    setPhotos((prev) => [...prev, { url }]);
  };

  // Оновлення головного фото
  const changeMainPhoto = async (photoUrl) => {
    if (!albumId) {
      console.error("Album ID not found");
      return;
    }

    const albumRef = doc(db, "albums", albumId);
    await updateDoc(albumRef, { mainPhoto: photoUrl, cover: photoUrl });

    setMainPhoto(photoUrl);
  };

  // Розділення фото на 3 колонки
  const columns = [[], [], []];
  photos.forEach((photo, index) => {
    columns[index % 3].push(photo);
  });

  const handleDelete = async (e, photoUrl) => {
    e.stopPropagation();

    try {
      // Отримуємо фото з Firestore, щоб знайти його `id`
      const photosQuery = query(
        photosCollectionRef,
        where("url", "==", photoUrl)
      );
      const photosSnapshot = await getDocs(photosQuery);

      if (!photosSnapshot.empty) {
        const photoDoc = photosSnapshot.docs[0];
        await deleteDoc(doc(db, "photos", photoDoc.id)); // Видаляємо фото з Firestore
      }

      // Видаляємо фото з Firebase Storage
      const imageRef = ref(storage, photoUrl);
      await deleteObject(imageRef);

      // Оновлюємо стан, щоб прибрати фото з UI
      setPhotos((prevPhotos) =>
        prevPhotos.filter((photo) => photo.url !== photoUrl)
      );
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Could not delete photo. Please try again..");
    }
  };

  return (
    <>
      {/* <SideNav sideLines={false}/> */}
      <div className={s.nav}>
        <h2 className={s.name}>Dżamilla Tymińska</h2>{" "}
        <button className={s.homebutton} onClick={() => navigate("/")}>
          home
        </button>
      </div>
      <div className={s.mainPhoto}>
        {mainPhoto ? (
          <img src={mainPhoto} alt='Main' />
        ) : (
          <p>There is no main photo</p>
        )}
      </div>

      <div className={s.albumWrapper}>
        <button className={s.backButton} onClick={() => navigate("/")}>
          ⬅ Back to Albums
        </button>
        <h2 className={s.albumName}>{albumName}</h2>

        {userLoggedIn && (
          <div className={s.uploadWrap}>
            <input
              type='file'
              onChange={(e) => setImageUpload(e.target.files[0])}
            />
            <button onClick={uploadPhoto}>Add Photo</button>
          </div>
        )}

        <div className={s.masonryGrid}>
          {columns.map((column, colIndex) => (
            <div key={colIndex} className={s.column}>
              {column.map((photo) => (
                <div key={photo.url} className={s.photoContainer}>
                  <img
                    className={s.image}
                    src={photo.url}
                    alt='photoContainer'
                  />
                  {userLoggedIn && (
                    <button
                      className={s.setMainButton}
                      onClick={() => changeMainPhoto(photo.url)}
                    >
                      Set as main photo
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, photo.url)}
                    className={s.delete}
                  >
                    <MdClose />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
