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
      <div ref={modalRef} className="bg-secondary rounded-lg max-w-md w-full">
        <div className="p-4">
          <motion.button
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={onClose}
            className="text-white float-right"
          >
            ✕
          </motion.button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
