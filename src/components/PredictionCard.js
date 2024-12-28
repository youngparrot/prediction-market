import React from "react";
import { formatEther } from "viem";

const PredictionCard = ({ prediction, onClick }) => {
  return (
    <div
      className="flex flex-col justify-between bg-white shadow-lg p-4 rounded-md cursor-pointer hover:shadow-xl"
      onClick={onClick}
    >
      <h3 className="text-primary text-lg font-semibold mb-2">
        {prediction.question}
      </h3>
      <div>
        <p className="text-sm text-gray-600">
          ENDED BY: {new Date(prediction.endDate).toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          ASKED BY:{" "}
          {`${prediction.createdBy.slice(0, 6)}...${prediction.createdBy.slice(
            -4
          )}`}
        </p>
      </div>
      <div className="pt-4">
        <p className="text-sm font-bold text-secondary-light">
          TOTAL: {formatEther(prediction.total)} $CORE
        </p>
      </div>
    </div>
  );
};

export default PredictionCard;
