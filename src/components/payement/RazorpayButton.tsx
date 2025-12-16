// src/components/TestRazorpayButton.tsx
"use client";

import { useEffect } from "react";

export default function TestRazorpayButton() {
    const openCheckout = async () => {
        // 1. Load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        script.onload = () => {
            const options = {
                key: "rzp_test_RrukqOXup9BsAw",
                amount: 250000,
                currency: "INR",
                order_id: "order_RsKDKQnGITagnL",

                handler: function (response: any) {
                    console.log("RAZORPAY RESPONSE 👉", response);
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        };

        document.body.appendChild(script);
    };

    return (
        <button
            onClick={openCheckout}
            className="px-4 py-2 bg-black text-white rounded"
        >
            Pay Test Advance
        </button>
    );
}
