"use client"

import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatCurrency } from "@/lib/utils"
import { servicesData } from "@/data/services"

import type {
  InvoiceFormProps,
  // These specific types are implicitly handled via InvoiceFormProps and invoiceData,
  // but importing them doesn't hurt if they were needed for local variables (which they aren't currently).
  // InvoiceData,
  // FreelancerDetails,
  // ClientDetails,
  // InvoiceDetails,
  // ServiceSelection,
  // AdditionalInfo
} from "@/store/invoice-store"; 

// Use the new props interface
export function InvoiceForm({
  onPreview,
  invoiceData,
  onUpdateFreelancerDetails,
  onUpdateClientDetails,
  onUpdateInvoiceDetails,
  onUpdateServiceSelection,
  onUpdateAdditionalInfo,
}: InvoiceFormProps) {

  // Destructure data from the invoiceData prop - CORRECT
  const {
    freelancerDetails,
    clientDetails,
    invoiceDetails,
    serviceSelection,
    additionalInfo,
  } = invoiceData;

  // Set default dates on initial load using the prop updater function - CORRECT
  useEffect(() => {
    let needsUpdate = false;
    const today = new Date().toISOString().split("T")[0];
    // Create a mutable copy to potentially update
    const updatedDetails = { ...invoiceDetails };

    if (!invoiceDetails.invoiceDate) {
      updatedDetails.invoiceDate = today;
      needsUpdate = true;
    }
    if (!invoiceDetails.dueDate) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // Default due date 30 days from now
      updatedDetails.dueDate = dueDate.toISOString().split("T")[0];
      needsUpdate = true;
    }

    // Only call the update function if changes were actually needed
    if (needsUpdate) {
      onUpdateInvoiceDetails(updatedDetails);
    }
    // Dependency array includes the updater function. The logic inside prevents infinite loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onUpdateInvoiceDetails]);

  // Calculate prices (uses values from props now) - CORRECT
  const selectedCategory = servicesData[serviceSelection.category]
  const selectedPackage = selectedCategory?.find((pkg) => pkg.name === serviceSelection.packageTier)

  const basePrice = selectedPackage?.monthlyPrice || 0
  const discountAmount = basePrice * (serviceSelection.discountPercentage / 100)
  const finalPrice = basePrice - discountAmount

  return (
    <>
      <Card className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-indigo-600">Invoice Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3 text-gray-700">Freelancer Details</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="freelancerName">Full Name</Label>
                <Input
                  id="freelancerName"
                  value={freelancerDetails.name}
                  onChange={(e) => onUpdateFreelancerDetails({ ...freelancerDetails, name: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="freelancerEmail">Email</Label>
                <Input
                  id="freelancerEmail"
                  type="email"
                  value={freelancerDetails.email}
                  // Use prop updater function - CORRECT
                  onChange={(e) => onUpdateFreelancerDetails({ ...freelancerDetails, email: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="freelancerPhone">Phone</Label>
                <Input
                  id="freelancerPhone"
                  value={freelancerDetails.phone}
                  // Use prop updater function - CORRECT
                  onChange={(e) => onUpdateFreelancerDetails({ ...freelancerDetails, phone: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="freelancerAddress">Address</Label>
                <Textarea
                  id="freelancerAddress"
                  rows={2}
                  value={freelancerDetails.address}
                  // Use prop updater function - CORRECT
                  onChange={(e) => onUpdateFreelancerDetails({ ...freelancerDetails, address: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div>
            <h3 className="font-medium mb-3 text-gray-700">Client Details</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="clientName">Client Name/Company</Label>
                <Input
                  id="clientName"
                  value={clientDetails.name}
                  // Use prop updater function - CORRECT
                  onChange={(e) => onUpdateClientDetails({ ...clientDetails, name: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientDetails.email}
                  // Use prop updater function - CORRECT
                  onChange={(e) => onUpdateClientDetails({ ...clientDetails, email: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Phone</Label>
                <Input
                  id="clientPhone"
                  value={clientDetails.phone}
                  // Use prop updater function - CORRECT
                  onChange={(e) => onUpdateClientDetails({ ...clientDetails, phone: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="clientAddress">Address</Label>
                <Textarea
                  id="clientAddress"
                  rows={2}
                  value={clientDetails.address}
                  // Use prop updater function - CORRECT
                  onChange={(e) => onUpdateClientDetails({ ...clientDetails, address: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={invoiceDetails.invoiceNumber}
              // Use prop updater function - CORRECT
              onChange={(e) => onUpdateInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="invoiceDate">Invoice Date</Label>
            <Input
              id="invoiceDate"
              type="date"
              value={invoiceDetails.invoiceDate}
              // Use prop updater function - CORRECT
              onChange={(e) => onUpdateInvoiceDetails({ ...invoiceDetails, invoiceDate: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={invoiceDetails.dueDate}
              // Use prop updater function - CORRECT
              onChange={(e) => onUpdateInvoiceDetails({ ...invoiceDetails, dueDate: e.target.value })}
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      {/* Service Selection */}
      <Card className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-indigo-600">Service Selection</h2>

        <div className="mb-4">
          <Label htmlFor="serviceCategory" className="mb-2">
            Service Category
          </Label>
          <Select
            value={serviceSelection.category}
            // Use prop updater function - Reset packageTier when category changes - CORRECT
            onValueChange={(value) => onUpdateServiceSelection({ ...serviceSelection, category: value, packageTier: '' })}
          >
            <SelectTrigger id="serviceCategory">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(servicesData).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4">
          <Label htmlFor="packageTier" className="mb-2">
            Package Tier
          </Label>
          <Select
            value={serviceSelection.packageTier}
            // Use prop updater function - CORRECT
            onValueChange={(value) => onUpdateServiceSelection({ ...serviceSelection, packageTier: value })}
            // Disable if no category is selected - CORRECT
            disabled={!serviceSelection.category}
          >
            <SelectTrigger id="packageTier">
              <SelectValue placeholder="Select package" />
            </SelectTrigger>
            <SelectContent>
              {/* Ensure selectedCategory is valid before mapping - CORRECT */}
              {selectedCategory?.map((pkg) => (
                <SelectItem key={pkg.name} value={pkg.name}>
                  {pkg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Included Services Display (uses selectedPackage derived from props) - CORRECT */}
        {selectedPackage && ( // Only show if a package is selected
          <div id="servicesContainer" className="mt-6">
            <h3 className="font-medium mb-3 text-gray-700">Included Services</h3>
            <div className="text-sm text-gray-600 border p-4 rounded-md bg-gray-50">
              {selectedPackage.services.map((service, index) => (
                <div key={index} className="py-2 border-b border-gray-200 last:border-0">
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium">{service.name}</span> × {service.quantity}
                      <p className="text-xs text-gray-500">{service.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <div>
            <Label htmlFor="discountPercentage">Discount (%)</Label>
            <Input
              id="discountPercentage"
              type="number"
              min="0"
              max="100"
              className="w-24 mt-2"
              value={serviceSelection.discountPercentage}
              // Use prop updater function with validation - CORRECT
              onChange={(e) =>
                onUpdateServiceSelection({
                  ...serviceSelection,
                  // Ensure value is a number between 0 and 100
                  discountPercentage: Math.max(0, Math.min(100, Number.parseInt(e.target.value) || 0)),
                })
              }
            />
          </div>
          {/* Price display (uses calculated values derived from props) - CORRECT */}
          <div className="text-right">
            <div className="text-sm text-gray-600">Base Price</div>
            <div className="text-lg font-semibold">{formatCurrency(basePrice)}</div>
            {discountAmount > 0 && ( // Only show discount section if applicable
              <>
                <div className="text-sm text-gray-600 mt-2">Discount</div>
                <div className="text-md">-{formatCurrency(discountAmount)}</div>
              </>
            )}
            <div className="text-sm text-gray-600 mt-2">Final Price</div>
            <div className="text-xl font-bold text-indigo-600">{formatCurrency(finalPrice)}</div>
          </div>
        </div>
      </Card>

      {/* Additional Information */}
      <Card className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-indigo-600">Additional Information</h2>

        <div>
          <Label htmlFor="notes" className="mb-2">
            Notes
          </Label>
          <Textarea
            id="notes"
            rows={3}
            value={additionalInfo.notes}
            // Use prop updater function - CORRECT
            onChange={(e) => onUpdateAdditionalInfo({ ...additionalInfo, notes: e.target.value })}
          />
        </div>

        <div className="mt-4">
          <Label htmlFor="paymentTerms" className="mb-2">
            Payment Terms
          </Label>
          <Select
            value={additionalInfo.paymentTerms}
            // Use prop updater function - CORRECT
            onValueChange={(value) => onUpdateAdditionalInfo({ ...additionalInfo, paymentTerms: value })}
          >
            <SelectTrigger id="paymentTerms">
              <SelectValue placeholder="Select payment terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Net 30 - Payment due within 30 days</SelectItem>
              <SelectItem value="365">Net 365 - Payment due within 365 days</SelectItem>
              <SelectItem value="immediate">Due on Receipt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4">
          <Label className="mb-2">Payment Methods</Label>
          <RadioGroup
            value={additionalInfo.paymentMethod}
            // Use prop updater function - CORRECT
            onValueChange={(value) => onUpdateAdditionalInfo({ ...additionalInfo, paymentMethod: value })}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bankTransfer" id="bankTransfer" />
              <Label htmlFor="bankTransfer">Bank Transfer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upi" id="upi" />
              <Label htmlFor="upi">UPI</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash">Cash</Label>
            </div>
          </RadioGroup>
        </div>
      </Card>

      <div className="flex justify-center mb-10">
        <Button
          onClick={onPreview} // Use prop function - CORRECT
          className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Preview & Generate Invoice
        </Button>
      </div>
    </>
  )
}
