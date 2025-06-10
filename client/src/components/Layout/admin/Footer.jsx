import React from "react";
import styles from "./AdminLayout.module.css"; // hoặc "./Footer.module.css"

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
          <h4>Liên kết</h4>
          <ul>
            <li><a href="/about">Về chúng tôi</a></li>
            <li><a href="/services">Dịch vụ</a></li>
            <li><a href="/news">Tin tức</a></li>
            <li><a href="/contact">Liên hệ</a></li>
          </ul>
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
          <h4>Chính sách</h4>
          <ul>
            <li><a href="/privacy">Chính sách bảo mật</a></li>
            <li><a href="/terms">Điều khoản sử dụng</a></li>
          </ul>
          <div className={styles.socialIcons}>
            <a href="https://facebook.com">Facebook</a> |{" "}
            <a href="https://twitter.com">Twitter</a>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        © 2025  School manager. All rights reserved.
      </div>
    </footer>
  );
}
