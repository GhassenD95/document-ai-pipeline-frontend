import { Button } from '@/components/ui/Button';

interface HeaderProps {
  onUploadClick: () => void;
}

export function Header({ onUploadClick }: HeaderProps) {
  return (
    <header className="h-16 w-full fixed top-0 left-0 bg-surface border-b border-border shadow-sm z-40">
      <div className="flex items-center justify-between h-full max-w-container-max mx-auto px-margin-page">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
          </div>
          <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">Doc AI Pipeline</h1>
        </div>
        <Button icon={<span className="material-symbols-outlined text-[18px]">upload_file</span>} onClick={onUploadClick}>
          Upload PDF
        </Button>
      </div>
    </header>
  );
}
