import Image from "next/image";
import React from "react";
import { FaCheck } from "react-icons/fa";
import { formatEther } from "viem";

const PredictionCard = ({ prediction, onClick }) => {
  const isDone = prediction.endDate
    ? new Date(prediction.endDate).getTime() <= Date.now()
    : false;

  return (
    <div
      className="relative flex flex-col justify-between bg-white shadow-lg p-4 rounded-md cursor-pointer hover:shadow-xl h-full"
      onClick={onClick}
    >
      <div className="flex gap-4 items-start justify-start mb-4">
        <Image
          src={prediction.image ?? "/images/prediction-no-image.png"}
          width={60}
          height={60}
          alt={`${prediction.question} logo`}
        />
        <h3 className="text-primary text-lg font-semibold">
          {prediction.question}
        </h3>
      </div>
      <div className="mt-auto">
        {isDone && prediction.ended ? (
          <div className="text-green-500 mb-2 font-bold">
            <span className="text-primary">Answer:</span>{" "}
            {prediction.answers[parseInt(prediction.winningAnswerIndex)]}
          </div>
        ) : null}
        <div>
          <p className="text-sm text-gray-600">
            Asked By:{" "}
            {`${prediction.createdBy.slice(
              0,
              6
            )}...${prediction.createdBy.slice(-4)}`}
          </p>
          <p className="text-sm text-gray-600">
            Cutoff At:{" "}
            {new Date(prediction.predictionCutoffDate).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Ended At: {new Date(prediction.endDate).toLocaleString()}
          </p>
        </div>
        <div className="pt-4">
          <p className="font-bold text-secondary-light">
            Total: {formatEther(prediction.total)} $CORE
          </p>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
