import React from "react";
import { FaUser } from "react-icons/fa";
import { formatUnits } from "viem";

const PredictionCard = ({ prediction, onClick }) => {
  return (
    <div
      className="flex flex-col justify-between bg-white shadow-lg p-4 rounded-md cursor-pointer hover:shadow-xl"
      onClick={onClick}
    >
      <h3 className="text-primary text-lg font-semibold mb-2">
        {prediction[0]}
      </h3>
      <div>
        <p className="text-sm text-gray-600">
          Start: {new Date(prediction[7].toString() * 1000).toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          End: {new Date(prediction[8].toString() * 1000).toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          Creator: {`${prediction[5].slice(0, 6)}...${prediction[5].slice(-4)}`}
        </p>
      </div>
      <div className="pt-4">
        <p className="text-sm font-bold text-secondary-light">
          {formatUnits(prediction[6], 18)} $YPC Vol
        </p>
      </div>
    </div>
  );
};

export default PredictionCard;
