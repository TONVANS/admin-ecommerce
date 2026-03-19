
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import ProductUnitManagement from '@/components/Tables/productunit-management'
import React from 'react'

export default function Page() {
    return (
        <>
            <Breadcrumb pageName="ຫົວໜ່ວຍສຶນຄ້າ" />
            <div className='space-y-10'>
                <ProductUnitManagement />
            </div>
        </>
    )
}
