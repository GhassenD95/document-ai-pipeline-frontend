import type { Document, UploadResponse } from '@/types/document';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081';

export async function fetchDocuments(): Promise<Document[]> {
  const res = await fetch(`${API_BASE}/api/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function fetchDocument(id: string): Promise<Document> {
  const res = await fetch(`${API_BASE}/api/documents/${id}`);
  if (!res.ok) throw new Error('Document not found');
  return res.json();
}

export async function searchDocuments(query: string): Promise<Document[]> {
  const res = await fetch(`${API_BASE}/api/documents/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function generateSamplePdf(): Promise<UploadResponse> {
  const res = await fetch(`${API_BASE}/api/documents/generate-sample`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to generate sample PDF');
  return res.json();
}

export function getDownloadUrl(id: string): string {
  return `${API_BASE}/api/documents/${id}/download`;
}

export async function retryDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/documents/${id}/retry`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to retry document');
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/documents/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete document');
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/documents/health`, { method: 'GET', signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}
