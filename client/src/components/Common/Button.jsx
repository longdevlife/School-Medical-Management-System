import React from "react";

function Button({ children, ...props }) {
  return (
    <button
      style={{
        padding: "8px 16px",
        borderRadius: "4px",
        border: "none",
        background: "#2196f3",
        color: "white",
        cursor: "pointer",
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
