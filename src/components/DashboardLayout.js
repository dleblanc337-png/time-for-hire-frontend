import React from "react";
import { Link } from "react-router-dom";
import "./DashboardLayout.css";

const user = JSON.parse(localStorage.getItem("user") || "null");

function DashboardLayout({ children, role }) {
    return (
        <div className="dashboard-container">

            <aside className="dashboard-sidebar">
                <h2>Menu</h2>

                <Link to={role === "helper" ? "/helper-dashboard" : "/customer-dashboard"}>
                    Dashboard
                </Link>

                {role === "customer" && (
                    <>
                        <Link to="/customer-bookings">My Bookings</Link>
                        <Link to="/customer-messages">Messages</Link>
                    </>
                )}

                {role === "helper" && (
                    <>
                        <Link to="/helper-jobs">Available Jobs</Link>
                        <Link to="/helper-messages">Messages</Link>
                    </>
                )}
            </aside>

            <main className="dashboard-content">
                {children}
            </main>

        </div>
    );
}

export default DashboardLayout;
