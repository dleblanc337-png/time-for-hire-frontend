import React from "react";
import DashboardLayout from "../components/DashboardLayout";

function CustomerBookings() {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <DashboardLayout role="customer">
            <h1>My Bookings</h1>
            <p>(Customer bookings feature coming soon)</p>
        </DashboardLayout>
    );
}

export default CustomerBookings;
