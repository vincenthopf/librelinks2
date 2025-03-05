import React from 'react';

/**
 * DetailsModal component for displaying expanded details for analytics metrics
 * Matches the Plausible design for modal dialogs
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {string} props.title - Title of the modal
 * @param {React.ReactNode} props.children - Content of the modal
 */
const DetailsModal = ({ isOpen, onClose, title, children }) => {
  // Handle ESC key to close modal
  React.useEffect(() => {
    if (!isOpen) return; // Only add listeners if modal is open

    const handleEsc = e => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Early return if modal is not open
  if (!isOpen) return null;

  // Handle background click to close modal
  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 id="modal-title" className="text-lg font-medium">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal content */}
        <div className="overflow-y-auto p-4 flex-grow">{children}</div>

        {/* Modal footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
