"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { PencilSquareIcon } from '@/assets/icons';
import { useAuthStore } from '@/store/auth/authStore';
import { Button } from '@/components/ui-elements/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { 
    HiOutlineSearch, 
    HiOutlineFilter, 
    HiChevronLeft, 
    HiChevronRight,
    HiCollection,
    HiClock,
    HiCheckCircle,
    HiXCircle 
} from 'react-icons/hi';
import { Category } from '@/types/product';
import { useCategoryStore } from '@/store/category/categoryStore';
import { useProductApproveStore, ProductApprovalPayload } from '@/store/product/productApproveStore';
import { ProductApprove, ShopPartial } from '@/types/product_approve';
import { toast } from 'sonner';

// --- Utility Components & Functions ---

const Image = ({ src, alt, width, height, className, onError }: { src: string, alt: string, width: number, height: number, className: string, onError: (e: any) => void }) => (
    <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={onError}
        style={{ width: `${width}px`, height: `${height}px`, objectFit: 'cover', flexShrink: 0 }}
    />
);

const getProductImageUrl = (pimg: string | File | null | undefined): string => {
    if (!pimg || pimg === null) return "https://placehold.co/400x400/e0e0e0/909090?text=No+Image";
    if (pimg instanceof File) return URL.createObjectURL(pimg);
    if (typeof pimg === "string" && (pimg.startsWith("http") || pimg.startsWith("blob:"))) return pimg;
    if (typeof pimg === "string") {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const cleanApiUrl = apiUrl.replace(/\/$/, "");
        return `${cleanApiUrl}/upload/product/${pimg}`;
    }
    return "https://placehold.co/400x400/e0e0e0/909090?text=Error";
};

const CustomInput = ({ label, id, ...props }: { label: string, id: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
        <input
            id={id}
            {...props}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition duration-200 dark:bg-dark-2 dark:border-gray-700 dark:text-white"
        />
    </div>
);

const CustomSelect = ({ label, id, children, ...props }: { label: string, id: string, children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
        <div className="relative">
            <select
                id={id}
                {...props}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition duration-200 appearance-none dark:bg-dark-2 dark:border-gray-700 dark:text-white"
            >
                {children}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    </div>
);

type StatusFilter = 'all' | 1 | 2 | 3;

interface EditFormData {
    categoryId: number | null;
    percent: number | null;
    approved: number;
}

export default function ApproveProduct() {
    // === STORE HOOKS ===
    const { products, loading, error, getProductsPendingApproval, updateProductApproval, clearError } = useProductApproveStore();
    const { user } = useAuthStore();
    const { categories, getCategories } = useCategoryStore();

    // === COMPONENT STATE ===
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
    const [filterShopId, setFilterShopId] = useState<string>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductApprove | null>(null);
    const [formData, setFormData] = useState<EditFormData>({ categoryId: null, percent: 0, approved: 1 });
    const [isProcessing, setIsProcessing] = useState(false);

    // === EFFECTS ===
    useEffect(() => {
        getProductsPendingApproval();
        getCategories();
    }, [getProductsPendingApproval, getCategories]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, filterCategoryId, filterShopId]);

    // === DATA PROCESSING ===
    const uniqueShops = useMemo(() => {
        const shopsMap = new Map<number, ShopPartial>();
        products.forEach(p => {
            if (!shopsMap.has(p.shop.id)) shopsMap.set(p.shop.id, p.shop);
        });
        return Array.from(shopsMap.values());
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            if (statusFilter !== 'all' && product.approved !== statusFilter) return false;
            if (filterCategoryId !== 'all' && product.categoryId !== parseInt(filterCategoryId)) return false;
            if (filterShopId !== 'all' && product.shopId !== parseInt(filterShopId)) return false;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const titleMatch = (product.title ?? "").toLowerCase().includes(term);
                const detailMatch = (product.detail ?? "").toLowerCase().includes(term);
                const shopMatch = (product.shop.name ?? "").toLowerCase().includes(term);
                if (!titleMatch && !detailMatch && !shopMatch) return false;
            }
            return true;
        });
    }, [products, statusFilter, filterCategoryId, filterShopId, searchTerm]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    const counts = useMemo(() => ({
        pending: products.filter(p => p.approved === 1).length,
        rejected: products.filter(p => p.approved === 3).length,
        approved: products.filter(p => p.approved === 2).length,
        all: products.length
    }), [products]);

    // === HANDLERS ===
    const openEditModal = (product: ProductApprove) => {
        setSelectedProduct(product);
        setFormData({
            categoryId: product.categoryId,
            percent: product.percent,
            approved: product.approved
        });
        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedProduct(null), 300);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let finalValue: string | number | null = value;
        if (name === 'categoryId') finalValue = value === "" ? null : parseInt(value, 10);
        else if (name === 'percent') finalValue = value === "" ? null : parseInt(value, 10);
        else if (name === 'approved') finalValue = parseInt(value, 10);
        setFormData(prev => ({ ...prev, [name]: finalValue as any }));
    };

    const handleUpdateProduct = async () => {
        if (!selectedProduct || !user) return;
        setIsProcessing(true);
        try {
            const payload: ProductApprovalPayload = { ...formData };
            await updateProductApproval(selectedProduct.id, payload);
            await getProductsPendingApproval();
            toast.success(`ອັບເດດສິນຄ້າ "${selectedProduct.title}" ສຳເລັດແລ້ວ`);
            closeEditModal();
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "ເກີດຂໍ້ຜິດພາດ");
        } finally {
            setIsProcessing(false);
        }
    };

    const getApprovalStatus = (approved: number) => {
        switch (approved) {
            case 1: return { text: 'ລໍຖ້າ', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' };
            case 2: return { text: 'ອະນຸມັດ', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' };
            case 3: return { text: 'ປະຕິເສດ', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' };
            default: return { text: 'ບໍ່ຮູ້', color: 'bg-gray-100 text-gray-800' };
        }
    };

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

    const statusTabs = [
        { 
            key: 'all' as StatusFilter, 
            label: 'ສິນຄ້າທັງໝົດ', 
            count: counts.all, 
            icon: HiCollection,
            activeClass: 'border-primary bg-primary/5 text-primary ring-1 ring-primary',
            inactiveClass: 'border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary'
        },
        { 
            key: 1 as StatusFilter, 
            label: 'ລໍຖ້າອະນຸມັດ', 
            count: counts.pending, 
            icon: HiClock,
            activeClass: 'border-yellow-500 bg-yellow-50 text-yellow-700 ring-1 ring-yellow-500',
            inactiveClass: 'border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-600'
        },
        { 
            key: 2 as StatusFilter, 
            label: 'ອະນຸມັດແລ້ວ', 
            count: counts.approved, 
            icon: HiCheckCircle,
            activeClass: 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500',
            inactiveClass: 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600'
        },
        { 
            key: 3 as StatusFilter, 
            label: 'ປະຕິເສດ', 
            count: counts.rejected, 
            icon: HiXCircle,
            activeClass: 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500',
            inactiveClass: 'border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600'
        }
    ];

    if (loading && products.length === 0) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-dark-2 dark:border-gray-800 sm:p-8">
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center text-red-700">
                    <p className="font-medium truncate mr-4">⚠️ ຂໍ້ຜິດພາດ: {error}</p>
                    <button onClick={clearError} className="text-sm hover:underline font-semibold shrink-0">ປິດ</button>
                </div>
            )}

            {/* === Status Tabs === */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statusTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setStatusFilter(tab.key)}
                        className={`relative p-5 rounded-2xl border transition-all duration-200 text-left overflow-hidden group ${
                            statusFilter === tab.key 
                                ? tab.activeClass 
                                : `${tab.inactiveClass} bg-white dark:bg-dark-3 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-dark-2`
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2 min-w-0">
                            {/* FIX: truncate label text so it never breaks the card layout */}
                            <p className="text-sm font-medium z-10 relative truncate mr-2 leading-snug">{tab.label}</p>
                            <tab.icon className={`w-5 h-5 z-10 relative opacity-80 shrink-0 ${statusFilter === tab.key ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`} />
                        </div>
                        <p className="text-3xl font-extrabold z-10 relative">{tab.count}</p>
                        <tab.icon className="absolute -bottom-4 -right-4 w-24 h-24 opacity-5 transform -rotate-12 pointer-events-none" />
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1 min-w-0">
                    {/* FIX: flex-1 min-w-0 prevents search bar from overflowing */}
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ, ລາຍລະອຽດ..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-dark outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all dark:border-gray-700 dark:bg-dark-3 dark:text-white"
                    />
                    <HiOutlineSearch className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                
                <div className="flex gap-2 shrink-0">
                    {/* FIX: shrink-0 keeps filter selects from collapsing, max-w clamps them */}
                    <select
                        value={filterCategoryId}
                        onChange={(e) => setFilterCategoryId(e.target.value)}
                        className="max-w-[160px] px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-dark-3 dark:text-white truncate"
                    >
                        <option value="all">ທຸກປະເພດ</option>
                        {categories.map((cat: Category) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                    </select>

                    <select
                        value={filterShopId}
                        onChange={(e) => setFilterShopId(e.target.value)}
                        className="max-w-[160px] px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-dark-3 dark:text-white truncate"
                    >
                        <option value="all">ທຸກຮ້ານຄ້າ</option>
                        {uniqueShops.map((shop: ShopPartial) => (<option key={shop.id} value={shop.id}>{shop.name}</option>))}
                    </select>
                </div>
            </div>

            {/* Table */}
            {/*
                FIX: `table-fixed` + explicit column widths via <colgroup> ensures columns 
                never blow past their allocated space when text is long.
                Each column gets a fixed or percentage-based width, and text is clipped 
                with truncate/line-clamp inside the cells.
            */}
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <Table className="min-w-full table-fixed">
                        <colgroup><col className="w-[35%]" /><col className="w-[18%]" /><col className="w-[16%]" /><col className="w-[14%]" /><col className="w-[10%]" /><col className="w-[7%]" /></colgroup>
                        <TableHeader className="bg-gray-50/50 dark:bg-dark-3">
                            <TableRow>
                                <TableHead className="pl-6 py-4 font-semibold text-gray-600 dark:text-gray-300">ສິນຄ້າ</TableHead>
                                <TableHead className="py-4 font-semibold text-gray-600 dark:text-gray-300">ຮ້ານຄ້າ</TableHead>
                                <TableHead className="py-4 font-semibold text-gray-600 dark:text-gray-300">ລາຄາ / ສ່ວນແບ່ງ</TableHead>
                                <TableHead className="py-4 font-semibold text-gray-600 dark:text-gray-300">ເງິນປັນຜົນ</TableHead>
                                <TableHead className="py-4 font-semibold text-gray-600 dark:text-gray-300 text-center">ສະຖານະ</TableHead>
                                <TableHead className='pr-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right'>ຈັດການ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentProducts.map((product) => {
                                const status = getApprovalStatus(product.approved);
                                return (
                                    <TableRow key={product.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-dark-3/30 transition-colors">
                                        
                                        {/* ສິນຄ້າ column — image is shrink-0, text block is min-w-0 */}
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="shrink-0">
                                                    <Image
                                                        src={getProductImageUrl(product.pimg)}
                                                        alt={product.title ?? 'Product'}
                                                        width={48} height={48}
                                                        className="w-12 h-12 object-cover rounded-lg bg-gray-100 border border-gray-200 dark:border-gray-700"
                                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/48x48/e0e0e0/909090?text=IMG'; }}
                                                    />
                                                </div>
                                                {/* FIX: min-w-0 is REQUIRED on the text wrapper inside a flex child 
                                                    so truncate / line-clamp actually clips the text */}
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-900 dark:text-white truncate" title={product.title ?? ''}>
                                                        {product.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                        {product.detail}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* ຮ້ານຄ້າ column */}
                                        <TableCell className="py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {/* FIX: overflow-hidden on the wrapper so long shop names clip */}
                                            <div className="overflow-hidden">
                                                <div className="font-medium truncate" title={product.shop.name ?? ''}>{product.shop.name}</div>
                                                <div className="text-xs text-gray-400 truncate">{product.shop.tel}</div>
                                            </div>
                                        </TableCell>

                                        {/* ລາຄາ / ສ່ວນແບ່ງ column */}
                                        <TableCell className="py-4 text-sm">
                                            {/* FIX: tabular-nums keeps number columns tidy and stable-width */}
                                            <div className="font-medium text-gray-900 dark:text-white tabular-nums truncate">
                                                {new Intl.NumberFormat('lo-LA').format(Number(product.price))} ₭
                                            </div>
                                            {product.percent && (
                                                <div className="text-xs text-gray-500 truncate">ສ່ວນແບ່ງ: {product.percent}%</div>
                                            )}
                                        </TableCell>

                                        {/* ເງິນປັນຜົນ column */}
                                        <TableCell className="py-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 tabular-nums truncate">
                                            {new Intl.NumberFormat('lo-LA').format(product.percent ? Number(product.price) * Number(product.percent) / 100 : 0)} ₭
                                        </TableCell>

                                        {/* ສະຖານະ column */}
                                        <TableCell className="py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${status.color}`}>
                                                {status.text}
                                            </span>
                                        </TableCell>

                                        {/* ຈັດການ column */}
                                        <TableCell className="pr-6 py-4 text-right">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                disabled={isProcessing || !user}
                                                className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-blue-50 transition-colors disabled:opacity-50"
                                                title="ແກ້ໄຂ"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <HiOutlineFilter className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບເງື່ອນໄຂ</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredProducts.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                         <span>ສະແດງ:</span>
                         <select 
                            value={itemsPerPage} 
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="border border-gray-200 rounded px-2 py-1 bg-white outline-none focus:border-primary"
                         >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                         </select>
                         <span className="whitespace-nowrap">/ ໜ້າ (ທັງໝົດ {filteredProducts.length})</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:border-transparent dark:border-gray-700 dark:hover:bg-dark-3">
                            <HiChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="hidden sm:flex gap-1">
                             {getPageNumbers().map((page, idx) => (
                                 page === '...' 
                                    ? <span key={`dots-${idx}`} className="px-3 py-1 text-gray-400">...</span> 
                                    : <button 
                                        key={page} 
                                        onClick={() => goToPage(Number(page))}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === page ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'}`}
                                      >
                                        {page}
                                      </button>
                             ))}
                        </div>

                        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:border-transparent dark:border-gray-700 dark:hover:bg-dark-3">
                            <HiChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <Transition appear show={isModalOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => !isProcessing && closeEditModal()}>
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={React.Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95 translate-y-4"
                                enterTo="opacity-100 scale-100 translate-y-0"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100 translate-y-0"
                                leaveTo="opacity-0 scale-95 translate-y-4"
                            >
                                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-900 border dark:border-gray-800">
                                    <div className="flex justify-between items-center mb-6 gap-2 min-w-0">
                                        <DialogTitle as="h3" className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                            ອະນຸມັດສິນຄ້າ
                                        </DialogTitle>
                                        <button onClick={closeEditModal} disabled={isProcessing} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                                            <HiXCircle className="w-6 h-6"/>
                                        </button>
                                    </div>

                                    {/* FIX: Product preview card in modal also gets min-w-0 treatment */}
                                    {selectedProduct && (
                                        <div className="flex items-start gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                            <div className="shrink-0">
                                                <Image 
                                                    src={getProductImageUrl(selectedProduct.pimg)}
                                                    alt="Preview"
                                                    width={64} height={64}
                                                    className="w-16 h-16 rounded-lg object-cover bg-white border border-gray-200 dark:border-gray-600"
                                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/64x64/e0e0e0/909090?text=IMG'; }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 dark:text-white truncate" title={selectedProduct.title ?? ''}>
                                                    {selectedProduct.title}
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={selectedProduct.shop.name ?? ''}>
                                                    {selectedProduct.shop.name}
                                                </p>
                                                <p className="text-sm font-medium text-primary mt-1 tabular-nums">
                                                    {new Intl.NumberFormat('lo-LA').format(Number(selectedProduct.price))} ₭
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={(e) => { e.preventDefault(); handleUpdateProduct(); }}>
                                        <div className="space-y-5">
                                            <CustomSelect label="ໝວດໝູ່ສິນຄ້າ" id="categoryId" name="categoryId" value={formData.categoryId || ''} onChange={handleFormChange}>
                                                <option value="">-- ເລືອກໝວດໝູ່ --</option>
                                                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                                            </CustomSelect>

                                            <div className="grid grid-cols-2 gap-4">
                                                <CustomInput label="ສ່ວນແບ່ງ (%)" type="number" id="percent" name="percent" value={formData.percent || ''} onChange={handleFormChange} placeholder="0" min="0" max="100"/>
                                                <CustomSelect label="ສະຖານະ" id="approved" name="approved" value={formData.approved} onChange={handleFormChange}>
                                                    <option value={1}>⏳ ລໍຖ້າ</option>
                                                    <option value={2}>✓ ອະນຸມັດ</option>
                                                    <option value={3}>✗ ປະຕິເສດ</option>
                                                </CustomSelect>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <button type="button" onClick={closeEditModal} disabled={isProcessing} className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">ຍົກເລີກ</button>
                                            <button type="submit" disabled={isProcessing} className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                                                {isProcessing ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ'}
                                            </button>
                                        </div>
                                    </form>
                                </DialogPanel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}