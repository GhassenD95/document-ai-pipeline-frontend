import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDocuments, searchDocuments } from '@/services/api';
import type { Document } from '@/types/document';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';

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
  const [query, setQuery] = useState('');

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['documents', query],
    queryFn: () => query.trim() ? searchDocuments(query.trim()) : fetchDocuments(),
    refetchInterval: (query) => {
      const docs = query.state.data ?? [];
      return docs.some(d => d.status === 'PENDING' || d.status === 'PROCESSING') ? 4000 : false;
    },
  });

  const clearSearch = useCallback(() => setQuery(''), []);

  return (
    <div className="max-w-container-max mx-auto space-y-8">
      <section className="space-y-2">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Document Processing Queue</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Automated OCR and data extraction pipeline. Upload your PDF documents to instantly process structured data.
        </p>
      </section>

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
        {query.trim() && (
          <button
            onClick={clearSearch}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-secondary-container text-on-secondary-fixed hover:bg-outline-variant transition-colors font-label-md text-label-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            Clear search
          </button>
        )}
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
                      <td className="px-6 py-5"><Skeleton className="h-4 w-12 ml-auto" /></td>
                    </tr>
                  ))
                : documents.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <span className="material-symbols-outlined text-[48px] text-outline-variant">description</span>
                          <p className="font-body-md text-body-md text-on-surface-variant">
                            {query.trim() ? `No documents match "${query}"` : 'No documents yet. Upload your first PDF to get started.'}
                          </p>
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
                        <span className="text-primary font-label-md text-label-md inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!isLoading && documents.length > 0 && (
          <div className="px-6 py-4 bg-surface-container-lowest border-t border-border flex items-center justify-between">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Showing 1 to {documents.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
