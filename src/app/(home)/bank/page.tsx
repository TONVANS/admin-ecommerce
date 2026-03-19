import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import BankLogoManagement from '@/components/Tables/banklogo-management'
import React from 'react'

export default function page() {
  return (
    <>
      <Breadcrumb pageName="ຈັດການໂລໂກທະນາຄານ" />
      <div className='space-y-10'>
        <BankLogoManagement />
      </div>
    </>
  )
}
