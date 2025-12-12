import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar Exclusão", 
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar"
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
         <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex-shrink-0">
                <AlertTriangle size={24} />
            </div>
            <p className="text-gray-600 dark:text-gray-300 pt-1 leading-relaxed">
                {message}
            </p>
         </div>
         
         <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
                {cancelText}
            </Button>
            <Button variant="danger" onClick={onConfirm} className="w-full sm:w-auto">
                {confirmText}
            </Button>
         </div>
      </div>
    </Modal>
  );
};