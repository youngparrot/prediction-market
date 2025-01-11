"use client";

import React, { useEffect, useState } from "react";
import PredictionCard from "@/components/PredictionCard";
import PredictionModal from "@/components/PredictionModal";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { PREDICTION_MARKET_ADDRESS } from "@/utils/environment";
import PredictionMarketABI from "@/lib/abi/PredictionMarket.json";
import { getContract } from "viem";
import { fetchPredictions } from "@/utils/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion } from "framer-motion";

const HomeTemplate = () => {
  const publicClient = usePublicClient(); // Fetches the public provider
  const { data: walletClient } = useWalletClient(); // Fetches the connected wallet signer

  const { address, isConnected } = useAccount();
  const [isFetching, setIsFetching] = useState(false);
  const [activePredictions, setActivePredictions] = useState([]);
  const [completedPredictions, setCompletedPredictions] = useState([]);

  const getActivePredictions = async () => {
    try {
      setIsFetching(true);
      const predictionsData = await fetchPredictions({});
      const metadataIds = predictionsData.predictions.map(
        (prediction) => prediction._id
      );

      const readContract = getContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PredictionMarketABI,
        client: publicClient,
      });
      const predictionContractData =
        await readContract.read.getPredictionsByIds([metadataIds]);

      for (let i = 0; i < predictionsData.predictions.length; i++) {
        predictionsData.predictions[i].total =
          predictionContractData[i].totalStaked;
        predictionsData.predictions[i].winningAnswerIndex =
          predictionContractData[i].winningAnswerIndex;
        predictionsData.predictions[i].ended = predictionContractData[i].ended;
      }

      setActivePredictions(predictionsData);
    } catch (error) {
      console.log("Fetching active predictions failed", error);
    } finally {
      setIsFetching(false);
    }
  };

  const getCompletedPredictions = async () => {
    try {
      setIsFetching(true);
      const predictionsData = await fetchPredictions({ status: "completed" });
      const metadataIds = predictionsData.predictions.map(
        (prediction) => prediction._id
      );

      const readContract = getContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PredictionMarketABI,
        client: publicClient,
      });
      const predictionContractData =
        await readContract.read.getPredictionsByIds([metadataIds]);

      for (let i = 0; i < predictionsData.predictions.length; i++) {
        predictionsData.predictions[i].total =
          predictionContractData[i].totalStaked;
        predictionsData.predictions[i].winningAnswerIndex =
          predictionContractData[i].winningAnswerIndex;
        predictionsData.predictions[i].ended = predictionContractData[i].ended;
      }

      setCompletedPredictions(predictionsData);
    } catch (error) {
      console.log("Fetching completed predictions failed", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    getActivePredictions();
    getCompletedPredictions();
  }, []);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto w-full p-2 md:p-4">
      <div className="mb-8">
        <h1 className="text-accent text-xl font-bold mb-4">
          Active Predictions
        </h1>
        {activePredictions.predictions &&
        activePredictions.predictions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activePredictions.predictions.map((prediction) => (
              <motion.a
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                href={`/prediction/${prediction._id}`}
                title={prediction.question}
                key={prediction._id}
              >
                <PredictionCard prediction={prediction} />
              </motion.a>
            ))}
          </div>
        ) : (
          <p className="text-white">No active predictions</p>
        )}
      </div>
      <div className="mb-8">
        <h1 className="text-accent text-xl font-bold mb-4">
          Completed Predictions
        </h1>
        {completedPredictions.predictions &&
        completedPredictions.predictions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {completedPredictions.predictions.map((prediction) => (
              <motion.a
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                href={`/prediction/${prediction._id}`}
                title={prediction.question}
                key={prediction._id}
              >
                <PredictionCard prediction={prediction} />
              </motion.a>
            ))}
          </div>
        ) : (
          <p className="text-white">No completed predictions</p>
        )}
      </div>
    </div>
  );
};

export default HomeTemplate;
