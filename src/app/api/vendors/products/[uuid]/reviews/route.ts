import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/config/db";
import { vendorReviewsTable } from "@/config/vendorReviewsSchema";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { REVIEW_PAGE_SIZE } from "@/lib/constants";
import { vendorsTable } from "@/config/vendorsSchema";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ uuid: string }> },
) {
    try {
        const { uuid } = await context.params;
        /* -----------------------------
           Auth: Vendor token
        ----------------------------- */
        const token = req.cookies.get("vendor_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Missing token" },
                { status: 401 },
            );
        }

        let decoded: { vendorId: number };
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                vendorId: number;
            };
        } catch {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 },
            );
        }

        const reviewerVendorId = decoded.vendorId;

        /* -----------------------------
           Input validation
        ----------------------------- */
        const { bookingId, rating, comment } = await req.json();

        if (!bookingId || !rating) {
            return NextResponse.json(
                { error: "bookingId and rating are required" },
                { status: 400 },
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 },
            );
        }

        /* -----------------------------
           Resolve product by UUID
        ----------------------------- */
        const [product] = await db
            .select()
            .from(vendorProductsTable)
            .where(eq(vendorProductsTable.uuid, uuid))
            .limit(1);

        if (!product) {
            return NextResponse.json(
                { error: "Invalid product" },
                { status: 404 },
            );
        }

        /* -----------------------------
           Fetch booking
        ----------------------------- */
        const [booking] = await db
            .select()
            .from(vendorBookingsTable)
            .where(eq(vendorBookingsTable.id, bookingId))
            .limit(1);

        if (!booking) {
            return NextResponse.json(
                { error: "Invalid booking" },
                { status: 404 },
            );
        }

        /* -----------------------------
           Strict guards
        ----------------------------- */
        if (booking.status !== "COMPLETED") {
            return NextResponse.json(
                { error: "Event not completed yet" },
                { status: 400 },
            );
        }

        if (booking.bookedByVendorId !== reviewerVendorId) {
            return NextResponse.json(
                { error: "Not allowed to review this booking" },
                { status: 403 },
            );
        }

        if (booking.vendorProductId !== product.id) {
            return NextResponse.json(
                { error: "Booking does not belong to this product" },
                { status: 403 },
            );
        }

        if (booking.vendorId === booking.bookedByVendorId) {
            return NextResponse.json(
                { error: "Self review not allowed" },
                { status: 403 },
            );
        }

        /* -----------------------------
           Insert review (UNIQUE protected)
        ----------------------------- */
        try {
            await db.insert(vendorReviewsTable).values({
                bookingId,
                vendorId: booking.vendorId,
                vendorProductId: product.id,
                reviewerVendorId,
                rating,
                comment,
            });

            /* -----------------------------
   Add Rating Points to Vendor
----------------------------- */
            await db
                .update(vendorsTable)
                .set({
                    points: sql`${vendorsTable.points} + ${rating}`,
                    updatedAt: new Date(),
                })
                .where(eq(vendorsTable.id, booking.vendorId));
        } catch (err) {
            // UNIQUE violation → review already exists
            return NextResponse.json(
                { error: "Review already submitted" },
                { status: 409 },
            );
        }

        /* -----------------------------
           Update product rating
        ----------------------------- */
        const oldRating = Number(product.rating ?? 0);
        const oldCount = product.ratingCount ?? 0;

        const newAvg = (oldRating * oldCount + rating) / (oldCount + 1);

        await db
            .update(vendorProductsTable)
            .set({
                rating: newAvg.toFixed(1),
                ratingCount: oldCount + 1,
            })
            .where(eq(vendorProductsTable.id, product.id));

        return NextResponse.json(
            { success: true, message: "Review submitted successfully" },
            { status: 201 },
        );
    } catch (error) {
        console.error("Create review error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ uuid: string }> },
) {
    try {
        const { uuid } = await context.params;
        const cursor = new URL(req.url).searchParams.get("cursor");

        const [product] = await db
            .select()
            .from(vendorProductsTable)
            .where(eq(vendorProductsTable.uuid, uuid))
            .limit(1);

        if (!product) {
            return NextResponse.json(
                { error: "Invalid product" },
                { status: 404 },
            );
        }

        const reviews = await db
            .select({
                id: vendorReviewsTable.id,
                bookingId: vendorReviewsTable.bookingId,
                rating: vendorReviewsTable.rating,
                comment: vendorReviewsTable.comment,
                createdAt: vendorReviewsTable.createdAt,

                reviewerId: vendorsTable.id,
                reviewerName: vendorsTable.fullName,
                reviewerOccupation: vendorsTable.occupation,
            })
            .from(vendorReviewsTable)
            .innerJoin(
                vendorsTable,
                eq(vendorsTable.id, vendorReviewsTable.reviewerVendorId),
            )
            .where(
                cursor
                    ? and(
                          eq(vendorReviewsTable.vendorProductId, product.id),
                          lt(vendorReviewsTable.createdAt, new Date(cursor)),
                      )
                    : eq(vendorReviewsTable.vendorProductId, product.id),
            )
            .orderBy(desc(vendorReviewsTable.createdAt))
            .limit(REVIEW_PAGE_SIZE);

        return NextResponse.json({
            reviews,
            nextCursor:
                reviews.length === REVIEW_PAGE_SIZE
                    ? reviews[reviews.length - 1].createdAt
                    : null,
        });
    } catch (error) {
        console.error("Fetch reviews error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ uuid: string }> },
) {
    try {
        const { uuid } = await context.params;

        /* -----------------------------
           Auth: Vendor token
        ----------------------------- */
        const token = req.cookies.get("vendor_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Missing token" },
                { status: 401 },
            );
        }

        let decoded: { vendorId: number };
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                vendorId: number;
            };
        } catch {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 },
            );
        }

        const reviewerVendorId = decoded.vendorId;

        /* -----------------------------
           Input
        ----------------------------- */
        const { bookingId } = await req.json();

        if (!bookingId) {
            return NextResponse.json(
                { error: "bookingId is required" },
                { status: 400 },
            );
        }

        /* -----------------------------
           Resolve product
        ----------------------------- */
        const [product] = await db
            .select()
            .from(vendorProductsTable)
            .where(eq(vendorProductsTable.uuid, uuid))
            .limit(1);

        if (!product) {
            return NextResponse.json(
                { error: "Invalid product" },
                { status: 404 },
            );
        }

        /* -----------------------------
           Fetch review
        ----------------------------- */
        const [review] = await db
            .select()
            .from(vendorReviewsTable)
            .where(eq(vendorReviewsTable.bookingId, bookingId))
            .limit(1);

        if (!review) {
            return NextResponse.json(
                { error: "Review not found" },
                { status: 404 },
            );
        }

        if (review.reviewerVendorId !== reviewerVendorId) {
            return NextResponse.json(
                { error: "Not allowed to delete this review" },
                { status: 403 },
            );
        }

        /* -----------------------------
           Delete review
        ----------------------------- */
        await db
            .delete(vendorReviewsTable)
            .where(eq(vendorReviewsTable.id, review.id));

        /* -----------------------------
   Revert Rating Points
----------------------------- */
        await db
            .update(vendorsTable)
            .set({
                points: sql`GREATEST(${vendorsTable.points} - ${review.rating}, 0)`,
                updatedAt: new Date(),
            })
            .where(eq(vendorsTable.id, review.vendorId));

        /* -----------------------------
           Update product rating
        ----------------------------- */
        const oldCount = product.ratingCount ?? 0;
        const oldRating = Number(product.rating ?? 0);

        const newCount = Math.max(oldCount - 1, 0);

        const newRating =
            newCount === 0
                ? 0
                : (oldRating * oldCount - Number(review.rating)) / newCount;

        await db
            .update(vendorProductsTable)
            .set({
                rating: newRating.toFixed(1),
                ratingCount: newCount,
            })
            .where(eq(vendorProductsTable.id, product.id));

        return NextResponse.json(
            { success: true, message: "Review deleted successfully" },
            { status: 200 },
        );
    } catch (error) {
        console.error("Delete review error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
