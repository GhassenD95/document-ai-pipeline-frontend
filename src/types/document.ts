export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  status: DocumentStatus;
  extractedText: string | null;
  extractedData: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface UploadResponse {
  id: string;
  fileName: string;
  status: DocumentStatus;
  createdAt: string;
}

export interface ExtractedFields {
  total: string | null;
  date: string | null;
  vendor: string | null;
  invoiceNumber: string | null;
}
