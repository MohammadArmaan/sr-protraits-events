import { Suspense } from "react";
import Loader from "../Loader";
import { PaginationComponent } from "./PaginationComponent";

interface Props {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export function Pagination({ page, totalPages, hasNext, hasPrev }: Props) {
    return (
        <Suspense fallback={<Loader />}>
            <PaginationComponent
                page={page}
                totalPages={totalPages}
                hasNext={hasNext}
                hasPrev={hasPrev}
            />
        </Suspense>
    );
}
