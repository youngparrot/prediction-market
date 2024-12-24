import React, { useState } from "react";
import Modal from "./Modal";
import { FaSpinner } from "react-icons/fa";

const amounts = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200];

const PredictionModal = ({ prediction, onClose, onSubmit, isLoading }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [amount, setAmount] = useState(amounts[0]);

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      onSubmit(selectedAnswer, amount);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Modal isOpen={prediction} onClose={onClose}>
        <div className="p-6 rounded-lg shadow-lg">
          <h2 className="text-primary font-bold mb-4">{prediction[0]}</h2>
          <div className="mb-4">
            <p className="text-primary-light font-bold">Select Answer:</p>
            {prediction[1].map((answer, index) => (
              <button
                key={index}
                className={`w-full text-left text-primary p-2 rounded mb-2 ${
                  selectedAnswer === index
                    ? "text-white bg-blue-500"
                    : "bg-gray-100"
                }`}
                onClick={() => setSelectedAnswer(index)}
              >
                {answer}
              </button>
            ))}
          </div>
          <div className="mb-4">
            <p className="text-primary-light font-bold">Select Amount:</p>
            <select
              className="w-full p-2 border rounded text-primary"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            >
              {amounts.map((amt) => (
                <option key={amt} value={amt}>
                  {amt}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-4">
            <button className="text-gray-500" onClick={onClose}>
              Cancel
            </button>
            <button
              className="flex bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleSubmit}
            >
              Predict
              {isLoading && (
                <FaSpinner className="ml-2 animate-spin text-white w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PredictionModal;
