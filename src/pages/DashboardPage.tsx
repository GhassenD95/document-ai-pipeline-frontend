import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDocuments, searchDocuments, generateSamplePdf, getDownloadUrl, retryDocument, deleteDocument } from '@/services/api';
import type { Document } from '@/types/document';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import { useBackendStatus } from '@/hooks/useBackendStatus';

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const backendStatus = useBackendStatus();

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['documents', query],
    queryFn: () => query.trim() ? searchDocuments(query.trim()) : fetchDocuments(),
    refetchInterval: (q) => {
      const docs = q.state.data ?? [];
      return docs.some(d => d.status === 'PENDING' || d.status === 'PROCESSING') ? 4000 : false;
    },
  });

  const sampleMutation = useMutation({
    mutationFn: generateSamplePdf,
    onSuccess: () => {
      showToast('Sample invoice generated! Processing started.');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: () => showToast('Failed to generate sample PDF'),
  });

  const retryMutation = useMutation({
    mutationFn: retryDocument,
    onSuccess: () => {
      showToast('Document re-queued for processing.');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: () => showToast('Failed to retry document'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      showToast('Document deleted.');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: () => showToast('Failed to delete document'),
  });

  const handleDelete = (e: React.MouseEvent, id: string, fileName: string) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${fileName}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-container-max mx-auto space-y-8">
      <section className="space-y-2">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Document Processing Queue</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Automated OCR and data extraction pipeline. Upload your PDF documents to instantly process structured data.
        </p>
      </section>

      {backendStatus === 'starting' && (
        <div className="flex items-center gap-3 px-4 py-3 bg-warning/10 border border-warning/30 rounded-xl text-sm text-on-surface">
          <span className="material-symbols-outlined text-warning text-[20px]">hourglass_top</span>
          <div>
            <p className="font-semibold">Backend is starting up...</p>
            <p className="text-on-surface-variant text-xs">The free-tier server was asleep. This takes about a minute — try again shortly.</p>
          </div>
        </div>
      )}

      {backendStatus === 'offline' && (
        <div className="flex items-center gap-3 px-4 py-3 bg-error/10 border border-error/30 rounded-xl text-sm text-on-surface">
          <span className="material-symbols-outlined text-error text-[20px]">cloud_off</span>
          <div>
            <p className="font-semibold">Backend unreachable</p>
            <p className="text-on-surface-variant text-xs">Could not connect to the server. Please check that the backend is running.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            className="w-full h-11 pl-10 pr-4 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-sm text-body-sm"
            placeholder="Search documents..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            type="text"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            size="md"
            icon={<span className="material-symbols-outlined text-[18px]">auto_fix_high</span>}
            loading={sampleMutation.isPending}
            onClick={() => sampleMutation.mutate()}
          >
            Generate Sample
          </Button>
        </div>
      </div>

      {query.trim() && (
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Search results for '<span className="text-primary font-semibold">{query}</span>' &mdash; {documents.length} match{documents.length !== 1 ? 'es' : ''}
        </p>
      )}

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-border">
                {['File Name', 'Status', 'Date Uploaded', ''].map(h => (
                  <th key={h} className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-5"><Skeleton className="h-5 w-64" /></td>
                      <td className="px-6 py-5"><Skeleton className="h-6 w-28 rounded-full" /></td>
                      <td className="px-6 py-5"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-5"><Skeleton className="h-4 w-24 ml-auto" /></td>
                    </tr>
                  ))
                : documents.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <span className="material-symbols-outlined text-[48px] text-outline-variant">description</span>
                          <p className="font-body-md text-body-md text-on-surface-variant">
                            {query.trim() ? `No documents match "${query}"` : 'No documents yet. Upload your first PDF or generate a sample invoice.'}
                          </p>
                          {!query.trim() && (
                            <Button
                              variant="primary"
                              size="lg"
                              icon={<span className="material-symbols-outlined text-[20px]">auto_fix_high</span>}
                              loading={sampleMutation.isPending}
                              onClick={() => sampleMutation.mutate()}
                            >
                              Generate Sample Invoice
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                  : documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-surface-container-lowest transition-colors group cursor-pointer" onClick={() => navigate(`/documents/${doc.id}`)}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary-fixed rounded-lg text-primary leading-none">
                            <span className="material-symbols-outlined">description</span>
                          </div>
                          <div>
                            <p className="font-body-md text-body-md font-semibold text-on-surface">{doc.fileName}</p>
                            <p className="font-label-sm text-label-sm text-on-surface-variant">{formatSize(doc.fileSize)} &bull; {doc.contentType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5"><Badge status={doc.status} /></td>
                      <td className="px-6 py-5">
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{formatRelative(doc.createdAt)}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={getDownloadUrl(doc.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-on-surface-variant hover:text-primary font-label-sm text-label-sm flex items-center gap-1"
                            onClick={e => e.stopPropagation()}
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            PDF
                          </a>
                          {doc.status === 'FAILED' && (
                            <button
                              onClick={e => { e.stopPropagation(); retryMutation.mutate(doc.id); }}
                              className="text-warning hover:text-amber-600 font-label-sm text-label-sm flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">refresh</span>
                              Retry
                            </button>
                          )}
                          <button
                            onClick={e => handleDelete(e, doc.id, doc.fileName)}
                            className="text-on-surface-variant hover:text-error font-label-sm text-label-sm flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                          <span className="text-primary font-label-md text-label-md inline-flex items-center gap-1">
                            View <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!isLoading && documents.length > 0 && (
          <div className="px-6 py-4 bg-surface-container-lowest border-t border-border flex items-center justify-between">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {documents.length} document{documents.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
