import { useState } from 'react';

export const usePDFModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const openModal = (url: string) => {
    setPdfUrl(url);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPdfUrl(null);
  };

  return {
    isModalOpen,
    pdfUrl,
    openModal,
    closeModal,
  };
};
