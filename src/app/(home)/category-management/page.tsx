import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import CategoryManagement from '@/components/Tables/category-management'
import React from 'react'

export default function page() {
    return (
        <>
            <Breadcrumb pageName="ໝວດໝູ່ສິນຄ້າ" />
            <div className='space-y-10'>
                <CategoryManagement />
            </div>
        </>
    )
}
