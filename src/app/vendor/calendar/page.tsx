// src/app/vendor/calendar/page.tsx
import { Metadata } from "next";
import CalendarClient from "./CalendarClient";

export const metadata: Metadata = {
    title: "Calendar",
    description: "Manage your bookings, events, and availability",
};

export default function VendorCalendarPage() {
    return <CalendarClient />;
}
