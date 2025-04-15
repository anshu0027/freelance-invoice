"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { servicesData } from "@/data/services"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

import type { InvoicePreviewProps } from "@/store/invoice-store"; // Assuming invoice-store.ts is in src/store

export function InvoicePreview({ onBack, invoiceData }: InvoicePreviewProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)

  const {
    freelancerDetails,
    clientDetails,
    invoiceDetails,
    serviceSelection,
    additionalInfo
  } = invoiceData;

  const selectedCategory = servicesData[serviceSelection.category]
  const selectedPackage = selectedCategory?.find((pkg) => pkg.name === serviceSelection.packageTier)

  const basePrice = selectedPackage?.monthlyPrice || 0
  const discountAmount = basePrice * (serviceSelection.discountPercentage / 100)
  const finalPrice = basePrice - discountAmount

  const getPaymentTermsText = () => {
    switch (additionalInfo.paymentTerms) {
      case "30":
        return "Net 30 - Payment due within 30 days"
      case "365":
        return "Net 365 - Payment due within 365 days"
      case "immediate":
        return "Due on Receipt"
      default:
        return ""
    }
  }

  const generatePDF = async () => {
    if (!invoiceRef.current) return

    try {
      const element = invoiceRef.current

      // Create a simplified version of the invoice
      const simplifiedInvoice = document.createElement('div')
      simplifiedInvoice.style.width = element.offsetWidth + 'px'
      simplifiedInvoice.style.height = element.offsetHeight + 'px'
      simplifiedInvoice.style.position = 'absolute'
      simplifiedInvoice.style.top = '0'
      simplifiedInvoice.style.left = '0'
      simplifiedInvoice.style.backgroundColor = '#FFFFFF'
      simplifiedInvoice.style.padding = '32px'
      simplifiedInvoice.style.fontFamily = 'Arial, sans-serif'

      // Copy the content but with simplified styling
      const content = element.innerHTML
        .replace(/text-\[#[0-9A-Fa-f]{6}\]/g, '') // Remove hex color classes
        .replace(/text-[a-z]+-[0-9]+/g, '') // Remove Tailwind color classes
        .replace(/bg-\[#[0-9A-Fa-f]{6}\]/g, '') // Remove background hex colors
        .replace(/bg-[a-z]+-[0-9]+/g, '') // Remove Tailwind background colors
        .replace(/border-\[#[0-9A-Fa-f]{6}\]/g, '') // Remove border hex colors
        .replace(/border-[a-z]+-[0-9]+/g, '') // Remove Tailwind border colors

      simplifiedInvoice.innerHTML = content

      // Apply basic styling to all elements
      const styleElement = document.createElement('style')
      styleElement.textContent = `
        * {
          color: #000000 !important;
          background-color: #FFFFFF !important;
          border-color: #E5E7EB !important;
        }
        .text-indigo-700, .text-[#4F46E5] {
          color: #4F46E5 !important;
        }
        .bg-gray-100, .bg-[#F3F4F6] {
          background-color: #F3F4F6 !important;
        }
        .border-gray-200, .border-[#E5E7EB] {
          border-color: #E5E7EB !important;
        }
        .border-gray-300, .border-[#D1D5DB] {
          border-color: #D1D5DB !important;
        }
      `
      simplifiedInvoice.appendChild(styleElement)

      // Add to document temporarily
      document.body.appendChild(simplifiedInvoice)

      const canvas = await html2canvas(simplifiedInvoice, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 15000,
        width: element.offsetWidth,
        height: element.offsetHeight,
        windowWidth: element.offsetWidth,
        windowHeight: element.offsetHeight,
      })

      // Remove temporary element
      document.body.removeChild(simplifiedInvoice)

      const pdf = new jsPDF("p", "pt", "a4")

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const marginX = 30
      const marginY = 30
      const availableWidth = pdfWidth - marginX * 2
      const availableHeight = pdfHeight - marginY * 2

      const contentRatio = canvas.width / canvas.height

      let imgWidth = availableWidth
      let imgHeight = imgWidth / contentRatio

      if (imgHeight > availableHeight) {
        imgHeight = availableHeight
        imgWidth = imgHeight * contentRatio
      }

      const imageData = canvas.toDataURL("image/png")
      pdf.addImage(imageData, "PNG", marginX, marginY, imgWidth, imgHeight)

      const blob = pdf.output("blob")
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      const filename = `Invoice_${invoiceDetails.invoiceNumber}_${clientDetails.name.replace(/\s+/g, "_")}.pdf`
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('There was an error generating the PDF. Please try again.')
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back to Edit
        </Button>
        <Button onClick={generatePDF}>Download PDF</Button>
      </div>

      <Card className="bg-[#FFFFFF] p-8 max-w-4xl mx-auto">
        <div ref={invoiceRef} className="p-8">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-2xl font-bold">{freelancerDetails.name}</h1>
              <p className="text-[#4B5563]">{freelancerDetails.email}</p>
              <p className="text-[#4B5563]">{freelancerDetails.phone}</p>
              <p className="text-[#4B5563] whitespace-pre-line">{freelancerDetails.address}</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-[#4F46E5] mb-2">INVOICE</h1>
              <p className="text-[#4B5563]">
                <span className="font-medium">Invoice #:</span> {invoiceDetails.invoiceNumber}
              </p>
              <p className="text-[#4B5563]">
                <span className="font-medium">Date:</span> {formatDate(invoiceDetails.invoiceDate)}
              </p>
              <p className="text-[#4B5563]">
                <span className="font-medium">Due Date:</span> {formatDate(invoiceDetails.dueDate)}
              </p>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-[#4B5563] font-medium mb-2">Billed To:</h2>
            <h3 className="text-lg font-bold">{clientDetails.name}</h3>
            <p className="text-[#4B5563]">{clientDetails.email}</p>
            <p className="text-[#4B5563]">{clientDetails.phone}</p>
            <p className="text-[#4B5563] whitespace-pre-line">{clientDetails.address}</p>
          </div>

          <table className="min-w-full bg-[#FFFFFF] border-collapse mb-10">
            <thead>
              <tr className="bg-[#F3F4F6]">
                <th className="py-3 px-4 text-left border-b-2 border-[#D1D5DB] font-semibold">Service</th>
                <th className="py-3 px-4 text-left border-b-2 border-[#D1D5DB] font-semibold">Description</th>
                <th className="py-3 px-4 text-right border-b-2 border-[#D1D5DB] font-semibold">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {selectedPackage?.services.map((service, index) => (
                <tr key={index}>
                  <td className="py-3 px-4 border-b border-[#E5E7EB]">{service.name}</td>
                  <td className="py-3 px-4 border-b border-[#E5E7EB]">{service.description}</td>
                  <td className="py-3 px-4 text-right border-b border-[#E5E7EB]">{service.quantity}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="border-t pt-4 text-right font-medium">
                  Subtotal:
                </td>
                <td className="border-t pt-4 text-right">{formatCurrency(basePrice)}</td>
              </tr>
              {discountAmount > 0 && (
                <tr>
                  <td colSpan={2} className="text-right font-medium">
                    Discount ({serviceSelection.discountPercentage}%):
                  </td>
                  <td className="text-right">-{formatCurrency(discountAmount)}</td>
                </tr>
              )}
              <tr>
                <td colSpan={2} className="text-right font-bold">
                  Total:
                </td>
                <td className="text-right font-bold text-[#4F46E5]">{formatCurrency(finalPrice)}</td>
              </tr>
            </tfoot>
          </table>

          {additionalInfo.notes && (
            <div className="mb-8">
              <h3 className="font-medium mb-2">Notes:</h3>
              <p className="text-[#4B5563] whitespace-pre-line border-l-4 border-[#E5E7EB] pl-4">{additionalInfo.notes}</p>
            </div>
          )}

          <div className="mb-8">
            <h3 className="font-medium mb-2">Payment Terms:</h3>
            <p className="text-[#4B5563]">{getPaymentTermsText()}</p>
          </div>

          <div className="mb-8">
            <h3 className="font-medium mb-2">Payment Method:</h3>
            <p className="text-[#4B5563] uppercase">{additionalInfo.paymentMethod}</p>
          </div>

          <div className="mt-12 pt-8 border-t-2 border-[#E5E7EB] text-center text-[#4B5563] text-sm">
            <p>Thank you for believing us!</p>
            <p className="mt-1">{freelancerDetails.name} | {freelancerDetails.email}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
