import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDocument } from '@/services/api';
import type { Document, ExtractedFields } from '@/types/document';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import { getDownloadUrl } from '@/services/api';

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function parseExtractedData(raw: string | null): ExtractedFields | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchDocument(id)
      .then(setDoc)
      .catch(() => setError('Document not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || doc?.status === 'COMPLETED' || doc?.status === 'FAILED') return;
    const interval = setInterval(async () => {
      try {
        const updated = await fetchDocument(id);
        setDoc(updated);
        if (updated.status === 'COMPLETED' || updated.status === 'FAILED') clearInterval(interval);
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [id, doc?.status]);

  if (loading) {
    return (
      <div className="max-w-container-max mx-auto space-y-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="max-w-container-max mx-auto text-center py-16">
        <span className="material-symbols-outlined text-[48px] text-outline-variant">error</span>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-4">{error || 'Document not found'}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary font-label-md text-label-md hover:underline cursor-pointer">
          Back to documents
        </button>
      </div>
    );
  }

  const fields = parseExtractedData(doc.extractedData);
  const processing = doc.status === 'PENDING' || doc.status === 'PROCESSING';

  return (
    <div className="max-w-container-max mx-auto space-y-6">
      <nav className="flex items-center gap-2 text-on-surface-variant">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-label-md text-label-md">Documents</span>
        </button>
        <span className="text-outline-variant">/</span>
        <span className="font-label-md text-label-md text-on-surface">{doc.fileName}</span>
      </nav>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[32px]">description</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface">{doc.fileName}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 font-body-sm text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {new Date(doc.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">database</span>
                  {formatSize(doc.fileSize)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">grid_view</span>
                  {doc.contentType}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={getDownloadUrl(doc.id)} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" icon={<span className="material-symbols-outlined text-[18px]">visibility</span>}>
                View PDF
              </Button>
            </a>
            <Badge status={doc.status} size="md" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">document_scanner</span>
              Extracted Text (OCR)
            </h2>
            {doc.extractedText && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(doc.extractedText!);
                  showToast('Text copied to clipboard');
                }}
                className="text-primary hover:bg-surface-container-low p-2 rounded-lg transition-colors flex items-center gap-1 font-label-sm text-label-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                Copy Text
              </button>
            )}
          </div>
          <div className="flex-1 bg-surface-container-lowest border border-border rounded-xl overflow-hidden shadow-inner">
            {processing ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" style={{ width: `${60 + Math.random() * 40}%` }} />)}
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-6 font-code-sm text-code-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                {doc.extractedText || <span className="text-on-surface-variant italic">No text extracted</span>}
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              Extracted Fields (AI)
            </h2>
          </div>
          <div className="flex-1 bg-surface border border-border rounded-xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6 space-y-6">
            {processing ? (
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-12 w-full" /></div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field name="Total Amount" icon="payments" fill value={fields?.total ? `$${fields.total.replace(/^\$/, '')}` : null} />
                  <Field name="Date" icon="event" value={fields?.date ?? null} />
                </div>
                <Field name="Vendor Name" icon="store" value={fields?.vendor ?? null} />
                <Field name="Invoice Number" icon="tag" value={fields?.invoiceNumber ?? null} />
                {doc.status === 'COMPLETED' && (
                  <div className="flex items-center gap-2 p-3 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-lg font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                    <span>AI extraction complete based on document layout structure.</span>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ name, icon, value, fill }: { name: string; icon: string; value: string | null; fill?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">{name}</label>
      <div className="p-3 bg-surface-container-low rounded-lg border border-border flex items-center gap-3">
        <span className="material-symbols-outlined text-primary" style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}>{icon}</span>
        {value
          ? <span className="font-body-lg text-body-lg text-on-surface">{value}</span>
          : <span className="font-body-lg text-body-lg text-on-surface-variant italic">&mdash; Not found</span>
        }
      </div>
    </div>
  );
}
