import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Settings from '../pages/Settings';

const SettingsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>✕</button>
        <Settings />
      </div>
    </div>,
    document.body
  );
};

export default SettingsModal;
