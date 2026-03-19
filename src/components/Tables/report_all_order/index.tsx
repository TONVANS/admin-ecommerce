"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useReportOrderStore } from '@/store/report/reportOrderStore';
import { HiOutlineSearch, HiOutlineFilter, HiChevronLeft, HiChevronRight, HiOutlinePrinter, HiChevronUp, HiChevronDown } from 'react-icons/hi';
import { TbListDetails } from 'react-icons/tb';
import { downloadReportPDF } from '@/utils/pdfReport';

type SortField = 'shopName' | 'shopTotal' | 'shopDivide' | 'productCount';

interface DateRange {
    startDate: string;
    endDate: string;
}

export default function ReportOrder() {
    // === STORE HOOKS ===
    const { reportData, loading, error, getReportOrders, clearError } = useReportOrderStore();

    // === COMPONENT STATE ===
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterShopId, setFilterShopId] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortField>('shopTotal');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // [NEW] State สำหรับเก็บ ID ร้านค้าที่กำลังเปิดดูรายละเอียด
    const [expandedShopIds, setExpandedShopIds] = useState<Set<number>>(new Set());

    // === EFFECTS ===
    useEffect(() => {
        handleFetchReport();
    }, []);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterShopId, sortBy, sortOrder]);

    // === DATA DERIVATION ===
    const uniqueShops = useMemo(() => {
        const shopsMap = new Map();
        reportData.forEach(item => {
            if (!shopsMap.has(item.shop.id)) {
                shopsMap.set(item.shop.id, {
                    id: item.shop.id,
                    name: item.shop.name,
                    tel: item.shop.tel,
                    userCode: item.shop.user.code
                });
            }
        });
        return Array.from(shopsMap.values());
    }, [reportData]);

    const filteredAndSortedData = useMemo(() => {
        let filtered = [...reportData];

        // Filter by shop
        if (filterShopId !== 'all') {
            filtered = filtered.filter(item => item.shop.id === parseInt(filterShopId));
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item => {
                const shopNameMatch = item.shop.name.toLowerCase().includes(term);
                const userMatch = item.shop.user.firstname.toLowerCase().includes(term) ||
                    item.shop.user.lastname.toLowerCase().includes(term);
                const productMatch = item.products.some(p =>
                    p.title.toLowerCase().includes(term)
                );
                return shopNameMatch || userMatch || productMatch;
            });
        }

        // Sort
        filtered.sort((a, b) => {
            let compareValue = 0;

            switch (sortBy) {
                case 'shopName':
                    compareValue = a.shop.name.localeCompare(b.shop.name);
                    break;
                case 'shopTotal':
                    compareValue = a.shopTotal - b.shopTotal;
                    break;
                case 'shopDivide':
                    compareValue = a.shopDivide - b.shopDivide;
                    break;
                case 'productCount':
                    compareValue = a.products.length - b.products.length;
                    break;
                default:
                    compareValue = 0;
            }

            return sortOrder === 'desc' ? -compareValue : compareValue;
        });

        return filtered;
    }, [reportData, filterShopId, searchTerm, sortBy, sortOrder]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentReportData = filteredAndSortedData.slice(startIndex, endIndex);

    // Calculate summary
    const summary = useMemo(() => {
        const total = filteredAndSortedData.reduce((sum, item) => sum + item.shopTotal, 0);
        const divide = filteredAndSortedData.reduce((sum, item) => sum + item.shopDivide, 0);
        const shops = new Set(filteredAndSortedData.map(item => item.shop.id)).size;
        const products = filteredAndSortedData.reduce((sum, item) => sum + item.products.length, 0);

        return { total, divide, shops, products };
    }, [filteredAndSortedData]);

    // === FUNCTIONS ===
    const handleFetchReport = async () => {
        setIsLoadingData(true);
        try {
            await getReportOrders(dateRange.startDate, dateRange.endDate);
        } catch (err) {
            console.error('Failed to fetch report:', err);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
        setDateRange(prev => ({ ...prev, [field]: value }));
    };

    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('lo-LA').format(value);
    };

    // [NEW] ฟังก์ชันสำหรับเปิด/ปิด รายละเอียด
    const toggleShopDetail = (shopId: number) => {
        const newSet = new Set(expandedShopIds);
        if (newSet.has(shopId)) {
            newSet.delete(shopId);
        } else {
            newSet.add(shopId);
        }
        setExpandedShopIds(newSet);
    };

    // [NEW] ฟังก์ชันสำหรับพิมพ์ PDF (Placeholder)// ใช้แทน handlePrintPDF
const handlePrintPDF = (shopId: number) => {
    const shopItem = currentReportData.find(item => item.shop.id === shopId);
    if (shopItem) {
        downloadReportPDF(shopItem);
    }
};


    const getSortIcon = (field: SortField) => {
        if (sortBy !== field) return ' ⇅';
        return sortOrder === 'asc' ? ' ↑' : ' ↓';
    };

    // Pagination handlers
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
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

    if (loading && reportData.length === 0) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[400px]">
                <div className="text-lg animate-pulse">ກຳລັງໂຫລດຂໍ້ມູນ...</div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-dark-2 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">ລາຍງານການສັ່ງຊື້</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg flex justify-between items-center" role="alert">
                    <p className="text-red-700 font-medium">⚠️ ຂໍ້ຜິດພາດ: {error}</p>
                    <button onClick={clearError} className="text-sm text-red-500 hover:text-red-700 font-semibold">ປິດ</button>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 dark:bg-dark-3 dark:border-blue-900">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">ຮ້ານຄ້າທັງໝົດ</p>
                    <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{summary.shops}</p>
                </div>
                <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50 dark:bg-dark-3 dark:border-green-900">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">ສິນຄ້າທັງໝົດ</p>
                    <p className="text-2xl font-extrabold text-green-600 dark:text-green-400 mt-1">{summary.products}</p>
                </div>
                <div className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50 dark:bg-dark-3 dark:border-purple-900">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">ມູນຄ່າທັງໝົດ</p>
                    <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{formatCurrency(summary.total)}</p>
                </div>
                <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50 dark:bg-dark-3 dark:border-amber-900">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">ເງິນປັນຜົນ</p>
                    <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(summary.divide)}</p>
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ວັນທີ່ເລີ່ມຕົ້ນ</label>
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-dark-3 dark:text-white"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ວັນທີ່ສິ້ນສຸດ</label>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-dark-3 dark:text-white"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        onClick={handleFetchReport}
                        disabled={isLoadingData}
                        className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                    >
                        {isLoadingData ? 'ກຳລັງໂຫລດ...' : 'ສະແດງ'}
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ຄົ້ນຫາຮ້ານຄ້າ, ຜູ້ຂາຍ, ສິນຄ້າ..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-dark outline-none transition-shadow focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-dark-3 dark:text-white"
                    />
                    <HiOutlineSearch className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <select
                    value={filterShopId}
                    onChange={(e) => setFilterShopId(e.target.value)}
                    className="md:max-w-xs w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-dark-3 dark:text-white"
                >
                    <option value="all">ທຸກຮ້ານຄ້າ</option>
                    {uniqueShops.map((shop) => (
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <Table className="min-w-full">
                    <TableHeader className="bg-gray-50 dark:bg-dark-3">
                        <TableRow>
                            <TableHead className="pl-6 pr-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-primary" onClick={() => handleSort('shopName')}>
                                ຮ້ານຄ້າ {getSortIcon('shopName')}
                            </TableHead>
                            <TableHead className="px-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">ຜູ້ຂາຍ</TableHead>
                            <TableHead className="px-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">ເບີໂທລະສັບ</TableHead>
                            <TableHead className="px-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-primary" onClick={() => handleSort('productCount')}>
                                ຈຳນວນສິນຄ້າ {getSortIcon('productCount')}
                            </TableHead>
                            <TableHead className="px-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-primary text-right" onClick={() => handleSort('shopTotal')}>
                                ມູນຄ່າທັງໝົດ {getSortIcon('shopTotal')}
                            </TableHead>
                            <TableHead className="pr-6 pl-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-primary text-right" onClick={() => handleSort('shopDivide')}>
                                ເງິນປັນຜົນ {getSortIcon('shopDivide')}
                            </TableHead>
                            <TableHead className="px-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 text-center w-[140px]">
                                ຈັດການ
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentReportData.map((item) => {
                            const isExpanded = expandedShopIds.has(item.shop.id);

                            return (
                                <React.Fragment key={`shop-${item.shop.id}`}>
                                    {/* Main Shop Row */}
                                    <TableRow className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${isExpanded ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-dark-3/50'}`}>
                                        <TableCell className="pl-6 pr-4 py-4">
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">{item.shop.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">#{item.shop.id}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            <div className="font-medium">{item.shop.user.firstname} {item.shop.user.lastname}</div>
                                            <div className="text-xs text-gray-500">{item.shop.user.code}</div>
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{item.shop.tel}</TableCell>
                                        <TableCell className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white text-center">
                                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                {item.products.length}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm font-bold text-blue-600 dark:text-blue-400 text-right">{formatCurrency(item.shopTotal)} ກີບ</TableCell>
                                        <TableCell className="px-4 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400 text-right">{formatCurrency(item.shopDivide)} ກີບ</TableCell>

                                        {/* [NEW] Action Buttons Column */}
                                        <TableCell className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handlePrintPDF(item.shop.id)}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                                    title="ພິມ PDF"
                                                >
                                                    <HiOutlinePrinter className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => toggleShopDetail(item.shop.id)}
                                                    className={`flex items-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 ${isExpanded
                                                        }`}
                                                >
                                                    {/* {isExpanded ? 'ປິດ' : 'ລາຍລະອຽດ'} */}
                                                    {isExpanded ? <HiChevronUp className="w-5 h-5" /> : <TbListDetails className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* Expanded Product Details (Nested Table) */}
                                    {isExpanded && item.products.length > 0 && (
                                        <TableRow className="bg-gray-50/50 dark:bg-dark-3/30 border-b border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <TableCell colSpan={7} className="p-4 pl-8 md:pl-12">
                                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-2 overflow-hidden shadow-sm">
                                                    <Table>
                                                        <TableHeader className="bg-gray-100 dark:bg-dark-3/80">
                                                            <TableRow>
                                                                <TableHead className="w-[60px] py-3 text-xs uppercase tracking-wider text-gray-500">ຮູບ</TableHead>
                                                                <TableHead className="py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ຊື່ສິນຄ້າ</TableHead>
                                                                <TableHead className="text-right py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ລາຄາ</TableHead>
                                                                <TableHead className="text-right py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ສ່ວນແບ່ງ</TableHead>
                                                                <TableHead className="text-right py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ຈຳນວນ</TableHead>
                                                                <TableHead className="text-right py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ລວມ</TableHead>
                                                                <TableHead className="text-right py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider pr-6">ເງິນປັນຜົນ</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {item.products.map((product) => (
                                                                <TableRow
                                                                    key={`product-${item.shop.id}-${product.productId}`}
                                                                    className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-dark-3/50"
                                                                >
                                                                    <TableCell className="py-3 pl-4">
                                                                        <Image
                                                                            src={`${process.env.NEXT_PUBLIC_API_URL}/upload/product/${product.pimg}`}
                                                                            alt={product.title}
                                                                            width={36}
                                                                            height={36}
                                                                            className="w-9 h-9 object-cover rounded-md bg-gray-200 dark:bg-gray-700 border border-gray-100 dark:border-gray-600"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="py-3 font-medium text-sm text-gray-700 dark:text-gray-200">
                                                                        {product.title}
                                                                    </TableCell>
                                                                    <TableCell className="py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                                                                        {formatCurrency(product.price)}
                                                                    </TableCell>
                                                                    <TableCell className="py-3 text-right text-sm">
                                                                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                                                            {product.percent}%
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell className="py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                                                                        {product.quantity}
                                                                    </TableCell>
                                                                    <TableCell className="py-3 text-right text-sm text-blue-600 dark:text-blue-400 font-medium">
                                                                        {formatCurrency(product.totalprice)}
                                                                    </TableCell>
                                                                    <TableCell className="py-3 pr-6 text-right text-sm text-emerald-600 dark:text-emerald-400 font-bold">
                                                                        {formatCurrency(product.divide)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                </Table>

                {filteredAndSortedData.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <HiOutlineFilter className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <div className="text-xl font-semibold text-gray-500 dark:text-gray-400">ບໍ່ພົບຂໍ້ມູນ</div>
                        <p className="text-gray-400 dark:text-gray-500">ບໍ່ພົບລາຍງານທີ່ກົງກັບເງື່ອນໄຂການກັ່ນຕອງ</p>
                    </div>
                )}
            </div>

            {/* Modern Pagination */}
            {filteredAndSortedData.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            ສະແດງ:
                        </label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-dark-3 dark:text-gray-300"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            ຈາກທັງໝົດ <span className="font-semibold text-gray-900 dark:text-white">{filteredAndSortedData.length}</span> ລາຍການ
                        </span>
                    </div>

                    {/* Page navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:border-gray-700 dark:bg-dark-3 dark:text-gray-300 dark:hover:bg-dark-2"
                            title="ໜ້າກ່ອນໜ້າ"
                        >
                            <HiChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:flex items-center gap-1">
                            {getPageNumbers().map((page, index) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500 dark:text-gray-400">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page as number)}
                                        className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all ${currentPage === page
                                            ? 'bg-primary text-white shadow-md shadow-primary/30'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-dark-3 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-dark-2'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}
                        </div>

                        <div className="sm:hidden px-4 py-2 bg-gray-100 dark:bg-dark-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {currentPage} / {totalPages}
                            </span>
                        </div>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:border-gray-700 dark:bg-dark-3 dark:text-gray-300 dark:hover:bg-dark-2"
                            title="ໜ້າຕໍ່ໄປ"
                        >
                            <HiChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        ສະແດງ <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}</span> - <span className="font-semibold text-gray-900 dark:text-white">{Math.min(endIndex, filteredAndSortedData.length)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
