"use client";

import React, { useEffect, useState } from "react";
import PredictionCard from "@/components/PredictionCard";
import PredictionModal from "@/components/PredictionModal";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import {
  PAYMENT_TOKEN_ADDRESS,
  PREDICTION_MARKET_ADDRESS,
} from "@/utils/environment";
import PredictionMarketABI from "@/lib/abi/PredictionMarket.json";
import ERC20ABI from "@/lib/abi/ERC20.json";
import { formatUnits, getContract, parseEther, parseUnits } from "viem";
import CreatePredictionModal from "@/templates/CreatePredictionTemplate";
import { toast } from "react-toastify";

const HomeTemplate = () => {
  const publicClient = usePublicClient(); // Fetches the public provider
  const { data: walletClient } = useWalletClient(); // Fetches the connected wallet signer

  const { address, isConnected } = useAccount();
  const [predictions, setPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);

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

        setPredictions(predictionsData);
      } catch (error) {
        console.log("Fetching predictions failed", error);
      }
    };

    fetchPredictions();
  }, []);

  const handlePredict = async (answerIndex, amount) => {
    try {
      setIsPredicting(true);
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
      const tx = await writeContract.write.predict(
        [selectedPrediction.id, answerIndex, parseEther(amount.toString())],
        {
          value: 0,
        }
      );
      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });
      if (transactionReceipt.status === "success") {
        toast.success("Predict successful");
        setSelectedPrediction(null);
      } else {
        toast.error("Predict failed, please try again");
      }
    } catch (error) {
      console.log("Predict failed", error);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="container mx-auto w-full p-2 md:p-4">
      <h1 className="text-accent text-xl font-bold mb-8">Predictions</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          isLoading={isPredicting}
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
