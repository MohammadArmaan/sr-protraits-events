import { Suspense } from "react";
import ProfileEditRequests from "./_components/ProfileEditRequests";
import Loader from "@/components/Loader";

export default function PasswordResetPage() {
    return (
        <Suspense fallback={<Loader />}>
            <ProfileEditRequests />
        </Suspense>
    );
}
