import React, { useState } from "react";

const amounts = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200];

const PredictionModal = ({ prediction, onClose, onSubmit }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [amount, setAmount] = useState(amounts[0]);

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      onSubmit(selectedAnswer, amount);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">{prediction.question}</h2>
        <div className="mb-4">
          <p className="font-semibold">Select Answer:</p>
          {prediction[1].map((answer, index) => (
            <button
              key={index}
              className={`w-full text-left p-2 rounded mb-2 ${
                selectedAnswer === index
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}
              onClick={() => setSelectedAnswer(index)}
            >
              {answer}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <p className="font-semibold">Select Amount:</p>
          <select
            className="w-full p-2 border rounded"
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
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Predict
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionModal;
