"use client"

import { useState } from "react"
import { InvoiceForm } from "@/components/invoice-form"
import { InvoicePreview } from "@/components/invoice-preview"

interface FreelancerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface ClientDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
}

interface ServiceSelection {
  category: string;
  packageTier: string;
  discountPercentage: number;
}

interface AdditionalInfo {
  notes: string;
  paymentTerms: string;
  paymentMethod: string;
}

interface InvoiceData {
  freelancerDetails: FreelancerDetails;
  clientDetails: ClientDetails;
  invoiceDetails: InvoiceDetails;
  serviceSelection: ServiceSelection;
  additionalInfo: AdditionalInfo;
}

export default function Home() {
  const [showPreview, setShowPreview] = useState(false)
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    freelancerDetails: {
      name: "Anshu Patel",
      email: "anshupatel.work@gmail.com",
      phone: "+91 704 638 2744",
      address: "Ahmedabad, Gujarat"
    },
    clientDetails: {
      name: "",
      email: "",
      phone: "",
      address: ""
    },
    invoiceDetails: {
      invoiceNumber: "INV-2025-001",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    },
    serviceSelection: {
      category: "",
      packageTier: "",
      discountPercentage: 0
    },
    additionalInfo: {
      notes: "",
      paymentTerms: "Net 30",
      paymentMethod: "UPI"
    }
  })

  const handleUpdateFreelancerDetails = (details: FreelancerDetails) => {
    setInvoiceData(prev => ({ ...prev, freelancerDetails: details }))
  }

  const handleUpdateClientDetails = (details: ClientDetails) => {
    setInvoiceData(prev => ({ ...prev, clientDetails: details }))
  }

  const handleUpdateInvoiceDetails = (details: InvoiceDetails) => {
    setInvoiceData(prev => ({ ...prev, invoiceDetails: details }))
  }

  const handleUpdateServiceSelection = (selection: ServiceSelection) => {
    setInvoiceData(prev => ({ ...prev, serviceSelection: selection }))
  }

  const handleUpdateAdditionalInfo = (info: AdditionalInfo) => {
    setInvoiceData(prev => ({ ...prev, additionalInfo: info }))
  }

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <div className="max-w-5xl mx-auto p-6">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-700">Invoice Generator</h1>
        </header>

        {showPreview ? (
          <InvoicePreview
            onBack={() => setShowPreview(false)}
            invoiceData={invoiceData}
          />
        ) : (
          <InvoiceForm
            onPreview={() => setShowPreview(true)}
            invoiceData={invoiceData}
            onUpdateFreelancerDetails={handleUpdateFreelancerDetails}
            onUpdateClientDetails={handleUpdateClientDetails}
            onUpdateInvoiceDetails={handleUpdateInvoiceDetails}
            onUpdateServiceSelection={handleUpdateServiceSelection}
            onUpdateAdditionalInfo={handleUpdateAdditionalInfo}
          />
        )}
      </div>
    </div>
  )
}
