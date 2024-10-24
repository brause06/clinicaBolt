import React from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative max-w-3xl max-h-3xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-75"
        >
          <X size={24} />
        </button>
        <img src={imageUrl} alt="Vista ampliada" className="max-w-full max-h-[90vh] object-contain" />
      </div>
    </div>
  );
};

export default ImageModal;

