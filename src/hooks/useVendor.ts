"use client";

import { useEffect, useState } from "react";
import type { Vendor } from "@/types/vendor";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";

export function useVendor() {
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const data = await getCurrentVendor();
            setVendor(data);
            setLoading(false);
        }
        load();
    }, []);

    return { vendor, loading };
}

