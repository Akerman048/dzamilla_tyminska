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
// import { FaLongArrowAltLeft } from "react-icons/fa";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";
import { IoCloseOutline } from "react-icons/io5";
import { SideNav } from "../Elements/SideNav/SideNav";

export const AlbumPage = () => {
  const { userLoggedIn } = useAuth();
  const { albumName } = useParams();
  const navigate = useNavigate();
  const [imageUpload, setImageUpload] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [mainPhoto, setMainPhoto] = useState(null);
  const [albumId, setAlbumId] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const swipeThreshold = 20;

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
  }, [albumName, albumsCollectionRef, photosCollectionRef]);

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

  const handleOpenImg = (index) => {
    if (photos[index]) {
      setSelectedPhotoIndex(index);
      document.body.classList.add(s.noScroll);
    }
  };

  const handleCloseModal = () => {
    setSelectedPhotoIndex(null);
    setOffsetX(0);
    setIsDragging(false);

    document.body.classList.remove(s.noScroll);
    // Прибираємо обробники подій при закритті модального вікна
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const showPrevPhoto = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setIsVisible(false); // Миттєво ховаємо поточне фото

    setTimeout(() => {
      setSelectedPhotoIndex((prev) =>
        prev > 0 ? prev - 1 : photos.length - 1
      );

      // Плавно показуємо нове фото після переходу
      setTimeout(() => {
        setIsVisible(true);
        setIsTransitioning(false);
      }, 20);
    }, 20);
  };

  const showNextPhoto = () => {
    if (isTransitioning || !photos.length) return;

    setIsTransitioning(true);
    setIsVisible(false); // Миттєво ховаємо поточне фото

    setTimeout(() => {
      setSelectedPhotoIndex((prev) =>
        prev < photos.length - 1 ? prev + 1 : 0
      );

      // Плавно показуємо нове фото після переходу
      setTimeout(() => {
        setIsVisible(true);
        setIsTransitioning(false);
      }, 0);
    }, 0);
  };
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);

    // Встановлюємо стартову позицію як координати мишки при натисканні
    setStartX(e.clientX);

    setOffsetX(0); // Початкове зміщення нульове

    // Додаємо глобальні обробники подій
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    e.preventDefault();

    if (!e.target || typeof e.target.getBoundingClientRect !== "function") return;
    // Визначаємо зміщення на основі початкової позиції мишки
    const diff = e.clientX - startX;
    setOffsetX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // Перемикання на наступне фото, якщо поріг перевищено
    if (offsetX > swipeThreshold) {
      animateSwipe(window.innerWidth, () => {
        showNextPhoto();
        setOffsetX(0);
      });
    }
    // Перемикання на попереднє фото, якщо поріг перевищено
    else if (offsetX < -swipeThreshold) {
      animateSwipe(-window.innerWidth, () => {
        showPrevPhoto();
        setOffsetX(0);
      });
    }
    // Якщо зміщення менше порогу — повертаємо у вихідне положення
    else {
      animateSwipe(0, () => setOffsetX(0));
    }

    // Видаляємо глобальні обробники подій
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const animateSwipe = (targetOffset, callback) => {
    let startTime;
    const duration = 0; // Тривалість анімації у мілісекундах
    const startOffset = offsetX;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        const newOffset = startOffset + (targetOffset - startOffset) * progress;
        setOffsetX(newOffset);
        requestAnimationFrame(step);
      } else {
        setOffsetX(targetOffset);
        if (callback) callback();
      }
    };

    requestAnimationFrame(step);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setOffsetX(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    if (!e.touches[0] || !e.target || typeof e.target.getBoundingClientRect !== "function") return;

    const diff = e.touches[0].clientX - startX;
    setOffsetX(diff);
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    if (offsetX > swipeThreshold) {
      showNextPhoto(); // Свайп праворуч → наступне фото
    } else if (offsetX < -swipeThreshold) {
      showPrevPhoto(); // Свайп ліворуч → попереднє фото
    }

    setOffsetX(0);
  };

  useEffect(() => {
    if (selectedPhotoIndex !== null) {
      // Додаємо клас для блокування прокручування
      document.body.classList.add(s.noScroll);
    } else {
      // Прибираємо клас після закриття
      document.body.classList.remove(s.noScroll);
    }
  
    // Очищуємо при закритті компонента
    return () => {
      document.body.classList.remove(s.noScroll);
    };
  }, [selectedPhotoIndex]);

  return (
    <>
      <SideNav sideLines={false}/>
      <div className={s.nav}>
        <h2 className={s.name}><a href='#main' onClick={() => {
                
                navigate("/#main");
              }}>Dżamilla Tymińska </a></h2>{" "}
        {/* <button className={s.homebutton} onClick={() => navigate("/")}>
          home
        </button> */}
      </div>
      <div className={s.mainPhoto}>
        {mainPhoto ? (
          <img src={mainPhoto} alt='Main' />
        ) : (
          <p>There is no main photo</p>
        )}
      </div>

      <div className={s.albumWrapper}>
        {/* <button className={s.backButton} onClick={() => navigate("/#works")}>
          <FaLongArrowAltLeft />
          Back to Albums
        </button> */}
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
              {column.map((photo, index) => {
                const globalIndex =
                  colIndex * Math.ceil(photos.length / 3) + index; // Визначаємо глобальний індекс
                return (
                  <div key={photo.url} className={s.photoContainer}>
                    <img
                      className={s.image}
                      src={photo.url}
                      alt='photoContainer'
                      onClick={() => handleOpenImg(globalIndex)} // Передаємо глобальний індекс
                    />
                    {userLoggedIn && (
                      <button
                        className={s.setMainButton}
                        onClick={() => changeMainPhoto(photo.url)}
                      >
                        Set as main photo
                      </button>
                    )}
                    {userLoggedIn && (
                      <button
                        onClick={(e) => handleDelete(e, photo.url)}
                        className={s.delete}
                      >
                        <MdClose />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
        <div className={s.modal} onClick={handleCloseModal}>
          <div
            className={s.modalImageWrapper}
          ><div className={`${s.imageContainer} 
          ${isVisible ? s.fadeIn : s.hidden}
            `}>
            <img
              src={photos[selectedPhotoIndex].url}
              alt='Full view'
              className={s.modalImage}
              style={{
                transform: `translateX(${offsetX}px)`,
                transition: isDragging ? "transform 0.1s ease" : "none",
                cursor: isDragging ? "grabbing" : "grab",
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            /> </div>
            <button className={s.closeButton} onClick={handleCloseModal}>
            <IoCloseOutline className={s.closeModal} />
          </button>
          </div>
          <button
            className={s.prevButton}
            onClick={(e) => {
              e.stopPropagation();
              showPrevPhoto();
            }}
          >
            <HiOutlineArrowNarrowLeft className={s.arrows} />
          </button>
          <button
            className={s.nextButton}
            onClick={(e) => {
              e.stopPropagation();
              showNextPhoto();
            }}
          >
            <HiOutlineArrowNarrowRight className={s.arrows} />
          </button>
          
        </div>
      )}
    </>
  );
};
