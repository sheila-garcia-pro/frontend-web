import React from 'react';
import { MenuListItem } from '../../types/menu';
import { useMenuPDF } from '../../hooks/useMenuPDF';
import { usePDFModal } from '../../hooks/usePDFModal';
import { PDFModal } from './PDFModal';
import { useNotification } from '../../hooks/useNotification';
import './MenuActions.css';

interface MenuActionsProps {
  menu: MenuListItem;
  onEdit?: (menu: MenuListItem) => void;
  onDelete?: (menu: MenuListItem) => void;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  showPDFButtons?: boolean;
  compact?: boolean;
}

export const MenuActions: React.FC<MenuActionsProps> = ({
  menu,
  onEdit,
  onDelete,
  showEditButton = true,
  showDeleteButton = true,
  showPDFButtons = true,
  compact = false,
}) => {
  const { isGenerating, downloadPDF, previewPDF, convertMenuToPDFData } = useMenuPDF();
  const { isModalOpen, pdfUrl, openModal, closeModal } = usePDFModal();
  const { showSuccess, showError } = useNotification();

  const handlePreview = async () => {
    try {
      const pdfData = await convertMenuToPDFData(menu);
      const url = await previewPDF(pdfData);
      openModal(url);
    } catch (error) {
      showError('Erro ao gerar visualização do PDF', { duration: 4000 });
    }
  };

  const handleDownload = async () => {
    try {
      const pdfData = await convertMenuToPDFData(menu);
      await downloadPDF(pdfData);
      showSuccess('PDF baixado com sucesso!', { duration: 3000 });
    } catch (error) {
      showError('Erro ao baixar PDF', { duration: 4000 });
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(menu);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      if (window.confirm(`Tem certeza que deseja excluir o cardápio "${menu.name}"?`)) {
        onDelete(menu);
      }
    }
  };

  return (
    <>
      <div className={`menu-actions ${compact ? 'menu-actions--compact' : ''}`}>
        {showPDFButtons && (
          <div className="menu-actions__pdf-group">
            <button
              type="button"
              className="menu-actions__btn menu-actions__btn--preview"
              onClick={handlePreview}
              disabled={isGenerating}
              title="Visualizar PDF"
            >
              {isGenerating ? (
                <span className="menu-actions__loading">...</span>
              ) : (
                <>
                  <svg className="menu-actions__icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {!compact && 'Visualizar'}
                </>
              )}
            </button>

            <button
              type="button"
              className="menu-actions__btn menu-actions__btn--download"
              onClick={handleDownload}
              disabled={isGenerating}
              title="Baixar PDF"
            >
              {isGenerating ? (
                <span className="menu-actions__loading">...</span>
              ) : (
                <>
                  <svg className="menu-actions__icon" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {!compact && 'Baixar PDF'}
                </>
              )}
            </button>
          </div>
        )}

        {showEditButton && onEdit && (
          <button
            type="button"
            className="menu-actions__btn menu-actions__btn--edit"
            onClick={handleEdit}
            title="Editar cardápio"
          >
            <svg className="menu-actions__icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            {!compact && 'Editar'}
          </button>
        )}

        {showDeleteButton && onDelete && (
          <button
            type="button"
            className="menu-actions__btn menu-actions__btn--delete"
            onClick={handleDelete}
            title="Excluir cardápio"
          >
            <svg className="menu-actions__icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {!compact && 'Excluir'}
          </button>
        )}
      </div>

      <PDFModal isOpen={isModalOpen} pdfUrl={pdfUrl} onClose={closeModal} title={menu.name} />
    </>
  );
};
