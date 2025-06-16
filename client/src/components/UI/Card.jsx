import React from "react";

function Card({ children }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        padding: "16px",
        margin: "16px 0",
      }}
    >
      {children}
    </div>
  );
}

export default Card;
