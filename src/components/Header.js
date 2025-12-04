import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Header.css";

function Header({ isLoggedIn }) {
    const navigate = useNavigate();

    // Read user info from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const role = user?.role;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
        window.location.reload();
    };

    return (
        <header className="tfh-header">
            <div className="tfh-header-left">
                <img src={logo} alt="Time For Hire Logo" className="tfh-logo-image" />

                <div className="tfh-title-group">
                    <span className="tfh-title">Time For Hire</span>
                    <span className="tfh-slogan">MAKE IT WORK</span>
                </div>
            </div>

            <nav className="tfh-nav">
                <Link to="/">Home</Link>

                {!isLoggedIn && (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Create Account</Link>
                    </>
                )}

                {isLoggedIn && role === "customer" && (
                    <Link to="/customer-dashboard">My Dashboard</Link>
                )}

                {isLoggedIn && role === "helper" && (
                    <Link to="/helper-dashboard">My Dashboard</Link>
                )}

                {isLoggedIn && (
                    <button className="tfh-logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                )}
            </nav>
        </header>
    );
}

export default Header;
