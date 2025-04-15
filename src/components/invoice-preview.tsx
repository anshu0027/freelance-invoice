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

    try {
      const element = invoiceRef.current

      // Create a deep clone of the element with all its children
      const clone = element.cloneNode(true) as HTMLElement

      // Convert all colors to RGB
      const convertToRGB = (color: string): string => {
        if (color.includes('oklch')) {
          // Convert oklch to rgb based on common values
          if (color.includes('indigo-700')) return 'rgb(79, 70, 229)'
          if (color.includes('gray-600')) return 'rgb(75, 85, 99)'
          if (color.includes('gray-200')) return 'rgb(229, 231, 235)'
          if (color.includes('gray-300')) return 'rgb(209, 213, 219)'
          return 'rgb(0, 0, 0)' // default to black
        }
        return color
      }

      // Process all elements in the clone
      const processElement = (el: Element) => {
        const computedStyle = window.getComputedStyle(el)

        // Convert text color
        const color = computedStyle.color
        if (color) {
          (el as HTMLElement).style.color = convertToRGB(color)
        }

        // Convert background color
        const bgColor = computedStyle.backgroundColor
        if (bgColor) {
          (el as HTMLElement).style.backgroundColor = convertToRGB(bgColor)
        }

        // Convert border color
        const borderColor = computedStyle.borderColor
        if (borderColor) {
          (el as HTMLElement).style.borderColor = convertToRGB(borderColor)
        }

        // Process children
        Array.from(el.children).forEach(processElement)
      }

      // Process the clone
      processElement(clone)

      // Ensure the clone has the same dimensions and styles
      clone.style.width = element.offsetWidth + 'px'
      clone.style.height = element.offsetHeight + 'px'
      clone.style.position = 'absolute'
      clone.style.top = '0'
      clone.style.left = '0'

      // Create a container for the clone
      const container = document.createElement('div')
      container.style.position = 'relative'
      container.style.width = element.offsetWidth + 'px'
      container.style.height = element.offsetHeight + 'px'
      container.appendChild(clone)

      // Add the container to the document temporarily
      document.body.appendChild(container)

      // Wait for styles to be applied
      await new Promise(resolve => setTimeout(resolve, 100))

      const canvas = await html2canvas(container, {
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

      // Remove the temporary container
      document.body.removeChild(container)

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
