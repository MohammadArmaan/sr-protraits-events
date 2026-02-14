import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateSubCategoryInput {
    name: string;
    categoryId: number;
}

interface UpdateSubCategoryInput {
    id: number;
    name?: string;
    categoryId?: number;
    isActive?: boolean;
}

export const useCreateSubCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateSubCategoryInput) => {
            const res = await fetch("/api/admin/vendor-sub-categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error?.error || "Failed to create subcategory");
            }

            return res.json();
        },

        onSuccess: (_, variables) => {
            // Invalidate specific category subcategories
            queryClient.invalidateQueries({
                queryKey: ["admin-subcategories", variables.categoryId],
            });

            // If you also have a global list cache
            queryClient.invalidateQueries({
                queryKey: ["admin-subcategories"],
            });
        },
    });
};

export const useUpdateSubCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateSubCategoryInput) => {
            const res = await fetch("/api/admin/vendor-sub-categories", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error?.error || "Failed to update subcategory");
            }

            return res.json();
        },

        onSuccess: (updatedSubCategory) => {
            // Invalidate based on updated category
            queryClient.invalidateQueries({
                queryKey: [
                    "admin-subcategories",
                    updatedSubCategory.categoryId,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: ["admin-subcategories"],
            });
        },
    });
};

export const useDeleteSubCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(
                `/api/admin/vendor-sub-categories?id=${id}`,
                {
                    method: "DELETE",
                },
            );

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error?.error || "Failed to delete subcategory");
            }

            return res.json();
        },

        onSuccess: () => {
            // Invalidate all subcategories cache
            queryClient.invalidateQueries({
                queryKey: ["admin-subcategories"],
            });
        },
    });
};
