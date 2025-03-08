import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "./firebase"; 

export const getPhotoURL = async (photoPath) => {
  try {
    const photoRef = ref(storage, photoPath);
    return await getDownloadURL(photoRef);
  } catch (error) {
    console.error("Error getting photo URL:", error);
    return null;
  }
};
