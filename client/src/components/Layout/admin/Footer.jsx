import React from "react";
import styles from "./AdminLayout.module.css"; // hoặc "./Footer.module.css"
import { FaFacebook } from "react-icons/fa"; 
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerSection}>
          <img
            src="https://img.lovepik.com/free-png/20210922/lovepik-icon-of-vector-hospital-png-image_401050686_wh1200.png"
            alt="Logo"
            className={styles.footerLogo}
          />
          <p>School manager</p>
        </div>

        <div className={styles.footerSection}>
         
        </div>

        <div className={styles.footerSection}>
          <h4>Thông tin liên hệ</h4>
          <ul>
            <li>📍 15 Đông Quan, Quan Hoa, Cầu Giấy, Hà Nội</li>
            <li>📞 0243 906 9333 - 0837 069 333 </li>
            <li>📧  fsccg.tuyensinh@fe.edu.vn.</li>
          </ul>
        </div>

        <div className={styles.footerSection}>
         <h4>Kết nối với chúng tôi</h4>
<div className={styles.socialIcons}>
    <a
    href="https://www.facebook.com/fptschools/?locale=vi_VN"
    target="_blank"
    rel="noopener noreferrer"
    style={{ display: "flex", alignItems: "center", gap: 8, color: "#4267B2" }}
  >
    <FaFacebook size={20} />
    Facebook
  </a>
</div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        © 2025  School manager. All rights reserved.
      </div>
    </footer>
  );
}
