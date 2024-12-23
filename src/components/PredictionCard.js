import React from "react";
import { FaUser } from "react-icons/fa";

const PredictionCard = ({ prediction, onClick }) => {
  return (
    <div
      className="bg-white shadow-lg p-4 rounded-md cursor-pointer hover:shadow-xl"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold mb-2">{prediction.question}</h3>
      <p className="text-sm text-gray-600">
        Creator: {`${prediction[5].slice(0, 6)}...${prediction[5].slice(-4)}`}
      </p>
      <p className="text-sm text-gray-600">
        Start: {new Date(prediction[7].toString() * 1000).toLocaleString()}
      </p>
      <p className="text-sm text-gray-600">
        End: {new Date(prediction[8].toString() * 1000).toLocaleString()}
      </p>
    </div>
  );
};

export default PredictionCard;
