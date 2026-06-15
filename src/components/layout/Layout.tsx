import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { UploadModal } from '@/components/UploadModal';
import { Toast } from '@/components/ui/Toast';

export function Layout() {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onUploadClick={() => setUploadOpen(true)} />
      <main className="flex-grow pt-24 pb-12 px-margin-page">
        <Outlet />
      </main>
      <Footer />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <Toast />
    </div>
  );
}
