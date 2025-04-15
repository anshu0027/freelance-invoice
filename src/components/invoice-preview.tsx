"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
// NO Zustand import here - CORRECT
import { formatCurrency, formatDate } from "@/lib/utils"
import { servicesData } from "@/data/services"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import Image from "next/image"

// Import or define the necessary types
// --- CHANGE THIS LINE ---
// FROM: import type { InvoicePreviewProps, InvoiceData } from "./types";
// TO:
import type { InvoicePreviewProps } from "@/store/invoice-store"; // Assuming invoice-store.ts is in src/store

// Use the defined props interface
export function InvoicePreview({ onBack, invoiceData }: InvoicePreviewProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)

  // Destructure data from the invoiceData prop - CORRECT
  const {
    freelancerDetails,
    clientDetails,
    invoiceDetails,
    serviceSelection,
    additionalInfo
  } = invoiceData;

  // --- The rest of the component remains the same ---
  // --- It correctly uses the destructured variables from props ---

  // Get selected service package
  const selectedCategory = servicesData[serviceSelection.category]
  const selectedPackage = selectedCategory?.find((pkg) => pkg.name === serviceSelection.packageTier)

  const basePrice = selectedPackage?.monthlyPrice || 0
  const discountAmount = basePrice * (serviceSelection.discountPercentage / 100)
  const finalPrice = basePrice - discountAmount

  // Get payment terms text
  const getPaymentTermsText = () => {
    switch (additionalInfo.paymentTerms) {
      case "15":
        return "Net 15 - Payment due within 15 days"
      case "30":
        return "Net 30 - Payment due within 30 days"
      case "60":
        return "Net 60 - Payment due within 60 days"
      case "immediate":
        return "Due on Receipt"
      default:
        return ""
    }
  }

  const generatePDF = async () => {
    if (!invoiceRef.current) return

    const element = invoiceRef.current

    // First, get the natural dimensions of the content
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    // Create a new PDF with A4 dimensions
    const pdf = new jsPDF("p", "pt", "a4")

    // A4 dimensions in points
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Calculate the scaling factor to fit content on one page
    // Leave some margin (60pt total) for safety
    const marginX = 30
    const marginY = 30
    const availableWidth = pdfWidth - marginX * 2
    const availableHeight = pdfHeight - marginY * 2

    // Calculate the content aspect ratio
    const contentRatio = canvas.width / canvas.height

    // Calculate dimensions that maintain aspect ratio and fit within available space
    let imgWidth = availableWidth
    let imgHeight = imgWidth / contentRatio

    // If height exceeds available height, scale down based on height
    if (imgHeight > availableHeight) {
      imgHeight = availableHeight
      imgWidth = imgHeight * contentRatio
    }

    // Add image to PDF with calculated dimensions
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", marginX, marginY, imgWidth, imgHeight)

    // Generate filename
    const filename = `Invoice_${invoiceDetails.invoiceNumber}_${clientDetails.name.replace(/\s+/g, "_")}.pdf`

    // Save the PDF
    pdf.save(filename)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back to Edit
        </Button>
        <Button onClick={generatePDF}>Download PDF</Button>
      </div>

      <Card className="bg-white p-8 max-w-4xl mx-auto">
        {/* Ensure the ref is attached */}
        <div ref={invoiceRef} className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-2xl font-bold">{freelancerDetails.name}</h1>
              <p className="text-gray-600">{freelancerDetails.email}</p>
              <p className="text-gray-600">{freelancerDetails.phone}</p>
              <p className="text-gray-600 whitespace-pre-line">{freelancerDetails.address}</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-indigo-700 mb-2">INVOICE</h1>
              <p className="text-gray-600">
                <span className="font-medium">Invoice #:</span> {invoiceDetails.invoiceNumber}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Date:</span> {formatDate(invoiceDetails.invoiceDate)}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Due Date:</span> {formatDate(invoiceDetails.dueDate)}
              </p>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-10">
            <h2 className="text-gray-600 font-medium mb-2">Billed To:</h2>
            <h3 className="text-lg font-bold">{clientDetails.name}</h3>
            <p className="text-gray-600">{clientDetails.email}</p>
            <p className="text-gray-600">{clientDetails.phone}</p>
            <p className="text-gray-600 whitespace-pre-line">{clientDetails.address}</p>
          </div>

          {/* Services Table */}
          <table className="min-w-full bg-white border-collapse mb-10">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left border-b-2 border-gray-300 font-semibold">Service</th>
                <th className="py-3 px-4 text-left border-b-2 border-gray-300 font-semibold">Description</th>
                <th className="py-3 px-4 text-right border-b-2 border-gray-300 font-semibold">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {selectedPackage?.services.map((service, index) => (
                <tr key={index}>
                  <td className="py-3 px-4 border-b border-gray-200">{service.name}</td>
                  <td className="py-3 px-4 border-b border-gray-200">{service.description}</td>
                  <td className="py-3 px-4 text-right border-b border-gray-200">{service.quantity}</td>
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
              {discountAmount > 0 && ( // Only show discount if applicable
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
                <td className="text-right font-bold text-indigo-700">{formatCurrency(finalPrice)}</td>
              </tr>
            </tfoot>
          </table>

          {/* Notes */}
          {additionalInfo.notes && ( // Only show notes if present
            <div className="mb-8">
              <h3 className="font-medium mb-2">Notes:</h3>
              <p className="text-gray-600 whitespace-pre-line border-l-4 border-gray-200 pl-4">{additionalInfo.notes}</p>
            </div>
          )}

          {/* Payment Terms */}
          <div className="mb-8">
            <h3 className="font-medium mb-2">Payment Terms:</h3>
            <p className="text-gray-600">{getPaymentTermsText()}</p>
          </div>

          {/* Payment Method */}
          <div className="mb-8">
            <h3 className="font-medium mb-2">Payment Method:</h3>
            {/* Simple display, could be enhanced */}
            <p className="text-gray-600 uppercase">{additionalInfo.paymentMethod}</p>
          </div>

          {/* Signature - Make sure the image exists in public folder */}
          <div className="mt-8 mb-4 flex justify-end">
            {/* Consider adding width/height for better layout control */}
            <Image src="/sign.png" alt="Signature" width={150} height={80} className="h-20 w-auto" />
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200 text-center text-gray-600 text-sm">
            <p>Thank you for believing us!</p>
            {/* You might want to add freelancer name or contact here again */}
            <p className="mt-1">{freelancerDetails.name} | {freelancerDetails.email}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
