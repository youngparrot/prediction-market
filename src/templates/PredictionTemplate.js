"use client";

import React, { useEffect, useState } from "react";
import PredictionModal from "@/components/PredictionModal";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { PREDICTION_MARKET_ADDRESS } from "@/utils/environment";
import PredictionMarketABI from "@/lib/abi/PredictionMarket.json";
import { formatEther, getContract, parseEther } from "viem";
import { toast } from "react-toastify";
import { fetchPredictions } from "@/utils/api";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";
import { FaSpinner } from "react-icons/fa";

const PredictionTemplate = () => {
  const publicClient = usePublicClient(); // Fetches the public provider
  const { data: walletClient } = useWalletClient(); // Fetches the connected wallet signer

  const { address, isConnected } = useAccount();
  const [isFetching, setIsFetching] = useState(false);
  const [prediction, setPrediction] = useState();
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [claimAmount, setClaimAmount] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [predictionContract, setPredictionContract] = useState();
  const isDone = prediction?.prediction?.endDate
    ? new Date(prediction.prediction.endDate).getTime() <= Date.now()
    : false;

  const { id } = useParams();

  const getPrediction = async () => {
    try {
      setIsFetching(true);
      const predictionData = await fetchPredictions({ id });
      setPrediction(predictionData);

      const readContract = getContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PredictionMarketABI,
        client: publicClient,
      });
      const hasClaimed = await readContract.read.hasUserClaimed([
        predictionData.prediction._id,
        address,
      ]);
      setHasClaimed(hasClaimed);

      const claimAmount = await readContract.read.getRewardToClaim([
        predictionData.prediction._id,
        address,
      ]);
      setClaimAmount(claimAmount.toString());
    } catch (error) {
      console.log("Fetching predictions failed", error);
    } finally {
      setIsFetching(false);
    }
  };

  const getPredictionContract = async () => {
    try {
      const readContract = getContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PredictionMarketABI,
        client: publicClient,
      });
      const predictionContractData =
        await readContract.read.getPredictionsByIds([
          [prediction.prediction._id],
        ]);

      setPredictionContract(predictionContractData);
    } catch (error) {
      console.log("Fetching predictions failed", error);
    }
  };

  useEffect(() => {
    getPrediction();
  }, []);

  useEffect(() => {
    if (!prediction?.prediction?._id) {
      return;
    }

    getPredictionContract();
  }, [prediction?.prediction?._id]);

  const handlePredictButtonClick = () => {
    if (isDone) {
      toast.info("This prediction is done, so you cannot predict anymore");
      return;
    }

    setSelectedPrediction(prediction.prediction);
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
        [selectedPrediction._id, answerIndex],
        {
          value: parseEther(amount.toString()),
        }
      );
      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });
      if (transactionReceipt.status === "success") {
        toast.success("Predict successful");
        setSelectedPrediction(null);
        getPredictionContract();
      } else {
        toast.error("Predict failed, please try again");
      }
    } catch (error) {
      console.log("Predict failed", error);
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
      } else {
        toast.error("Claim rewards failed, please try again");
      }
    } catch (error) {
      console.log("Claim rewards failed", error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto w-full p-2 md:p-4 bg-white text-primary-light rounded-md">
      {prediction && prediction.prediction ? (
        <div>
          <div className="flex gap-4 items-center mb-4">
            <Image
              src={prediction.prediction.image}
              width={60}
              height={60}
              alt={`${prediction.prediction.question} logo`}
            />
            <h1 className="text-primary text-xl font-bold">
              {prediction.prediction.question}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:gap-8 mb-4 text-gray-600">
            <p>
              ASKED BY:{" "}
              {`${prediction.prediction.createdBy.slice(
                0,
                6
              )}...${prediction.prediction.createdBy.slice(-4)}`}
            </p>
            <p>
              TOTAL:{" "}
              {predictionContract
                ? formatEther(predictionContract[0].totalStaked)
                : 0}{" "}
              $CORE
            </p>
            <p>
              ENDED BY:{" "}
              {new Date(prediction.prediction.endDate).toLocaleString()}
            </p>
          </div>
          <div className="text-primary font-bold mb-2">Outcomes:</div>
          <div className="flex flex-col">
            {prediction.prediction.answers.map((answer, index) => (
              <p
                key={index}
                className={`w-full text-left text-primary-light rounded mb-2`}
              >
                {index + 1}: {answer}
              </p>
            ))}
          </div>
          <div className="mt-2">
            <h1 className="text-primary font-bold mb-2">Rules:</h1>
            <p
              dangerouslySetInnerHTML={{ __html: prediction.prediction.rules }}
            ></p>
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={handlePredictButtonClick}
              className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
            >
              Predict
            </button>
            {isDone ? (
              <button
                onClick={handleClaimRewards}
                className="flex items-center bg-secondary text-white py-2 px-4 rounded mb-4"
              >
                Claim Rewards
                {isClaiming && (
                  <FaSpinner className="ml-2 animate-spin text-white w-5 h-5" />
                )}
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div>No prediction</div>
      )}

      {selectedPrediction && (
        <PredictionModal
          prediction={selectedPrediction}
          onClose={() => setSelectedPrediction(null)}
          onSubmit={handlePredict}
          isLoading={isPredicting}
        />
      )}
    </div>
  );
};

export default PredictionTemplate;
