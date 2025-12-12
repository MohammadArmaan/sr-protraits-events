"use client";

import { useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { VendorAuthPayload } from "../types/vendor";

export function useVendor() {
    const [vendor, setVendor] = useState<VendorAuthPayload | null>(null);
    const [loading, setLoading] = useState(true);

    const loadVendorFromCookie = useCallback(() => {
        queueMicrotask(() => {
            try {
                const token = Cookies.get("vendor_token");

                if (!token) {
                    setVendor(null);
                    setLoading(false);
                    return;
                }

                const decoded = jwtDecode<VendorAuthPayload>(token);
                setVendor(decoded);
            } catch (err) {
                console.error("Failed to decode vendor token:", err);
                setVendor(null);
            }

            setLoading(false);
        });
    }, []);

    // Load vendor on mount
    useEffect(() => {
        loadVendorFromCookie();
    }, [loadVendorFromCookie]);

    const logout = () => {
        Cookies.remove("vendor_token");
        setVendor(null);
    };

    return {
        vendor,
        isAuthenticated: !!vendor,
        loading,
        logout,
        refresh: loadVendorFromCookie,
    };
}
