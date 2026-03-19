import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import StoreManagement from '@/components/Tables/store-management'
import React from 'react'

export default function Page() {
    return (
        <>
            {/* <Breadcrumb pageName="Store Management" /> */}
            <div className='space-y-10'>
                <StoreManagement />
            </div>
        </>
    )
}
