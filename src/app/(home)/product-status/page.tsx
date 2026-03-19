import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import ProductStatusManagement from '@/components/Tables/productStatus-management'
import React from 'react'

export default function page() {
    return (
        <>
            <Breadcrumb pageName="ຈັດການສິນຄ້າ" />
            <div className='space-y-10'>
                <ProductStatusManagement />
            </div>
        </>
    )
}
