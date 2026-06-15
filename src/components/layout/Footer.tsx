export function Footer() {
  return (
    <footer className="w-full py-8 bg-surface border-t border-border mt-auto">
      <div className="max-w-container-max mx-auto px-margin-page flex flex-col md:flex-row justify-between items-center gap-stack-md">
        <div className="flex items-center gap-stack-md">
          <span className="font-label-md text-label-md font-bold text-on-surface">Doc AI Pipeline</span>
          <span className="w-px h-4 bg-outline-variant hidden md:block" />
          <p className="font-body-sm text-body-sm text-on-surface-variant">&copy; 2026 Doc AI Pipeline. Professional Document Extraction.</p>
        </div>
        <div className="flex gap-6">
          {['Privacy Policy', 'Terms of Service', 'API Docs', 'Support'].map(item => (
            <a key={item} href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
