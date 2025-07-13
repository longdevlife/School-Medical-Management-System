import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 6,
        },
      }}
    >
      <GoogleOAuthProvider clientId="135787719172-lh9b76j2v88gjmt0ha30jpdcns3kadhj.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </ConfigProvider>
  </React.StrictMode>
);
