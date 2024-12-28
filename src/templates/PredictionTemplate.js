"use client";

import React, { useEffect, useState } from "react";
import PredictionModal from "@/components/PredictionModal";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { PREDICTION_MARKET_ADDRESS } from "@/utils/environment";
import PredictionMarketABI from "@/lib/abi/PredictionMarket.json";
import ERC20ABI from "@/lib/abi/ERC20.json";
import {
  formatEther,
  formatUnits,
  getContract,
  parseEther,
  parseUnits,
} from "viem";
import { toast } from "react-toastify";
import { fetchPredictions } from "@/utils/api";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

const PredictionTemplate = () => {
  const publicClient = usePublicClient(); // Fetches the public provider
  const { data: walletClient } = useWalletClient(); // Fetches the connected wallet signer

  const { address, isConnected } = useAccount();
  const [isFetching, setIsFetching] = useState(false);
  const [prediction, setPrediction] = useState();
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const { id } = useParams();

  const getPrediction = async () => {
    try {
      setIsFetching(true);
      const predictionData = await fetchPredictions({ id });

      const readContract = getContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PredictionMarketABI,
        client: publicClient,
      });
      const predictionContractData = await readContract.read.getPrediction([
        predictionData.prediction._id,
      ]);
      predictionData.stakes = predictionContractData[1];
      predictionData.winningAnswerIndex = predictionContractData[3];
      predictionData.totalStaked = formatEther(predictionContractData[5]);

      setPrediction(predictionData);
    } catch (error) {
      console.log("Fetching predictions failed", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    getPrediction();
  }, []);

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
        getPrediction();
      } else {
        toast.error("Predict failed, please try again");
      }
    } catch (error) {
      console.log("Predict failed", error);
    } finally {
      setIsPredicting(false);
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
          <h1 className="text-primary text-xl font-bold mb-4">
            {prediction.prediction.question}
          </h1>
          <div className="flex flex-col md:flex-row gap-2 md:gap-8 mb-4">
            <p>
              ASKED BY:{" "}
              {`${prediction.prediction.createdBy.slice(
                0,
                6
              )}...${prediction.prediction.createdBy.slice(-4)}`}
            </p>
            <p>TOTAL: {prediction.totalStaked} $CORE</p>
            <p>
              ENDED BY:{" "}
              {new Date(prediction.prediction.endDate).toLocaleString()}
            </p>
          </div>
          <div>
            <button
              onClick={() => setSelectedPrediction(prediction.prediction)}
              className="bg-blue-500 text-white p-2 rounded mb-4"
            >
              Predict
            </button>
          </div>
          <div>
            <h1 className="text-primary font-bold mb-2">Rules:</h1>
            <p
              dangerouslySetInnerHTML={{ __html: prediction.prediction.rules }}
            ></p>
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
