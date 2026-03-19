"use client"

import dynamic from 'next/dynamic'
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import React from 'react'

const ReportOrder = dynamic(
  () => import('@/components/Tables/report_all_order'),
  { ssr: false } // ✅ ไม่ render บน server
)

export default function Page() {
    return (
        <>
            {/* <Breadcrumb pageName="Store Management" /> */}
            <div className='space-y-10'>
                <ReportOrder />
            </div>
        </>
    )
}