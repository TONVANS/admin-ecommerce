"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useShopStore } from '@/store/shop/shopStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { 
    HiMiniXMark, 
} from 'react-icons/hi2';
import { 
    HiOutlineSearch, 
    HiChevronLeft, 
    HiChevronRight,
    HiCollection,
    HiClock,
    HiCheckCircle,
    HiXCircle 
} from 'react-icons/hi';
import { CheckIcon, TrashIcon } from '@/assets/icons'; 
import { toast } from 'sonner';

// Type Definitions
type StatusFilter = 'all' | 1 | 2 | 3;

interface ConfirmDialogData {
    shopId: number;
    shopName: string;
    action: 'approve' | 'reject';
}

export default function ShopManagement() {
    const {
        shops,
        loading,
        error,
        getShops,
        updateShopApproval,
        deleteShop,
        clearError
    } = useShopStore();

    // === States ===
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Initial Load
    useEffect(() => {
        getShops();
    }, [getShops]);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    // === Data Processing ===
    
    // Filter Logic
    const filteredShops = useMemo(() => {
        let filtered = shops;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(shop => shop.approved === statusFilter);
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter((shop) =>
                (shop.name ?? "").toLowerCase().includes(lowerTerm) ||
                (shop.tel ?? "").toLowerCase().includes(lowerTerm) ||
                (shop.user?.firstname ?? "").toLowerCase().includes(lowerTerm) ||
                (shop.user?.lastname ?? "").toLowerCase().includes(lowerTerm)
            );
        }
        return filtered;
    }, [shops, statusFilter, searchTerm]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredShops.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentShops = filteredShops.slice(startIndex, endIndex);

    const counts = useMemo(() => ({
        pending: shops.filter(s => s.approved === 1).length,
        rejected: shops.filter(s => s.approved === 3).length,
        approved: shops.filter(s => s.approved === 2).length,
        all: shops.length
    }), [shops]);

    // === Handlers ===
    const showConfirmDialog = (shopId: number, shopName: string, action: 'approve' | 'reject') => {
        setConfirmDialog({ shopId, shopName, action });
    };

    const handleConfirmAction = async () => {
        if (!confirmDialog) return;

        setIsProcessing(true);
        try {
            const approvalStatus = confirmDialog.action === 'approve' ? 2 : 3;
            const actionText = confirmDialog.action === 'approve' ? 'ອະນຸມັດ' : 'ປະຕິເສດ';

            await updateShopApproval(confirmDialog.shopId, approvalStatus);
            await getShops();

            toast.success(`${actionText}ຮ້ານຄ້າສຳເລັດ`, {
                // description: `ຮ້ານ "${confirmDialog.shopName}" ຖືກ${actionText}ຮຽບຮ້ອຍແລ້ວ`
            });
            
            setConfirmDialog(null);
        } catch (err: any) {
            console.error(err);
            toast.error('ເກີດຂໍ້ຜິດພາດ', {
                description: err.response?.data?.message || err.message || 'ບໍ່ສາມາດດຳເນີນການໄດ້'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id: number, shopName: string) => {
        if (confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຮ້ານ "${shopName}"?`)) {
            setIsProcessing(true);
            try {
                await deleteShop(id);
                toast.success('ລຶບຮ້ານຄ້າສຳເລັດ');
            } catch (err: any) {
                toast.error('ເກີດຂໍ້ຜິດພາດ', {
                    description: err.response?.data?.message || err.message
                });
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // Pagination Helpers
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

    const getApprovalStatus = (approved: number) => {
        switch (approved) {
            case 1: return { text: 'ລໍຖ້າ', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' };
            case 2: return { text: 'ອະນຸມັດ', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' };
            case 3: return { text: 'ປະຕິເສດ', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' };
            default: return { text: 'ບໍ່ຮູ້', color: 'bg-gray-100 text-gray-800' };
        }
    };

    // Configuration for Status Tabs
    const statusTabs = [
        { 
            key: 'all' as StatusFilter, 
            label: 'ຮ້ານຄ້າທັງໝົດ', 
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

    if (loading && shops.length === 0) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-gray-dark sm:p-8">
            {/* Error Banner */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center text-red-700">
                    <p className="font-medium flex items-center gap-2">⚠️ {error}</p>
                    <button onClick={clearError} className="text-sm hover:underline font-semibold">ປິດ</button>
                </div>
            )}

            {/* Status Tabs (Widget Style) */}
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
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium z-10 relative">{tab.label}</p>
                            <tab.icon className={`w-5 h-5 z-10 relative opacity-80 ${statusFilter === tab.key ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`} />
                        </div>
                        <p className="text-3xl font-extrabold z-10 relative">{tab.count}</p>
                        
                        {/* Decorative Background Icon (Faded) */}
                        <tab.icon className="absolute -bottom-4 -right-4 w-24 h-24 opacity-5 transform -rotate-12 pointer-events-none" />
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="🔍 ຄົ້ນຫາຊື່ຮ້ານ, ເບີໂທ, ຫຼື ຊື່ເຈົ້າຂອງ..."
                    className="w-full px-5 py-3 pl-12 rounded-lg border border-gray-200 bg-white text-dark outline-none transition-shadow focus:border-primary focus:ring-1 focus:ring-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <HiOutlineSearch className="w-5 h-5" />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 dark:bg-dark-3 border-b border-gray-200 dark:border-gray-700">
                            <TableHead className="pl-6 py-4 font-semibold text-gray-600 dark:text-gray-300">ຊື່ຮ້ານຄ້າ / ລະຫັດ</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-600 dark:text-gray-300">ເບີໂທ</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-600 dark:text-gray-300">ເຈົ້າຂອງ</TableHead>
                            <TableHead className="py-4 font-semibold text-center text-gray-600 dark:text-gray-300">ສະຖານະ</TableHead>
                            <TableHead className='pr-6 py-4 font-semibold text-right text-gray-600 dark:text-gray-300'>ຈັດການ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentShops.map((shop, index) => {
                            const status = getApprovalStatus(shop.approved);
                            return (
                                <TableRow
                                    key={`${shop.id}-${index}`}
                                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-dark-3/50 transition-colors"
                                >
                                    <TableCell className="pl-6 py-4">
                                        <div className="font-semibold text-gray-900 dark:text-white">{shop.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">#{shop.userCode}</div>
                                    </TableCell>
                                    <TableCell className="py-4 text-sm text-gray-600 dark:text-gray-300">{shop.tel}</TableCell>
                                    <TableCell className="py-4 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="font-medium text-gray-900 dark:text-white">{shop.user?.firstname} {shop.user?.lastname}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {shop.user?.unit?.name || '-'} / {shop.user?.chu?.name || '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                            {status.text}
                                        </span>
                                    </TableCell>
                                    <TableCell className="pr-6 py-4 text-right">
                                        <div className='flex justify-end gap-2'>
                                            {/* Approve Button */}
                                            {shop.approved !== 2 && (
                                                <button
                                                    onClick={() => showConfirmDialog(shop.id, shop.name, 'approve')}
                                                    disabled={isProcessing}
                                                    className="p-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
                                                    title="ອະນຸມັດ"
                                                >
                                                    <CheckIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            {/* Reject Button */}
                                            {shop.approved !== 3 && (
                                                <button
                                                    onClick={() => showConfirmDialog(shop.id, shop.name, 'reject')}
                                                    disabled={isProcessing}
                                                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                                                    title="ປະຕິເສດ"
                                                >
                                                    <HiMiniXMark className="w-5 h-5" />
                                                </button>
                                            )}
                                            {/* Delete Button */}
                                            {/* <button
                                                onClick={() => handleDelete(shop.id, shop.name)}
                                                disabled={isProcessing}
                                                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                                                title="ລຶບ"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button> */}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                {filteredShops.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="text-4xl mb-3">🔍</div>
                        <div className="text-gray-500 dark:text-gray-400">ບໍ່ພົບຂໍ້ມູນຮ້ານຄ້າທີ່ກົງກັບເງື່ອນໄຂ</div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredShops.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
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
                         <span>/ ໜ້າ (ຈາກທັງໝົດ {filteredShops.length})</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:border-transparent dark:border-gray-700 dark:hover:bg-dark-3">
                            <HiChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="hidden sm:flex gap-1">
                             {getPageNumbers().map((page, idx) => (
                                 page === '...' ? <span key={`dots-${idx}`} className="px-3 py-1 text-gray-400">...</span> : 
                                 <button 
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

            {/* === CONFIRMATION DIALOG === */}
            <Transition appear show={!!confirmDialog} as={React.Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => !isProcessing && setConfirmDialog(null)}>
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
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={React.Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800 border dark:border-gray-700">
                                    
                                    <div className="flex flex-col items-center text-center">
                                        {/* Dynamic Icon */}
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                            confirmDialog?.action === 'approve' 
                                            ? 'bg-green-100 text-green-600' 
                                            : 'bg-red-100 text-red-600'
                                        }`}>
                                            {confirmDialog?.action === 'approve' 
                                                ? <CheckIcon className="w-8 h-8" /> 
                                                : <HiMiniXMark className="w-8 h-8" />
                                            }
                                        </div>

                                        <DialogTitle as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-white">
                                            {confirmDialog?.action === 'approve' ? 'ຢືນຢັນການອະນຸມັດ' : 'ຢືນຢັນການປະຕິເສດ'}
                                        </DialogTitle>
                                        
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                ທ່ານຕ້ອງການ {confirmDialog?.action === 'approve' 
                                                    ? <span className="font-bold text-green-600">ອະນຸມັດ</span> 
                                                    : <span className="font-bold text-red-600">ປະຕິເສດ</span>
                                                } ຮ້ານຄ້າ <br/> 
                                                "<span className="font-semibold text-gray-800 dark:text-gray-200">{confirmDialog?.shopName}</span>" ແທ້ບໍ່?
                                            </p>
                                        </div>

                                        <div className="mt-6 flex w-full gap-3">
                                            <button
                                                type="button"
                                                className="flex-1 justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                                                onClick={() => setConfirmDialog(null)}
                                                disabled={isProcessing}
                                            >
                                                ຍົກເລີກ
                                            </button>
                                            <button
                                                type="button"
                                                className={`flex-1 justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-70 ${
                                                    confirmDialog?.action === 'approve'
                                                    ? 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500'
                                                    : 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500'
                                                }`}
                                                onClick={handleConfirmAction}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? 'ກຳລັງປະມວນຜົນ...' : 'ຢືນຢັນ'}
                                            </button>
                                        </div>
                                    </div>
                                </DialogPanel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}