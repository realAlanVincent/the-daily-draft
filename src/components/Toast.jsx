import React from 'react';
import { IconCheck } from './Icons';

export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="toast-container animate-slide-up">
      <div className="toast-content">
        <IconCheck size={14} />
        <span>{message}</span>
        {onClose && (
          <button className="toast-close-btn" onClick={onClose}>
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
