"use client";

// === Mock Image Component ===
const Image = ({ src, alt, width, height, className, onError }: { src: string, alt: string, width: number, height: number, className: string, onError: (e: any) => void }) => (
    <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={onError}
        style={{ width: `${width}px`, height: `${height}px`, objectFit: 'cover' }}
    />
);

import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Upload,
    Pencil,
    Trash2,
    Search,
    X,
    ChevronLeft, // ໃຊ້ແທນ HiChevronLeft
    ChevronRight, // ໃຊ້ແທນ HiChevronRight
    AlertCircle
} from 'lucide-react';
import { useCategoryStore } from '@/store/category/categoryStore';
import { toast, Toaster } from 'sonner';

// === Custom Input Component ===
const CustomInput = ({ label, id, ...props }: { label: string, id: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
        </label>
        <input
            id={id}
            {...props}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 dark:bg-dark-2 dark:border-gray-700 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition duration-200"
        />
    </div>
);

// === Utility Function ===
const getCategoryImageUrl = (catimg: string | File | null | undefined): string => {
    if (!catimg) return "/product/producy-01.png";
    if (catimg instanceof File) return URL.createObjectURL(catimg);
    if (typeof catimg === "string" && (catimg.startsWith("http") || catimg.startsWith("blob:"))) return catimg;
    if (typeof catimg === "string") return `${process.env.NEXT_PUBLIC_API_URL}/upload/category/${catimg}`;
    return "/product/producy-01.png";
};

// === Types ===
type Category = {
    id: number;
    name: string;
    code: string | null;
    catimg: string | null;
};

export default function CategoryManagement() {
    // === Store ===
    const {
        categories,
        loading,
        error,
        getCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        clearError
    } = useCategoryStore();

    // === Local State ===
    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // === Pagination State ===
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // === Form State ===
    const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
    const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState<{ name: string; code: string }>({
        name: '',
        code: ''
    });

    // === Effects ===
    useEffect(() => {
        getCategories();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // === Handlers ===
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewCategory((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            setCategoryImageFile(file);
            setCategoryImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setIsProcessing(true);
        try {
            if (isEdit && editingCategory) {
                await updateCategory(editingCategory.id, {
                    ...newCategory,
                    catimg: categoryImageFile || undefined
                });
                getCategories();
                toast.success('ອັບເດດໝວດໝູ່ສຳເລັດ');
            } else {
                await createCategory({
                    ...newCategory,
                    catimg: categoryImageFile || undefined
                });
                getCategories();
                toast.success('ເພີ່ມໝວດໝູ່ໃໝ່ສຳເລັດ');
            }
            handleDialogClose();
        } catch (err: any) {
            console.error('Failed to save category', err);
            const errorMessage = (err.response?.data?.message || err.message || 'ການບັນທຶກລົ້ມເຫລວ') as string;
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setNewCategory({ name: '', code: '' });
        setCategoryImageFile(null);
        setCategoryImagePreview(null);
        setIsEdit(false);
        setEditingCategory(null);
        clearError();
    };

    const handleEdit = (category: Category) => {
        setIsEdit(true);
        setEditingCategory(category);
        setNewCategory({
            name: category.name,
            code: category.code ?? ""
        });
        setCategoryImagePreview(getCategoryImageUrl(category.catimg));
        setCategoryImageFile(null);
        getCategories();
        setIsOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບໝວດໝູ່ນີ້?')) {
            try {
                await deleteCategory(id);
                getCategories();
                toast.success('ລົບໝວດໝູ່ສຳເລັດ');
            } catch (err: any) {
                console.error('Failed to delete category', err);
                const errorMessage = (err.response?.data?.message || err.message || 'ການລົບລົ້ມເຫລວ') as string;
                toast.error(errorMessage);
            }
        }
    };

    const handleDialogClose = () => {
        if (isProcessing) return;
        setIsOpen(false);
        setTimeout(() => resetForm(), 300);
    };

    // === Filter Logic ===
    const filteredCategories = categories.filter((cat) =>
        (cat.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.code ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // === Pagination Logic ===
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCategories = filteredCategories.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800 sm:p-8 font-sans">
            <Toaster position="top-right" richColors />
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg flex justify-between items-center" role="alert">
                    <p className="text-red-700 font-medium flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> ຂໍ້ຜິດພາດ: {error}
                    </p>
                    <button onClick={clearError} className="text-sm text-red-500 hover:text-red-700 font-semibold">ປິດ</button>
                </div>
            )}

            {/* === Toolbar === */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 sm:py-5">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ຄົ້ນຫາຕາມຊື່ ຫຼື ລະຫັດ..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none transition-shadow focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setIsOpen(true);
                    }}
                    className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-95"
                >
                    <Upload className="w-5 h-5" />
                    <span>ເພີ່ມໝວດໝູ່</span>
                </button>
            </div>

            {/* === Table === */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <Table className="min-w-full">
                    <TableHeader className="bg-gray-50 dark:bg-gray-700/50">
                        <TableRow>
                            <TableHead className="pl-6 pr-4 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">ຊື່ໝວດໝູ່</TableHead>
                            <TableHead className="pr-6 pl-4 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">ຈັດການ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="py-12 text-center text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span>ກຳລັງໂຫລດຂໍ້ມູນ...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : currentCategories.map((category, index) => (
                            <TableRow
                                key={`${category.id}-${index}`}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <TableCell className="pl-6 pr-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-4">
                                        <Image
                                            src={getCategoryImageUrl(category.catimg)}
                                            className="w-14 h-14 object-cover rounded-lg flex-shrink-0 bg-gray-200 dark:bg-gray-700"
                                            width={56}
                                            height={56}
                                            alt={`Image for Category ${category.name}`}
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/60x60/e0e0e0/909090?text=Error';
                                            }}
                                        />
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{category.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Code: {category.code ?? 'N/A'}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="pr-6 pl-4 py-4 whitespace-nowrap text-right">
                                    <div className='flex justify-end gap-3 items-center'>
                                        <button
                                            className="p-2 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/30 transition-colors"
                                            onClick={() => handleEdit(category)}
                                            title="ແກ້ໄຂ"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            className="p-2 rounded-full text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/30 transition-colors"
                                            onClick={() => handleDelete(category.id)}
                                            title="ລົບ"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {!loading && filteredCategories.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <div className="text-xl font-semibold text-gray-500 dark:text-gray-400">ບໍ່ພົບຂໍ້ມູນ</div>
                        <p className="text-gray-400 dark:text-gray-500">ບໍ່ພົບຂໍ້ມູນໝວດໝູ່ທີ່ກົງກັບການຄົ້ນຫາ</p>
                    </div>
                )}
            </div>

            {/* === Pagination (New Design) === */}
            {filteredCategories.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>ສະແດງ:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-700 dark:text-gray-200"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                        <span>/ ໜ້າ (ທັງໝົດ {filteredCategories.length})</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:border-transparent dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:flex gap-1">
                            {getPageNumbers().map((page, idx) => (
                                page === '...' ? (
                                    <span key={`dots-${idx}`} className="px-3 py-1 text-gray-400">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(Number(page))}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                            currentPage === page
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}
                        </div>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:border-transparent dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* === Modal/Dialog === */}
            {isOpen && (
                <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div
                        className="fixed inset-0 bg-gray-900/75 transition-opacity backdrop-blur-sm"
                        onClick={handleDialogClose}
                    ></div>

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-200 dark:border-gray-700">
                                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="relative text-center mb-6">
                                        <button
                                            type="button"
                                            onClick={handleDialogClose}
                                            disabled={isProcessing}
                                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center group disabled:opacity-50"
                                        >
                                            <X className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                                        </button>

                                        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                                            {isEdit ? <Pencil className="h-8 w-8 text-white" /> : <Upload className="h-8 w-8 text-white" />}
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" id="modal-title">
                                            {isEdit ? 'ແກ້ໄຂໝວດໝູ່' : 'ເພີ່ມໝວດໝູ່ໃໝ່'}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium px-4">
                                            {isEdit ? 'ແກ້ໄຂຂໍ້ມູນໝວດໝູ່ສິນຄ້າ' : 'ກະລຸນາປ້ອນຂໍ້ມູນໝວດໝູ່ໃໝ່'}
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                                        <CustomInput
                                            label="ຊື່ໝວດໝູ່"
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={newCategory.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="ເຊັ່ນ: ເຄື່ອງດື່ມ"
                                        />

                                        <CustomInput
                                            label="ລະຫັດ (Code)"
                                            id="code"
                                            type="number"
                                            name="code"
                                            value={newCategory.code}
                                            onChange={handleInputChange}
                                            placeholder="ເຊັ່ນ: 1001"
                                        />

                                        <div className='relative block w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-blue-500 transition-colors'>
                                            <input
                                                type="file"
                                                name="catimg"
                                                id="catimg"
                                                onChange={handleImageChange}
                                                accept="image/png, image/jpg, image/jpeg, image/svg+xml"
                                                hidden
                                            />
                                            <label
                                                htmlFor="catimg"
                                                className="flex cursor-pointer flex-col items-center justify-center p-4 sm:py-7.5"
                                            >
                                                <div className="flex size-14 items-center justify-center rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
                                                    <Upload className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                                </div>
                                                <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    <span className="text-blue-600 dark:text-blue-400">ຄລິກເພື່ອອັບໂຫລດ</span> ຫຼື ລາກວາງ
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                                    PNG, JPG, SVG (ສູງສຸດ 800x800px)
                                                </p>
                                            </label>
                                        </div>

                                        {categoryImagePreview && (
                                            <div className="mt-2">
                                                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ຮູບຕົວຢ່າງ:</p>
                                                <Image
                                                    src={categoryImagePreview}
                                                    alt="Category Preview"
                                                    width={100}
                                                    height={100}
                                                    className="rounded-lg border border-gray-200 dark:border-gray-700"
                                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/100x100/e0e0e0/909090?text=Error'; }}
                                                />
                                            </div>
                                        )}

                                        <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                type="button"
                                                onClick={handleDialogClose}
                                                disabled={isProcessing}
                                                className="px-6 py-2.5 text-sm font-medium rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                ຍົກເລີກ
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={isProcessing}
                                                className="px-6 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95"
                                            >
                                                {isProcessing ? 'ກຳລັງບັນທຶກ...' : (isEdit ? 'ບັນທຶກ' : 'ເພີ່ມ')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}