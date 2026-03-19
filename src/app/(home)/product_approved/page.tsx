"use client";

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import ApproveProduct from '@/components/Tables/product_approved'
import React from 'react'

export default function Page() {
    return (
        <>
            {/* <Breadcrumb pageName="ຈັດການສິນຄ້າ" /> */}
            <div className='space-y-10'>
                <ApproveProduct />
            </div>
        </>
    )
}