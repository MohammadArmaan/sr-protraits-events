import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHead,
    TableRow,
} from "@/components/ui/table";

export function CouponTableSkeleton() {
    return (
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Coupon Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Expires On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12" />
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton className="h-4 w-28" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-4 w-24" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-4 w-20" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-4 w-24" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
