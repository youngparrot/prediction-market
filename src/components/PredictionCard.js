import { CORE_SCAN_URL } from "@/utils/environment";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaCheck, FaSpinner, FaTwitter } from "react-icons/fa";
import { formatEther } from "viem";
import WatchlistIcon from "./WatchlistIcon";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import PredictionModal from "./PredictionModal";

const PredictionCard = ({ prediction }) => {
  const { address, isConnected } = useAccount();
  const [isClaiming, setIsClaiming] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const isDone = prediction.endDate
    ? new Date(prediction.endDate).getTime() <= Date.now()
    : false;

  const [isPredictionAllowed, setIsPredictionAllowed] = useState(true);

  useEffect(() => {
    if (!prediction?.predictionCutoffDate) {
      return;
    }

    const now = dayjs();

    setIsPredictionAllowed(now.isBefore(prediction?.predictionCutoffDate));
  }, [prediction?.predictionCutoffDate]);

  const handlePredictButtonClick = (e) => {
    e.preventDefault();

    if (isDone) {
      toast.info("This prediction is done, so you cannot predict anymore");
      return;
    }

    if (!isPredictionAllowed) {
      toast.info("Predictions are not accepted after Prediction Cutoff Time");
      return;
    }

    setSelectedPrediction(prediction);
  };

  const handlePredict = async (answerIndex, amount) => {
    try {
      setIsPredicting(true);

      const writeContract = getContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PredictionMarketABI,
        client: walletClient,
      });
      const tx = await writeContract.write.predict(
        [prediction.prediction._id, answerIndex],
        {
          value: parseEther(amount.toString()),
        }
      );
      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      if (transactionReceipt.status === "success") {
        try {
          await postUser(address, parseInt(amount));
        } catch (error) {
          console.log("Post user failed ", error);
        }

        try {
          await createTransaction(
            prediction.prediction._id,
            answerIndex,
            address,
            parseInt(amount),
            transactionReceipt.transactionHash
          );
        } catch (error) {
          console.log("Create transaction failed ", error);
        }

        if (window.dataLayer) {
          window.dataLayer.push({
            event: "predict-success",
            predictionId: prediction.prediction._id,
            userAddress: `address_${address}`,
            value: amount,
            answerIndex,
            transaction_id: `id_${transactionReceipt.transactionHash}`,
          });
        }

        toast.success("Predict successful");

        getPredictionContract();
        fetchUserContract();
        setSelectedPrediction(null);
      } else {
        toast.error("Predict failed, please try again");
        if (window.dataLayer) {
          window.dataLayer.push({
            event: "predict-failed-try-again",
            predictionId: prediction.prediction._id,
            userAddress: `address_${address}`,
            value: amount,
            answerIndex,
          });
        }
      }
    } catch (error) {
      console.log("Predict failed", error);
      if (error.message.startsWith("User rejected the request")) {
        toast.error("You rejected the request");
      } else {
        if (window.dataLayer) {
          window.dataLayer.push({
            event: "predict-failed",
            predictionId: prediction.prediction._id,
            userAddress: `address_${address}`,
            value: amount,
            answerIndex,
          });
        }
      }
    } finally {
      setIsPredicting(false);
    }
  };

  const handleClaimRewards = async () => {
    try {
      setIsClaiming(true);

      if (claimAmount == 0) {
        toast.info("You do not have any reward to claim");
        return;
      }

      if (hasClaimed) {
        toast.info("You already claimed");
        return;
      }

      const writeContract = getContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PredictionMarketABI,
        client: walletClient,
      });
      const tx = await writeContract.write.claimRewards(
        [prediction.prediction._id],
        {
          value: 0,
        }
      );
      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });
      if (transactionReceipt.status === "success") {
        toast.success("Claim rewards successful");
        fetchHasClaimed();
        if (window.dataLayer) {
          window.dataLayer.push({
            event: "claim-rewards-success",
            userAddress: `address_${address}`,
            value: claimAmount,
            transaction_id: `id_${transactionReceipt.transactionHash}`,
          });
        }
      } else {
        toast.error("Claim rewards failed, please try again");
        if (window.dataLayer) {
          window.dataLayer.push({
            event: "claim-rewards-failed-try-again",
            userAddress: `address_${address}`,
            value: claimAmount,
          });
        }
      }
    } catch (error) {
      console.log("Claim rewards failed", error);
      if (error.message.startsWith("User rejected the request")) {
        toast.error("You rejected the request");
      } else {
        if (window.dataLayer) {
          window.dataLayer.push({
            event: "claim-rewards-failed",
            userAddress: `address_${address}`,
            value: claimAmount,
          });
        }
      }
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="card relative flex flex-col justify-between bg-white shadow-lg p-4 rounded-md cursor-pointer hover:shadow-xl h-full">
      <div className="flex justify-between">
        <div></div>
        <div className="flex gap-2 items-center text-gray-500 text-sm">
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
      <div className="flex gap-4 items-start justify-start mb-2">
        <Image
          src={prediction.image ?? "/images/prediction-no-image.png"}
          width={60}
          height={60}
          alt={`${prediction.question} logo`}
        />
        <h3 className="text-primary text-sm font-semibold">
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
          <p className="font-bold text-secondary-light mb-2">
            Total: {formatEther(prediction.total)} $CORE
          </p>
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
        <div className="mt-2 flex items-center justify-between">
          {isConnected ? (
            <p>
              <WatchlistIcon prediction={prediction} />
            </p>
          ) : (
            <span></span>
          )}
          <div className="flex gap-4 items-center mt-2">
            {isDone && prediction ? (
              <>
                {prediction.ended ? (
                  <button
                    id="claim-rewards"
                    // onClick={handleClaimRewards}
                    className="flex items-center bg-secondary text-white py-2 px-4 rounded"
                  >
                    Claim Rewards
                    {isClaiming && (
                      <FaSpinner className="ml-2 animate-spin text-white w-5 h-5" />
                    )}
                  </button>
                ) : (
                  <span className="text-green-500 font-bold">
                    The prediction has concluded, and we are now determining the
                    correct outcome.
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
