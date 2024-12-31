import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null); // Create a ref for the modal element

  useEffect(() => {
    if (!isOpen) return; // Only add the event listener if modal is open

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose(); // Close modal if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div
        ref={modalRef}
        className="bg-white rounded-lg max-w-md md:max-w-2xl w-full"
      >
        <div className="p-4">
          <button onClick={onClose} className="text-secondary float-right">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
