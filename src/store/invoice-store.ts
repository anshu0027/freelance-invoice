// types.ts (or add within invoice-preview.tsx if preferred)
export interface FreelancerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface ClientDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate: string; // Assuming YYYY-MM-DD format
  dueDate: string;     // Assuming YYYY-MM-DD format
}

export interface ServiceSelection {
  category: string;
  packageTier: string;
  discountPercentage: number;
}

export interface AdditionalInfo {
  notes: string;
  paymentTerms: string; // e.g., "15", "30", "immediate"
  paymentMethod: string; // e.g., "bankTransfer", "upi"
}

// Combine all data into a single type for easier prop passing
export interface InvoiceData {
  freelancerDetails: FreelancerDetails;
  clientDetails: ClientDetails;
  invoiceDetails: InvoiceDetails;
  serviceSelection: ServiceSelection;
  additionalInfo: AdditionalInfo;
}

// Props for the InvoicePreview component
export interface InvoicePreviewProps {
  onBack: () => void;
  invoiceData: InvoiceData; // Pass all data as a single object
}

// Props for InvoiceForm
export interface InvoiceFormProps {
  onPreview: () => void;
  invoiceData: InvoiceData; // Current data to display
  // Updater functions passed from the parent
  onUpdateFreelancerDetails: (details: FreelancerDetails) => void;
  onUpdateClientDetails: (details: ClientDetails) => void;
  onUpdateInvoiceDetails: (details: InvoiceDetails) => void;
  onUpdateServiceSelection: (selection: ServiceSelection) => void;
  onUpdateAdditionalInfo: (info: AdditionalInfo) => void;
}