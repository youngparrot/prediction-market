import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { formatEther, formatUnits } from "viem";
import WatchlistIcon from "./WatchlistIcon";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import {
  DEFAULT_CHAIN_ID,
  NATIVE_TOKEN_ADDRESS,
  environments,
} from "@/utils/environment";
import Share from "./Share";
import ERC20ABI from "@/lib/abi/ERC20.json";

const PredictionCard = ({ prediction }) => {
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  const [isClaiming, setIsClaiming] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const isDone = prediction.endDate
    ? new Date(prediction.endDate).getTime() <= Date.now()
    : false;

  const [isPredictionAllowed, setIsPredictionAllowed] = useState(true);

  const { data: walletClient } = useWalletClient();

  const [decimals, setDecimals] = useState(null);

  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);
  useEffect(() => {
    const fetchChainId = async () => {
      if (walletClient) {
        const id = await walletClient.getChainId(); // Fetch the connected chain ID
        setChainId(id);
      }
    };

    fetchChainId();
  }, [walletClient]);

  useEffect(() => {
    if (!prediction?.paymentToken || !environments || !chainId) {
      return;
    }

    const loadDecimals = async () => {
      if (
        prediction.paymentToken === environments[chainId]["NATIVE_TOKEN_SYMBOL"]
      ) {
        setDecimals(18);
      } else {
        const decimals = await publicClient.readContract({
          address:
            environments[chainId]["PREDICTION_MARKET_ADDRESS"][
              prediction.paymentToken
            ].tokenAddress,
          abi: ERC20ABI,
          functionName: "decimals",
        });
        setDecimals(decimals);
      }
    };

    loadDecimals();
  }, [publicClient, environments, chainId, prediction]);

  useEffect(() => {
    if (!prediction?.predictionCutoffDate) {
      return;
    }

    const now = dayjs();

    setIsPredictionAllowed(now.isBefore(prediction?.predictionCutoffDate));
  }, [prediction?.predictionCutoffDate]);

  return (
    <div className="card relative flex flex-col justify-between bg-white shadow-lg p-4 rounded-md cursor-pointer hover:shadow-xl h-full">
      <div className="flex justify-between">
        <div></div>
        <div className="flex gap-2 items-center">
          {isConnected ? (
            <p>
              <WatchlistIcon prediction={prediction} />
            </p>
          ) : (
            <span></span>
          )}
          <Share prediction={prediction} />
        </div>
      </div>
      <div className="flex gap-4 items-start justify-start mb-2">
        <Image
          src={prediction.image ?? "/images/prediction-no-image.png"}
          width={60}
          height={60}
          alt={`${prediction.question} logo`}
        />
        <div>
          <h3 className="text-primary text-sm font-semibold">
            {prediction.question}
          </h3>
          <div>
            <span className="px-2 py-1 rounded text-white text-xs bg-gray-700">
              {prediction.category}
            </span>
          </div>
          <div className="flex gap-2 items-center text-gray-500 text-sm mb-2">
            {isDone
              ? "Completed"
              : prediction.status === "active"
              ? "Active"
              : "Review"}
            <div
              className={`${
                isDone
                  ? "purple-dot"
                  : prediction.status === "active"
                  ? "green-dot"
                  : "orange-dot"
              }`}
            ></div>
          </div>
        </div>
      </div>
      <div className="mt-auto">
        {isDone && prediction.ended ? (
          <div className="text-green-500 mb-2 font-bold">
            <span className="text-primary">Answer:</span>{" "}
            {prediction.answers[parseInt(prediction.winningAnswerIndex)]}
          </div>
        ) : null}
        <div>
          <p className="flex gap-1 items-center text-sm text-gray-600">
            Asked By:{" "}
            {`${prediction.createdBy.slice(
              0,
              6
            )}...${prediction.createdBy.slice(-4)}`}
            {/* <a
              href={prediction.twitter}
              title="Creator Twitter/X"
              target="_blank"
            >
              <FaTwitter />
            </a> */}
          </p>
          {prediction.predictionCutoffDate ? (
            <p className="text-sm text-gray-600">
              Cutoff At:{" "}
              {new Date(prediction.predictionCutoffDate).toLocaleString()}
            </p>
          ) : null}
          <p className="text-sm text-gray-600">
            Ended At: {new Date(prediction.endDate).toLocaleString()}
          </p>
        </div>
        <hr
          className="w-full mt-2 mb-2"
          style={{ borderTop: "1px solid #F7C942" }}
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-2">
            <p className="flex gap-1 font-bold text-secondary-light mb-2">
              Total: {formatUnits(prediction.total, decimals)}{" "}
              {prediction.paymentToken}{" "}
              <Image
                src={
                  environments[chainId]["PREDICTION_MARKET_ADDRESS"][
                    prediction.paymentToken
                  ].image
                }
                width={20}
                height={20}
                className="w-[24px] h-[24px]"
                alt="Symbol"
              />
            </p>
          </div>
          <div className="flex gap-4 items-center mt-2">
            {isDone && prediction ? (
              <>
                {prediction.ended ? (
                  <button
                    id="claim-rewards"
                    // onClick={handleClaimRewards}
                    className="flex items-center bg-secondary text-white py-2 px-4 rounded"
                  >
                    Claim
                    {isClaiming && (
                      <FaSpinner className="ml-2 animate-spin text-white w-5 h-5" />
                    )}
                  </button>
                ) : (
                  <span className="text-green-500 font-bold">
                    Wait for outcome
                  </span>
                )}
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
                id="predict-button"
                // onClick={handlePredictButtonClick}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Predict
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
