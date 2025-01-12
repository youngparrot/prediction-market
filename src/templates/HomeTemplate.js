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
import StatusFilter from "@/components/StatusFilter";

const HomeTemplate = () => {
  const [status, setStatus] = useState("");

  return (
    <div className="container mx-auto w-full p-2 md:p-4">
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          <h1 className="text-accent text-xl font-bold">All Predictions</h1>
          <StatusFilter onFilterChange={(status) => setStatus(status)} />
        </div>

        <Predictions status={status} />
      </div>
    </div>
  );
};

export default HomeTemplate;

const Predictions = ({ status }) => {
  const publicClient = usePublicClient(); // Fetches the public provider
  const { data: walletClient } = useWalletClient(); // Fetches the connected wallet signer

  const { address, isConnected } = useAccount();
  const [isFetching, setIsFetching] = useState(false);
  const [predictions, setPredictions] = useState([]);

  const getPredictions = async () => {
    try {
      setIsFetching(true);
      const predictionsData = await fetchPredictions({ status });
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

      setPredictions(predictionsData);
    } catch (error) {
      console.log("Fetching active predictions failed", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    getPredictions();
    // getCompletedPredictions();
  }, [status]);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {predictions.predictions && predictions.predictions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predictions.predictions.map((prediction) => (
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
        <p className="text-white">No predictions</p>
      )}
    </div>
  );
};
