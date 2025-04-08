import React, { useState } from "react";
import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doSignOut,
} from "../../config/auth";
import { useAuth } from "../../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../../config/firebase";
import s from "./Auth.module.css";
import { FcGoogle } from "react-icons/fc";
export const Auth = () => {
  const { userLoggedIn } = useAuth();
  const db = getFirestore(app);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const allowedRoles = ["admin"];

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setSigningIn(true);
      await doSignInWithEmailAndPassword(email, password);
    }
  };

  const onGoogleSignIn = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setSigningIn(true);
      try {
        const result = await doSignInWithGoogle();
        const user = result.user;
  
        // отримаємо роль користувача з Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          const role = userSnap.data().role;
          if (!allowedRoles.includes(role)) {
            await doSignOut();
            setErrorMessage("Access denied. You are not an admin.");
          }
        } else {
          await doSignOut();
          setErrorMessage("");
        }
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setSigningIn(false);
      }
    }
  };

  const onLogout = async () => {
    try {
      await doSignOut();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };
  return (
    <div>
      {/* {userLoggedIn && <Navigate to={"/"} replace={true} />} */}
      <div className={s.wrap}>
        <h2>Log in</h2>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        <form className={s.form} onSubmit={onSubmit}>
          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type='submit' disabled={isSigningIn}>
            Log in
          </button>
        </form>

        <button
          className={s.googleLogIn}
          onClick={onGoogleSignIn}
          disabled={isSigningIn}
        >
          <FcGoogle className={s.googleLogo} /> Log in with Google
        </button>
        <button className={s.logOut} onClick={onLogout}>
          Log out
        </button>
        {}
        {!userLoggedIn && <p>You are not authorized</p>}

        <button onClick={() => navigate("/")}>Back to your site</button>
      </div>
    </div>
  );
};
