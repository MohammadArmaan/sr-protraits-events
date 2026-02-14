"use client";

import { useState, useMemo } from "react";
import {
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    ChevronDown,
    ChevronRight,
    FolderOpen,
    Layers,
    Search,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useVendorCatalogCategories } from "@/hooks/queries/useVendorCatalogCategories";
import {
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
} from "@/hooks/queries/admin/useCategoryMutations";
import {
    useCreateSubCategory,
    useUpdateSubCategory,
    useDeleteSubCategory,
} from "@/hooks/queries/admin/useSubCategoryMutations";
import { toast } from "sonner";
import { useVendorCatalogSubCategories } from "@/hooks/queries/useVendorCatalogSubCategories";

const ITEMS_PER_PAGE = 5;

interface Category {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
    description?: string;
    createdAt?: string;
}

interface SubCategory {
    id: number;
    categoryId: number;
    name: string;
    slug: string;
    isActive: boolean;
    description?: string;
    createdAt?: string;
}

interface CategoryWithSubs extends Category {
    subCategories: SubCategory[];
}

export default function AdminCategories() {
    // Fetch categories
    const { data: categoriesData = [], isLoading } = useVendorCatalogCategories();

    // Fetch all subcategories
    const { data: allSubCategories = [] } = useVendorCatalogSubCategories();

    // Mutations
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const deleteCategory = useDeleteCategory();
    const createSubCategory = useCreateSubCategory();
    const updateSubCategory = useUpdateSubCategory();
    const deleteSubCategory = useDeleteSubCategory();

    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
        new Set(),
    );

    // Search & pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Transform categories to include subcategories
    const categories: CategoryWithSubs[] = useMemo(() => {
        return categoriesData.map((cat) => ({
            ...cat,
            subCategories: allSubCategories.filter(sub => sub.categoryId === cat.id),
        }));
    }, [categoriesData, allSubCategories]);

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categories;
        const q = searchQuery.toLowerCase();
        return categories.filter(
            (cat) =>
                cat.name.toLowerCase().includes(q) ||
                cat.description?.toLowerCase().includes(q) ||
                cat.subCategories.some(
                    (s) =>
                        s.name.toLowerCase().includes(q) ||
                        s.description?.toLowerCase().includes(q),
                ),
        );
    }, [categories, searchQuery]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredCategories.length / ITEMS_PER_PAGE),
    );
    const paginatedCategories = filteredCategories.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    // Reset page when search changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    // Category dialog
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );
    const [categoryForm, setCategoryForm] = useState({
        name: "",
        description: "",
    });

    // Subcategory dialog
    const [subDialogOpen, setSubDialogOpen] = useState(false);
    const [subParentId, setSubParentId] = useState<number | null>(null);
    const [editingSub, setEditingSub] = useState<SubCategory | null>(null);
    const [subForm, setSubForm] = useState({ name: "", description: "" });

    // Delete dialog
    const [deleteTarget, setDeleteTarget] = useState<{
        type: "category" | "subcategory";
        categoryId: number;
        subId?: number;
    } | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // Category CRUD
    const openAddCategory = () => {
        setEditingCategory(null);
        setCategoryForm({ name: "", description: "" });
        setCategoryDialogOpen(true);
    };

    const openEditCategory = (cat: Category) => {
        setEditingCategory(cat);
        setCategoryForm({ name: cat.name, description: cat.description || "" });
        setCategoryDialogOpen(true);
    };

    const saveCategory = async () => {
        if (!categoryForm.name.trim()) return;

        try {
            if (editingCategory) {
                await updateCategory.mutateAsync({
                    id: editingCategory.id,
                    name: categoryForm.name,
                    description: categoryForm.description,
                });
                toast.success(`"${categoryForm.name}" has been updated.`);
            } else {
                await createCategory.mutateAsync({
                    name: categoryForm.name,
                });
                toast.success(`"${categoryForm.name}" has been added.`);
            }
            setCategoryDialogOpen(false);
        } catch (error) {
            toast.error(
                editingCategory
                    ? "Failed to update category"
                    : "Failed to create category",
            );
        }
    };

    // Subcategory CRUD
    const openAddSub = (categoryId: number) => {
        setSubParentId(categoryId);
        setEditingSub(null);
        setSubForm({ name: "", description: "" });
        setSubDialogOpen(true);
    };

    const openEditSub = (categoryId: number, sub: SubCategory) => {
        setSubParentId(categoryId);
        setEditingSub(sub);
        setSubForm({ name: sub.name, description: sub.description || "" });
        setSubDialogOpen(true);
    };

    const saveSub = async () => {
        if (!subForm.name.trim() || !subParentId) return;

        try {
            if (editingSub) {
                await updateSubCategory.mutateAsync({
                    id: editingSub.id,
                    name: subForm.name,
                    categoryId: subParentId,
                });
                toast.success(`"${subForm.name}" has been updated.`);
            } else {
                await createSubCategory.mutateAsync({
                    name: subForm.name,
                    categoryId: subParentId,
                });
                toast.success(`"${subForm.name}" has been added.`);
                
                // Expand the category to show the new subcategory
                setExpandedCategories((prev) => new Set(prev).add(subParentId));
            }
            setSubDialogOpen(false);
        } catch (error) {
            toast.error(
                editingSub
                    ? "Failed to update subcategory"
                    : "Failed to create subcategory",
            );
        }
    };

    // Delete
    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            if (deleteTarget.type === "category") {
                const cat = categories.find(
                    (c) => c.id === deleteTarget.categoryId,
                );
                await deleteCategory.mutateAsync(deleteTarget.categoryId);
                toast.success(
                    `"${cat?.name}" and its subcategories have been removed.`,
                );
            } else if (deleteTarget.subId) {
                await deleteSubCategory.mutateAsync(deleteTarget.subId);
                toast.success("Subcategory deleted");
            }
            setDeleteTarget(null);
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    if (isLoading) {
        return (
            <div>
                <PageHeader
                    title="Categories"
                    description="Manage vendor catalog categories and subcategories"
                >
                    <Button
                        disabled
                        className="gradient-primary text-primary-foreground"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Category
                    </Button>
                </PageHeader>
                <Card>
                    <CardContent className="flex items-center justify-center py-16">
                        <p className="text-muted-foreground">
                            Loading categories...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Categories"
                description="Manage vendor catalog categories and subcategories"
            >
                <Button
                    onClick={openAddCategory}
                    className="gradient-primary text-primary-foreground"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Category
                </Button>
            </PageHeader>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search categories or subcategories..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {searchQuery && (
                    <p className="text-sm text-muted-foreground mt-2">
                        {filteredCategories.length} result
                        {filteredCategories.length !== 1 ? "s" : ""} found
                    </p>
                )}
            </div>

            {filteredCategories.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <FolderOpen className="h-12 w-12 mb-4" />
                        <p className="text-lg font-medium">
                            {searchQuery
                                ? "No matching categories"
                                : "No categories yet"}
                        </p>
                        <p className="text-sm mt-1">
                            {searchQuery
                                ? "Try a different search term."
                                : "Create your first category to get started."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="space-y-3">
                        {paginatedCategories.map((cat) => {
                            const isExpanded = expandedCategories.has(cat.id);
                            return (
                                <Card key={cat.id} className="overflow-hidden">
                                    <div
                                        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-smooth"
                                        onClick={() => toggleExpand(cat.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? (
                                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                            )}
                                            <div className="p-2 rounded-lg bg-primary/10 hidden sm:inline-block">
                                                <Layers className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground text-sm sm:text-base">
                                                    {cat.name}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary" className="capitalize whitespace-nowrap text-xs">
                                                {cat.subCategories.length}{" "}
                                                subcategories
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    asChild
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openAddSub(cat.id);
                                                        }}
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />{" "}
                                                        Add Subcategory
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditCategory(
                                                                cat,
                                                            );
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />{" "}
                                                        Edit Category
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteTarget({
                                                                type: "category",
                                                                categoryId:
                                                                    cat.id,
                                                            });
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />{" "}
                                                        Delete Category
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-border">
                                            {cat.subCategories.length === 0 ? (
                                                <div className="px-5 py-6 text-center text-muted-foreground">
                                                    <p className="text-sm">
                                                        No subcategories yet.
                                                    </p>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="mt-1"
                                                        onClick={() =>
                                                            openAddSub(cat.id)
                                                        }
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />{" "}
                                                        Add one
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-border">
                                                    {cat.subCategories.map(
                                                        (sub) => (
                                                            <div
                                                                key={sub.id}
                                                                className="flex items-center justify-between px-5 py-3 pl-16 hover:bg-muted/20 transition-smooth"
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-foreground text-sm">
                                                                        {
                                                                            sub.name
                                                                        }
                                                                    </p>
                                                                    {sub.description && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {
                                                                                sub.description
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-7 w-7"
                                                                        >
                                                                            <MoreVertical className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                openEditSub(
                                                                                    cat.id,
                                                                                    sub,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Edit className="h-4 w-4 mr-2" />{" "}
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            className="text-destructive focus:text-destructive"
                                                                            onClick={() =>
                                                                                setDeleteTarget(
                                                                                    {
                                                                                        type: "subcategory",
                                                                                        categoryId:
                                                                                            cat.id,
                                                                                        subId: sub.id,
                                                                                    },
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" />{" "}
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-muted-foreground">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                                –
                                {Math.min(
                                    currentPage * ITEMS_PER_PAGE,
                                    filteredCategories.length,
                                )}{" "}
                                of {filteredCategories.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.max(1, p - 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <Button
                                        key={page}
                                        variant={
                                            page === currentPage
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        className="w-9"
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Category Dialog */}
            <Dialog
                open={categoryDialogOpen}
                onOpenChange={setCategoryDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? "Edit Category" : "Add Category"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label htmlFor="cat-name">Category Name</Label>
                            <Input
                                id="cat-name"
                                value={categoryForm.name}
                                onChange={(e) =>
                                    setCategoryForm((p) => ({
                                        ...p,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="e.g. Photography"
                                className="mt-1.5"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCategoryDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={saveCategory}
                            disabled={
                                !categoryForm.name.trim() ||
                                createCategory.isPending ||
                                updateCategory.isPending
                            }
                        >
                            {createCategory.isPending ||
                            updateCategory.isPending
                                ? "Saving..."
                                : editingCategory
                                  ? "Save Changes"
                                  : "Create Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Subcategory Dialog */}
            <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingSub
                                ? "Edit Subcategory"
                                : "Add Subcategory"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label htmlFor="sub-name">Subcategory Name</Label>
                            <Input
                                id="sub-name"
                                value={subForm.name}
                                onChange={(e) =>
                                    setSubForm((p) => ({
                                        ...p,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="e.g. Wedding Photography"
                                className="mt-1.5"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSubDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={saveSub}
                            disabled={
                                !subForm.name.trim() ||
                                createSubCategory.isPending ||
                                updateSubCategory.isPending
                            }
                        >
                            {createSubCategory.isPending ||
                            updateSubCategory.isPending
                                ? "Saving..."
                                : editingSub
                                  ? "Save Changes"
                                  : "Add Subcategory"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget?.type === "category"
                                ? "This will permanently delete this category and all its subcategories. This action cannot be undone."
                                : "This will permanently delete this subcategory. This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={
                                deleteCategory.isPending ||
                                deleteSubCategory.isPending
                            }
                        >
                            {deleteCategory.isPending ||
                            deleteSubCategory.isPending
                                ? "Deleting..."
                                : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}