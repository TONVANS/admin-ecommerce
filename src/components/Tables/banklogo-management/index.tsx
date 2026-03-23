"use client";

// === Imports ===
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { UploadIcon, PencilSquareIcon, TrashIcon } from '@/assets/icons'; // ລົບ CheckIcon ອອກ
import { HiOutlineSearch } from 'react-icons/hi';
import { FaXmark } from 'react-icons/fa6';
import { useBankLogoStore } from '@/store/bank/banklogoStore';
import { toast } from 'sonner'; // Import Sonner
import Image from 'next/image';

// const Image = ({ src, alt, width, height, className, onError }: { src: string, alt: string, width: number, height: number, className: string, onError: (e: any) => void }) => (
//     <img
//         src={src}
//         alt={alt}
//         width={width}
//         height={height}
//         className={className}
//         onError={onError}
//         style={{ width: `${width}px`, height: `${height}px`, objectFit: 'cover' }}
//     />
// );

// === Custom Input Component ===
const CustomInput = ({ label, id, ...props }: { label: string, id: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
        </label>
        <input
            id={id}
            {...props}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 dark:bg-dark-2 dark:border-gray-700 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition duration-200"
        />
    </div>
);

// === Helper Function for Image URL ===
const getBankLogoImageUrl = (bankimg: string | File | null | undefined): string => {
    if (!bankimg || bankimg === null) {
        return "https://placehold.co/400x400/e0e0e0/909090?text=No+Image";
    }
    // ຖ້າເປັນ File (ຮູບທີ່ກຳລັງອັບໂຫລດ)
    if (bankimg instanceof File) {
        return URL.createObjectURL(bankimg);
    }

    // ຖ້າເປັນ string ທີ່ເປັນ URL ເຕັມ (ຈາກ mock data ຫຼື blob)
    if (typeof bankimg === "string" && (bankimg.startsWith("http") || bankimg.startsWith("blob:"))) {
        return bankimg;
    }

    // ຖ້າເປັນ string ທີ່ເປັນຊື່ໄຟລ໌ (ຈາກ API)
    if (typeof bankimg === "string") {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const cleanApiUrl = apiUrl.replace(/\/$/, "");
        return `${cleanApiUrl}/upload/bank/${bankimg}`;
    }

    return "https://placehold.co/400x400/e0e0e0/909090?text=Error";
};

// === Type Definition ===
type BankLogo = {
    id: number;
    name: string;
    bankimg: string | null;
};

export default function BankLogoManagement() {

    const {
        bankLogos,
        loading,
        error,
        getBankLogos,
        createBankLogo,
        updateBankLogo,
        deleteBankLogo,
        clearError
    } = useBankLogoStore();

    const [isOpen, setIsOpen] = React.useState(false);
    const [isEdit, setIsEdit] = React.useState(false);
    const [editingBankLogo, setEditingBankLogo] = useState<BankLogo | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // ລົບ State successDialog ແລະ errorDialog ອອກ

    const [bankLogoImageFile, setBankLogoImageFile] = useState<File | null>(null);
    const [bankLogoImagePreview, setBankLogoImagePreview] = useState<string | null>(null);

    const [newBankLogo, setNewBankLogo] = useState<{ name: string }>({
        name: ''
    });

    useEffect(() => {
        getBankLogos();
    }, [getBankLogos]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewBankLogo((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            setBankLogoImageFile(file);
            setBankLogoImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setIsProcessing(true);
        try {
            if (isEdit && editingBankLogo) {
                await updateBankLogo(editingBankLogo.id, {
                    ...newBankLogo,
                    bankimg: bankLogoImageFile || undefined
                });
                toast.success('ອັບເດດໂລໂກ້ທະນາຄານສຳເລັດ'); // ໃຊ້ Toast
            } else {
                await createBankLogo({
                    ...newBankLogo,
                    bankimg: bankLogoImageFile || undefined
                });
                toast.success('ເພີ່ມໂລໂກ້ທະນາຄານໃໝ່ສຳເລັດ'); // ໃຊ້ Toast
            }
            await getBankLogos();

            setIsOpen(false);
            resetForm();
        } catch (err: any) {
            console.error('Failed to save bank logo', err);
            const errorMessage = (err.response?.data?.message || err.message || 'ການບັນທຶກລົ້ມເຫລວ') as string;
            toast.error(errorMessage); // ໃຊ້ Toast Error
        } finally {
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setNewBankLogo({ name: '' });
        setBankLogoImageFile(null);
        setBankLogoImagePreview(null);
        setIsEdit(false);
        setEditingBankLogo(null);
        clearError();
    };

    const handleEdit = (bankLogo: BankLogo) => {
        setIsEdit(true);
        setEditingBankLogo(bankLogo);
        setNewBankLogo({
            name: bankLogo.name
        });
        setBankLogoImagePreview(getBankLogoImageUrl(bankLogo.bankimg));
        setBankLogoImageFile(null);
        setIsOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບໂລໂກ້ທະນາຄານນີ້?')) {
            try {
                await deleteBankLogo(id);
                await getBankLogos();
                toast.success('ລົບໂລໂກ້ທະນາຄານສຳເລັດ'); // ໃຊ້ Toast
            } catch (err: any) {
                console.error('Failed to delete bank logo', err);
                const errorMessage = (err.response?.data?.message || err.message || 'ການລົບລົ້ມເຫລວ') as string;
                toast.error(errorMessage); // ໃຊ້ Toast Error
            }
        }
    };

    const handleDialogClose = () => {
        if (isProcessing) return;
        setIsOpen(false);
        setTimeout(() => resetForm(), 300);
    };

    const filteredBankLogos = bankLogos.filter((bank) =>
        (bank.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && bankLogos.length === 0) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[400px]">
                <div className="text-lg animate-pulse">ກຳລັງໂຫລດຂໍ້ມູນ...</div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-dark-2 sm:p-8">
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg flex justify-between items-center" role="alert">
                    <p className="text-red-700 font-medium">⚠️ ຂໍ້ຜິດພາດ: {error}</p>
                    <button onClick={clearError} className="text-sm text-red-500 hover:text-red-700 font-semibold">ປິດ</button>
                </div>
            )}

            {/* === Filter Bar === */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 sm:py-5">
                {/* Search */}
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ຄົ້ນຫາຕາມຊື່ທະນາຄານ..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-dark outline-none transition-shadow focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-dark-3 dark:text-white dark:focus:border-primary"
                    />
                    <HiOutlineSearch className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Add Button */}
                <button
                    onClick={() => {
                        setIsEdit(false);
                        setEditingBankLogo(null);
                        setNewBankLogo({ name: '' });
                        setBankLogoImagePreview(null);
                        setBankLogoImageFile(null);
                        setIsOpen(true);
                    }}
                    className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95"
                >
                    <UploadIcon className="w-5 h-5" />
                    <span>ເພີ່ມໂລໂກ້ທະນາຄານ</span>
                </button>
            </div>

            {/* === Table === */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <Table className="min-w-full">
                    <TableHeader className="bg-gray-50 dark:bg-dark-3">
                        <TableRow>
                            <TableHead className="pl-6 pr-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">ຊື່ທະນາຄານ</TableHead>
                            <TableHead className='pr-6 pl-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 text-right'>ຈັດການ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredBankLogos.map((bankLogo, index) => (
                            <TableRow
                                key={`${bankLogo.id}-${index}`}
                                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-3/50 transition-colors"
                            >
                                <TableCell className="pl-6 pr-4 py-4">
                                    <div className="flex items-center gap-4">
                                        <Image
                                            src={getBankLogoImageUrl(bankLogo.bankimg)}
                                            className="w-14 h-14 object-cover rounded-lg flex-shrink-0 bg-gray-200 dark:bg-gray-700"
                                            width={56}
                                            height={56}
                                            alt={`Logo for ${bankLogo.name}`}
                                            onError={(e) => {
                                                const target = e.currentTarget as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = 'https://placehold.co/60x60/e0e0e0/909090?text=Error';
                                            }}
                                        />
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{bankLogo.name}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="pr-6 pl-4 py-4">
                                    <div className='flex justify-end gap-3 items-center'>
                                        <button
                                            className="p-2 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 transition-colors"
                                            onClick={() => handleEdit(bankLogo)}
                                            title="ແກ້ໄຂ"
                                        >
                                            <span className="sr-only">Edit Bank Logo</span>
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            className="p-2 rounded-full text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors"
                                            onClick={() => handleDelete(bankLogo.id)}
                                            title="ລົບ"
                                        >
                                            <span className="sr-only">Delete Bank Logo</span>
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {filteredBankLogos.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <HiOutlineSearch className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <div className="text-xl font-semibold text-gray-500 dark:text-gray-400">ບໍ່ພົບຂໍ້ມູນ</div>
                        <p className="text-gray-400 dark:text-gray-500">ບໍ່ພົບຂໍ້ມູນໂລໂກ້ທະນາຄານທີ່ກົງກັບການຄົ້ນຫາ</p>
                    </div>
                )}
            </div>

            {/* === Dialog Form === */}
            <Transition appear show={isOpen} as={React.Fragment}>
                <Dialog
                    as="div"
                    className="relative z-50"
                    onClose={handleDialogClose}
                >
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80 backdrop-blur-sm" />
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
                                <DialogPanel className="mx-auto w-full max-w-lg rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-dark-2 dark:to-gray-900 p-8 shadow-2xl transform transition-all duration-300 border border-gray-200 dark:border-gray-700">

                                    {/* Header */}
                                    <div className="relative text-center mb-8">
                                        <button
                                            type="button"
                                            onClick={handleDialogClose}
                                            disabled={isProcessing}
                                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center group disabled:opacity-50"
                                        >
                                            <FaXmark className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                                        </button>

                                        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                                            {isEdit ? (
                                                <PencilSquareIcon className="h-8 w-8 text-white" />
                                            ) : (
                                                <UploadIcon className="h-8 w-8 text-white" />
                                            )}
                                        </div>

                                        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            {isEdit ? 'ແກ້ໄຂໂລໂກ້ທະນາຄານ' : 'ເພີ່ມໂລໂກ້ທະນາຄານໃໝ່'}
                                        </DialogTitle>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium px-4">
                                            {isEdit ? 'ແກ້ໄຂຂໍ້ມູນໂລໂກ້ທະນາຄານ' : 'ກະລຸນາປ້ອນຂໍ້ມູນໂລໂກ້ທະນາຄານໃໝ່'}
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-6 text-left"
                                    >
                                        <CustomInput
                                            label="ຊື່ທະນາຄານ"
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={newBankLogo.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="ເຊັ່ນ: ທະນາຄານພັດທະນາລາວ"
                                        />

                                        <div className='relative block w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-dark-2 hover:border-primary transition-colors'>
                                            <input
                                                type="file"
                                                name="bankimg"
                                                id="bankimg"
                                                onChange={handleImageChange}
                                                accept="image/png, image/jpg, image/jpeg"
                                                hidden
                                            />
                                            <label
                                                htmlFor="bankimg"
                                                className="flex cursor-pointer flex-col items-center justify-center p-4 sm:py-7.5"
                                            >
                                                <div className="flex size-14 items-center justify-center rounded-full border border-stroke dark:border-gray-600 bg-white dark:bg-dark-3">
                                                    <UploadIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                                </div>
                                                <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    <span className="text-primary">ຄລິກເພື່ອອັບໂຫລດ</span> ຫຼື ລາກວາງ
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    PNG, JPG (ສູງສຸດ 800x800px)
                                                </p>
                                            </label>
                                        </div>

                                        {bankLogoImagePreview && (
                                            <div className="mt-2">
                                                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ຮູບຕົວຢ່າງ:</p>
                                                <Image
                                                    src={bankLogoImagePreview}
                                                    alt="Bank Logo Preview"
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
                                                className="px-6 py-2.5 text-sm font-medium rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                </DialogPanel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}