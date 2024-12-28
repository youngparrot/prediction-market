import Image from "next/image";
import React from "react";
import { formatEther } from "viem";

const PredictionCard = ({ prediction, onClick }) => {
  return (
    <div
      className="flex flex-col justify-between bg-white shadow-lg p-4 rounded-md cursor-pointer hover:shadow-xl"
      onClick={onClick}
    >
      <div className="flex gap-4 items-center mb-4">
        <Image
          src={prediction.image}
          width={60}
          height={60}
          alt={`${prediction.question} logo`}
        />
        <h3 className="text-primary text-lg font-semibold mb-2">
          {prediction.question}
        </h3>
      </div>
      <div>
        <p className="text-sm text-gray-600">
          Asked By:{" "}
          {`${prediction.createdBy.slice(0, 6)}...${prediction.createdBy.slice(
            -4
          )}`}
        </p>
        <p className="text-sm text-gray-600">
          Ended At: {new Date(prediction.endDate).toLocaleString()}
        </p>
      </div>
      <div className="pt-4">
        <p className="text-sm font-bold text-secondary-light">
          Total: {formatEther(prediction.total)} $CORE
        </p>
      </div>
    </div>
  );
};

export default PredictionCard;
