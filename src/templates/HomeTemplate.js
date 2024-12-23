"use client";

import React, { useEffect, useState } from "react";
import PredictionCard from "@/components/PredictionCard";
import PredictionModal from "@/components/PredictionModal";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import {
  CREATION_FEE,
  PAYMENT_TOKEN_ADDRESS,
  PREDICTION_MARKET_ADDRESS,
} from "@/utils/environment";
import PredictionMarketABI from "@/lib/abi/PredictionMarket.json";
import ERC20ABI from "@/lib/abi/ERC20.json";
import { formatUnits, getContract, parseEther, parseUnits } from "viem";
import CreatePredictionModal from "@/components/CreatePredictionModal";

const HomeTemplate = () => {
  const publicClient = usePublicClient(); // Fetches the public provider
  const { data: walletClient } = useWalletClient(); // Fetches the connected wallet signer

  const { address, isConnected } = useAccount();
  const [predictions, setPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const readContract = getContract({
          address: PREDICTION_MARKET_ADDRESS,
          abi: PredictionMarketABI,
          client: publicClient,
        });
        const count = await readContract.read.getPredictionCount();

        const predictionsData = [];
        for (let i = 0; i < count; i++) {
          const prediction = await readContract.read.getPrediction([i]);
          predictionsData.push({
            id: i,
            ...prediction,
          });
        }
        console.log({ predictionsData });

        setPredictions(predictionsData);
      } catch (error) {
        console.log("Fetching predictions failed", error);
      }
    };

    fetchPredictions();
  }, []);

  const handlePredict = async (answerIndex, amount) => {
    try {
      const tokenReadContract = getContract({
        address: PAYMENT_TOKEN_ADDRESS,
        abi: ERC20ABI,
        client: publicClient,
      });
      const allowance = await tokenReadContract.read.allowance([
        address,
        PREDICTION_MARKET_ADDRESS,
      ]);

      // Format the allowance based on token decimals
      const formattedAllowance = parseFloat(formatUnits(allowance, 18));

      if (formattedAllowance < amount) {
        const writeTokenContract = getContract({
          address: PAYMENT_TOKEN_ADDRESS,
          abi: ERC20ABI,
          client: walletClient,
        });

        const approveHash = await writeTokenContract.write.approve([
          PREDICTION_MARKET_ADDRESS,
          parseUnits(amount.toString(), 18),
        ]);
        await publicClient.waitForTransactionReceipt({
          hash: approveHash,
        });
      }

      const writeContract = getContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PredictionMarketABI,
        client: walletClient,
      });
      await writeContract.write.predict(
        [selectedPrediction.id, answerIndex, parseEther(amount.toString())],
        {
          value: 0,
        }
      );
      setSelectedPrediction(null);
    } catch (error) {
      console.log("Predict failed", error);
    }
  };

  const handleCreatePrediction = async (
    question,
    answers,
    startTime,
    endTime
  ) => {
    try {
      const tokenReadContract = getContract({
        address: PAYMENT_TOKEN_ADDRESS,
        abi: ERC20ABI,
        client: publicClient,
      });
      const allowance = await tokenReadContract.read.allowance([
        address,
        PREDICTION_MARKET_ADDRESS,
      ]);

      // Format the allowance based on token decimals
      const formattedAllowance = parseFloat(formatUnits(allowance, 18));

      if (formattedAllowance < CREATION_FEE) {
        const writeTokenContract = getContract({
          address: PAYMENT_TOKEN_ADDRESS,
          abi: ERC20ABI,
          client: walletClient,
        });

        const approveHash = await writeTokenContract.write.approve([
          PREDICTION_MARKET_ADDRESS,
          parseUnits(CREATION_FEE.toString(), 18),
        ]);
        await publicClient.waitForTransactionReceipt({
          hash: approveHash,
        });
      }

      const writeContract = getContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PredictionMarketABI,
        client: walletClient,
      });
      await writeContract.write.createPrediction(
        [question, answers, startTime, endTime],
        {
          value: 0,
        }
      );
      setIsCreateModalOpen(false);
    } catch (error) {
      console.log("Predict failed", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Predictions</h1>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        onClick={() => setIsCreateModalOpen(true)}
      >
        Create Prediction
      </button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {predictions.map((prediction) => (
          <PredictionCard
            key={prediction.id}
            prediction={prediction}
            onClick={() => setSelectedPrediction(prediction)}
          />
        ))}
      </div>
      {selectedPrediction && (
        <PredictionModal
          prediction={selectedPrediction}
          onClose={() => setSelectedPrediction(null)}
          onSubmit={handlePredict}
        />
      )}
      {isCreateModalOpen && (
        <CreatePredictionModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePrediction}
        />
      )}
    </div>
  );
};

export default HomeTemplate;
