import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css"; // keep this if you had styling

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Detect login state on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        {/* Logo / Home Button */}
        <h1 style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          Time For Hire
        </h1>
      </div>

      <div className="header-right">

        {/* If NOT logged in */}
        {!isLoggedIn && (
          <>
            <button className="nav-button" onClick={() => navigate("/login")}>
              Login
            </button>

            <button className="nav-button" onClick={() => navigate("/register")}>
              Create Account
            </button>
          </>
        )}

        {/* If logged in */}
        {isLoggedIn && (
          <>
            <button className="nav-button" onClick={() => navigate("/dashboard")}>
              My Dashboard
            </button>

            <button
              className="nav-button"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
                window.location.reload();
              }}
            >
              Log Out
            </button>
          </>
        )}

      </div>
    </header>
  );
}

export default Header;
