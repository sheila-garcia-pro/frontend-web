import React from 'react';
import './PDFModal.css';

interface PDFModalProps {
  isOpen: boolean;
  pdfUrl: string | null;
  onClose: () => void;
  title: string;
}

export const PDFModal: React.FC<PDFModalProps> = ({ isOpen, pdfUrl, onClose, title }) => {
  if (!isOpen || !pdfUrl) return null;

  return (
    <div className="pdf-modal-overlay" onClick={onClose}>
      <div className="pdf-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-modal-header">
          <h3 className="pdf-modal-title">Visualização: {title}</h3>
          <button className="pdf-modal-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>
        <div className="pdf-modal-content">
          <iframe src={pdfUrl} className="pdf-iframe" title={`PDF - ${title}`} />
        </div>
      </div>
    </div>
  );
};
