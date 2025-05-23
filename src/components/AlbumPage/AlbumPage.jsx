import React, { useEffect, useState, useCallback } from "react";
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
  serverTimestamp,
  orderBy,
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
  const [imageUpload, setImageUpload] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [mainPhoto, setMainPhoto] = useState(null);
  const [albumId, setAlbumId] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
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
        where("album", "==", albumName),
        where("createdAt", "!=", null),
        orderBy("createdAt", "desc")
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
    if (!imageUpload || imageUpload.length === 0) {
      alert("Select file(s)!");
      return;
    }

    setIsUploading(true);

    const uploadedPhotos = [];

    for (const file of imageUpload) {
      try {
        const imageRef = ref(
          storage,
          `/dzamilla_tyminska/albums/${albumName}/${file.name}`
        );
  
        const snapshot = await uploadBytes(imageRef, file);
        const url = await getDownloadURL(snapshot.ref);
  
        await addDoc(photosCollectionRef, {
          url,
          album: albumName,
          createdAt: serverTimestamp(),
        });
  
        uploadedPhotos.push({ url });
      } catch (error) {
        console.error("Upload error:", error);
        alert("Помилка при завантаженні " + file.name);
      }
    }
  
    setPhotos((prev) => [...uploadedPhotos, ...prev]);
    setImageUpload([]);
    setIsUploading(false);
  };

  // Оновлення головного фото
  const changeMainPhoto = async (photoUrl) => {
    if (!albumId) {
      console.error("Album ID not found");
      return;
    }

    const albumRef = doc(db, "albums", albumId);
    await updateDoc(albumRef, { mainPhoto: photoUrl });

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
        where("url", "==", photoUrl),
        orderBy("createdAt", "asc")
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
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
  
    e.preventDefault();
  
    if (!e.target || typeof e.target.getBoundingClientRect !== "function") return;
    const diff = e.clientX - startX;
    setOffsetX(diff);
  }, [isDragging, startX]);

  const animateSwipe = useCallback((targetOffset, callback) => {
    let startTime;
    const duration = 0; // Тривалість анімації у мс
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
  }, [offsetX]);
   

  const showPrevPhoto = useCallback(() => {
    if (isTransitioning) return;
  
    setIsTransitioning(true);
    setIsVisible(false);
  
    setTimeout(() => {
      setSelectedPhotoIndex((prev) =>
        prev > 0 ? prev - 1 : photos.length - 1
      );
  
      setTimeout(() => {
        setIsVisible(true);
        setIsTransitioning(false);
      }, 20);
    }, 20);
  }, [isTransitioning, photos.length]);

  const showNextPhoto = useCallback(() => {
    if (isTransitioning || !photos.length) return;
  
    setIsTransitioning(true);
    setIsVisible(false);
  
    setTimeout(() => {
      setSelectedPhotoIndex((prev) =>
        prev < photos.length - 1 ? prev + 1 : 0
      );
  
      setTimeout(() => {
        setIsVisible(true);
        setIsTransitioning(false);
      }, 0);
    }, 0);
  }, [isTransitioning, photos.length]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
  
    setIsDragging(false);
  
    if (offsetX > swipeThreshold) {
      animateSwipe(window.innerWidth, () => {
        showPrevPhoto();
        setOffsetX(0);
      });
    } else if (offsetX < -swipeThreshold) {
      animateSwipe(-window.innerWidth, () => {
        showNextPhoto();
        setOffsetX(0);
      });
    } else {
      animateSwipe(0, () => setOffsetX(0));
    }
  
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [isDragging, offsetX, swipeThreshold, animateSwipe, showPrevPhoto, showNextPhoto, handleMouseMove]);

  const handleCloseModal = useCallback(() => {
    setSelectedPhotoIndex(null);
    setOffsetX(0);
    setIsDragging(false);
  
    document.body.classList.remove(s.noScroll);
  
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  
  

  
  
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

  

  

  

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setOffsetX(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    if (
      !e.touches[0] ||
      !e.target ||
      typeof e.target.getBoundingClientRect !== "function"
    )
      return;

    const diff = e.touches[0].clientX - startX;
    setOffsetX(diff);
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    if (offsetX > swipeThreshold) {
      showPrevPhoto(); // Свайп праворуч → наступне фото
    } else if (offsetX < -swipeThreshold) {
      showNextPhoto(); // Свайп ліворуч → попереднє фото
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

  const flattenedPhotos = [];
  const maxLength = Math.max(
    columns[0].length,
    columns[1].length,
    columns[2].length
  );

  for (let i = 0; i < maxLength; i++) {
    for (let col = 0; col < 3; col++) {
      if (columns[col][i]) {
        flattenedPhotos.push(columns[col][i]);
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedPhotoIndex !== null) {
        if (e.key === "ArrowLeft") {
          showPrevPhoto();
        } else if (e.key === "ArrowRight") {
          showNextPhoto();
        } else if (e.key === "Escape") {
          handleCloseModal();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedPhotoIndex,
    photos,
    handleCloseModal,
    showNextPhoto,
    showPrevPhoto,
  ]);

  return (
    <>
    {isUploading && (
  <div className={s.uploadModal}>
    <div className={s.uploadModalContent}>
      <p>Uploading photos...</p>
      <div className={s.spinner}></div>
    </div>
  </div>
)}

      <SideNav sideLines={false} />
      <div className={s.nav}>
        <h2 className={s.name}>
          <a
            href='#main'
            onClick={() => {
              navigate("/#main");
            }}
          >
            Dżamilla Tymińska{" "}
          </a>
        </h2>{" "}
        {/* <button className={s.homebutton} onClick={() => navigate("/")}>
          home
        </button> */}
      </div>
      {window.innerWidth > 990 && (
        <div className={s.mainPhoto}>
          {mainPhoto ? (
            <img src={mainPhoto} alt='Main' />
          ) : (
            <p>There is no main photo</p>
          )}
        </div>
      )}

      <div className={s.albumWrapper}>
        {/* <button className={s.backButton} onClick={() => navigate("/#works")}>
          <FaLongArrowAltLeft />
          Back to Albums
        </button> */}
        <h2 className={s.albumName}>{albumName}</h2>

        {userLoggedIn && (
          <div className={s.uploadWrap}>
            <input
              type='file' multiple
              onChange={(e) => setImageUpload(Array.from(e.target.files))}
            />
            <button onClick={uploadPhoto}>Add Photo</button>
          </div>
        )}

        <div className={s.masonryGrid}>
          {columns.map((column, colIndex) => (
            <div key={colIndex} className={s.column}>
              {column.map((photo, index) => {
                // const globalIndex =
                //   colIndex * Math.ceil(photos.length / 3) + index;
                return (
                  <div key={photo.url} className={s.photoContainer}>
                    <img
                      className={s.image}
                      src={photo.url}
                      alt='photoContainer'
                      onClick={() =>
                        handleOpenImg(
                          photos.findIndex((p) => p.url === photo.url)
                        )
                      } // Передаємо глобальний індекс
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
        <div className={`${s.masonryGrid} ${s.mobileGrid}`}>
          {flattenedPhotos.map((photo, index) => (
            <div key={photo.url} className={s.photoContainer}>
              <img
                className={s.image}
                src={photo.url}
                alt={photo.url}
                onClick={() => handleOpenImg(index)}
              />
            </div>
          ))}
        </div>
      </div>

      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
        <div className={s.modal} onClick={handleCloseModal}>
          <div className={s.modalImageWrapper}>
            <div
              className={`${s.imageContainer} 
          ${isVisible ? s.fadeIn : s.hidden}
            `}
            >
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
              />{" "}
            </div>
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
