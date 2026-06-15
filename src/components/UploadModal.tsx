import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { uploadDocument } from '@/services/api';
import { showToast } from '@/components/ui/Toast';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

export function UploadModal({ open, onClose }: UploadModalProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      showToast('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setFile(null);
      onClose();
    },
    onError: (err: Error) => {
      showToast(err.message);
    },
  });

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleUpload = () => {
    if (file) mutation.mutate(file);
  };

  const reset = () => {
    setFile(null);
    setDragActive(false);
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Upload Document">
      <div className="p-8">
        <div
          className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:bg-surface-container-low group ${dragActive ? 'border-primary bg-surface-container-low' : 'border-outline-variant'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="w-16 h-16 bg-primary-container/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-primary text-[40px]">cloud_upload</span>
          </div>
          {file ? (
            <>
              <h3 className="font-body-lg text-body-lg font-semibold text-on-surface mb-2">{file.name}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-8">
                {file.size < 1024 * 1024
                  ? `${(file.size / 1024).toFixed(0)} KB`
                  : `${(file.size / 1024 / 1024).toFixed(1)} MB`}
              </p>
              <Button size="lg" loading={mutation.isPending} onClick={(e) => { e.stopPropagation(); handleUpload(); }}>
                Upload
              </Button>
            </>
          ) : (
            <>
              <h3 className="font-body-lg text-body-lg font-semibold text-on-surface mb-2">
                Drag & drop your PDF here, or click to browse.
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-8">PDF files only, max 50MB</p>
              <Button variant="secondary" size="lg" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                Browse Files
              </Button>
            </>
          )}
          <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} />
        </div>
      </div>
      <div className="px-8 pb-8 flex items-center justify-center gap-stack-md text-on-surface-variant/60">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">lock</span>
          <span className="text-label-sm font-label-sm">Secure Extraction</span>
        </div>
        <div className="w-1 h-1 bg-outline-variant rounded-full" />
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          <span className="text-label-sm font-label-sm">Real-time OCR</span>
        </div>
      </div>
    </Modal>
  );
}
