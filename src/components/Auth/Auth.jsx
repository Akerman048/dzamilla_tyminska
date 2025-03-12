import React, { useState } from "react";
import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doSignOut,
} from "../../config/auth";
import { useAuth } from "../../contexts/authContext";
import { useNavigate } from "react-router-dom";
import s from "./Auth.module.css";
import { FcGoogle } from "react-icons/fc";
export const Auth = () => {
  const { userLoggedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setSigningIn(true);
      await doSignInWithEmailAndPassword(email, password);
    }
  };

  const onGoogleSignIn = (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setSigningIn(true);
      doSignInWithGoogle().catch((err) => {
        setSigningIn(false);
      });
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
