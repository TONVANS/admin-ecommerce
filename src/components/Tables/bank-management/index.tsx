"use client";
import { PencilSquareIcon, TrashIcon, UploadIcon } from "@/assets/icons";
import { useBankStore } from "@/store/bank/bankStore";
import { Button } from "@/components/ui-elements/button";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Bank } from "@/types/bank";

const getBankImageUrl = (file: string | File | null | undefined, type: "logo" | "qr"): string => {
    if (!file) return "/images/brand/brand-01.svg";

    if (file instanceof File) {
        return URL.createObjectURL(file);
    }

    if (typeof file === "string" && file.startsWith("http")) {
        return file;
    }

    if (typeof file === "string") {
        return `${process.env.NEXT_PUBLIC_API_URL}/upload/bank/${file}`;
    }

    return "/images/brand/brand-01.svg";
};

export default function BankManagement() {
    const {
        banks,
        loading,
        error,
        getBanks,
        createBank,
        updateBank,
        deleteBank,
        clearError,
    } = useBankStore();

    const [isOpen, setIsOpen] = React.useState(false);
    const [isEdit, setIsEdit] = React.useState(false);
    const [editingBank, setEditingBank] = useState<Bank | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [bankLogoFile, setBankLogoFile] = useState<File | null>(null);
    const [bankLogoPreview, setBankLogoPreview] = useState<string | null>(null);

    const [bankQrFile, setBankQrFile] = useState<File | null>(null);
    const [bankQrPreview, setBankQrPreview] = useState<string | null>(null);

    const [newBank, setNewBank] = useState<{ name: string; accountNo: string; accountName: string }>({
        name: "",
        accountNo: "",
        accountName: "",
    });

    useEffect(() => {
        getBanks();
    }, [getBanks]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewBank((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            setBankLogoFile(file);
            setBankLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            setBankQrFile(file);
            setBankQrPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        try {
            if (isEdit && editingBank) {
                await updateBank(editingBank.id, {
                    ...newBank,
                    banklogo: bankLogoFile || undefined,
                    bankqr: bankQrFile || undefined,
                });
            } else {
                await createBank({
                    ...newBank,
                    banklogo: bankLogoFile || undefined,
                    bankqr: bankQrFile || undefined,
                });
            }

            await getBanks();
            setIsOpen(false);
            resetForm();
        } catch (err) {
            console.error("Failed to save bank", err);
        }
    };

    const resetForm = () => {
        setNewBank({ name: "", accountNo: "", accountName: "" });
        setBankLogoFile(null);
        setBankLogoPreview(null);
        setBankQrFile(null);
        setBankQrPreview(null);
        setIsEdit(false);
        setEditingBank(null);
        clearError();
    };

    const handleEdit = (bank: Bank) => {
        setIsEdit(true);
        setEditingBank(bank);
        setNewBank({
            name: bank.name,
            accountNo: bank.accountNo,
            accountName: bank.accountName,
        });
        setBankLogoPreview(getBankImageUrl(bank.banklogo, "logo"));
        setBankQrPreview(getBankImageUrl(bank.bankqr, "qr"));
        setIsOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this bank?")) {
            await deleteBank(id);
        }
    };

    const handleDialogClose = () => {
        setIsOpen(false);
        resetForm();
    };

    const filteredBanks = banks.filter(
        (bank) =>
            (bank.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (bank.accountNo ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (bank.accountName ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && banks.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-lg">Loading banks...</div>
            </div>
        );
    }

    return (
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={clearError}
                        className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
                    >
                        Close notification
                    </button>
                </div>
            )}

            {/* Search + Add button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4 sm:py-5">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or account"
                        className="w-full sm:w-64 px-4 py-2 rounded-lg border border-stroke bg-white text-dark outline-none transition-all focus:border-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:focus:border-primary"
                    />
                    <Button
                        label="Add Bank"
                        icon={<UploadIcon />}
                        variant="primary"
                        shape="rounded"
                        size="small"
                        onClick={() => {
                            resetForm();
                            setIsOpen(true);
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <Table>
                <TableHeader>
                    <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
                        <TableHead className="min-w-[120px] pl-5">Logo</TableHead>
                        <TableHead>Bank Name</TableHead>
                        <TableHead>Account No</TableHead>
                        <TableHead>Account Name</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredBanks.map((bank, index) => (
                        <TableRow
                            key={`${bank.id}-${index}`}
                            className="text-base font-medium text-dark dark:text-white"
                        >
                            <TableCell className="pl-5">
                                <div className="flex items-center justify-center w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-stroke">
                                    <Image
                                        src={getBankImageUrl(bank.banklogo, "logo")}
                                        className="object-contain"
                                        width={40}
                                        height={40}
                                        alt={`Logo of ${bank.name}`}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = "/images/brand/brand-01.svg";
                                        }}
                                    />
                                </div>
                            </TableCell>
                            <TableCell>{bank.name}</TableCell>
                            <TableCell>{bank.accountNo}</TableCell>
                            <TableCell>{bank.accountName}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2 items-center">
                                    <button className="hover:text-primary" onClick={() => handleEdit(bank)}>
                                        <PencilSquareIcon />
                                    </button>
                                    <button className="hover:text-red-500" onClick={() => handleDelete(bank.id)}>
                                        <TrashIcon />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {filteredBanks.length === 0 && (
                <div className="flex items-center justify-center p-8">
                    <div className="text-lg">No banks found.</div>
                </div>
            )}

            {/* Dialog Form */}
            <Dialog open={isOpen} onClose={handleDialogClose} className="fixed z-50 inset-0 overflow-y-auto">
                <div className="fixed inset-0 bg-black/30 flex w-screen items-center justify-center p-4" aria-hidden="true">
                    <DialogPanel className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg dark:bg-gray-dark">
                        <DialogTitle className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
                            {isEdit ? "Edit Bank" : "Add Bank"}
                        </DialogTitle>
                        <Description className="text-gray-600 mb-6 dark:text-gray-300">
                            {isEdit ? "Edit bank information" : "Please enter bank details"}
                        </Description>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Bank Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newBank.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full rounded-lg border border-stroke px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white"
                                        placeholder="Enter bank name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Account No</label>
                                    <input
                                        type="text"
                                        name="accountNo"
                                        value={newBank.accountNo}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full rounded-lg border border-stroke px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white"
                                        placeholder="Enter account number"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Account Name</label>
                                    <input
                                        type="text"
                                        name="accountName"
                                        value={newBank.accountName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full rounded-lg border border-stroke px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white"
                                        placeholder="Enter account name"
                                    />
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Upload Logo */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank Logo</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="banklogo"
                                            onChange={handleLogoChange}
                                            accept="image/*"
                                            hidden
                                        />
                                        <label 
                                            htmlFor="banklogo" 
                                            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:border-primary hover:bg-primary/5 dark:border-dark-3 dark:bg-gray-dark"
                                        >
                                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <UploadIcon />
                                            </div>
                                            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                <span className="text-primary">Upload Logo</span> or drag and drop
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                PNG, JPG up to 2MB
                                            </p>
                                        </label>
                                    </div>
                                    
                                    {/* Logo Preview with Zoom */}
                                    {bankLogoPreview && (
                                        <div className="flex flex-col items-center">
                                            <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Logo Preview</p>
                                            <div className="group relative flex items-center justify-center w-32 h-32 rounded-lg overflow-hidden border border-stroke bg-gray-50 dark:border-dark-3 cursor-zoom-in">
                                                <Image 
                                                    src={bankLogoPreview} 
                                                    alt="Bank Logo Preview" 
                                                    width={100} 
                                                    height={100} 
                                                    className="object-contain transition-transform duration-300 group-hover:scale-150"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <span className="text-white font-medium text-sm">Click to zoom</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => window.open(bankLogoPreview, '_blank')}
                                                className="mt-2 text-xs text-primary hover:underline"
                                            >
                                                View full size
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Upload QR */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">QR Code</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="bankqr"
                                            onChange={handleQrChange}
                                            accept="image/*"
                                            hidden
                                        />
                                        <label 
                                            htmlFor="bankqr" 
                                            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:border-primary hover:bg-primary/5 dark:border-dark-3 dark:bg-gray-dark"
                                        >
                                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <UploadIcon />
                                            </div>
                                            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                <span className="text-primary">Upload QR Code</span> or drag and drop
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                PNG, JPG up to 2MB
                                            </p>
                                        </label>
                                    </div>
                                    
                                    {/* QR Preview with Zoom */}
                                    {bankQrPreview && (
                                        <div className="flex flex-col items-center">
                                            <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">QR Preview</p>
                                            <div className="group relative flex items-center justify-center w-32 h-32 rounded-lg overflow-hidden border border-stroke bg-gray-50 dark:border-dark-3 cursor-zoom-in">
                                                <Image 
                                                    src={bankQrPreview} 
                                                    alt="Bank QR Preview" 
                                                    width={100} 
                                                    height={100} 
                                                    className="object-contain transition-transform duration-300 group-hover:scale-150"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <span className="text-white font-medium text-sm">Click to zoom</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => window.open(bankQrPreview, '_blank')}
                                                className="mt-2 text-xs text-primary hover:underline"
                                            >
                                                View full size
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button 
                                    label="Cancel" 
                                    variant="outlinePrimary" 
                                    shape="rounded" 
                                    size="small" 
                                    onClick={handleDialogClose}
                                    type="button"
                                />
                                <Button 
                                    label={isEdit ? "Update Bank" : "Add Bank"} 
                                    variant="primary" 
                                    shape="rounded" 
                                    size="small" 
                                    type="submit"
                                />
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>
        </div>
    );
}
