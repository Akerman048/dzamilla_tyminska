import React from "react";

import { Link } from "react-router-dom";

import s from "./Footer.module.css";

// import { FaFacebookF } from "react-icons/fa";
// import { FaBehance } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

export const Footer = () => {
  return (
    <section className={s.footer}>
      <div className={s.social}>
        {/* <Link to='https://www.facebook.com/dzamilla'>
          <FaFacebookF  className={s.socialIcon}/>
        </Link> */}
        <Link to='https://www.instagram.com/d.cattleya/?fbclid=IwY2xjawIDKepleHRuA2FlbQIxMAABHR8x4009B-T7IDHMQT8LbjHuFod-WEQdcYgX9WXyt7hNTtRQOT157oKUew_aem_Hb4bxSMvRE1Q2UG3jKLxxw#'>
          <FaInstagram className={s.socialIcon} />
        </Link>
        {/* <Link to='https://www.behance.net/'>
        <FaBehance className={s.socialIcon}/>
        </Link> */}
      </div>
      <p>© 2025 Dżamilla Tymińska. Privacy Policy</p>
    </section>
  );
};
