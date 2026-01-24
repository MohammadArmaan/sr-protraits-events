import { Suspense } from "react";
import ResetPassword from "./ResetPassword";
import Loader from "@/components/Loader";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<Loader />}>
            <ResetPassword />
        </Suspense>
    );
}
