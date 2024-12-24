"use client";

import {
  CREATION_FEE,
  PAYMENT_TOKEN_ADDRESS,
  PREDICTION_MARKET_ADDRESS,
} from "@/utils/environment";
import React, { useState } from "react";
import { toast } from "react-toastify";
import PredictionMarketABI from "@/lib/abi/PredictionMarket.json";
import ERC20ABI from "@/lib/abi/ERC20.json";
import { formatUnits, getContract, parseUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { FaSpinner } from "react-icons/fa";

const CreatePredictionTemplate = () => {
  const publicClient = usePublicClient(); // Fetches the public provider
  const { data: walletClient } = useWalletClient(); // Fetches the connected wallet signer

  const { address, isConnected } = useAccount();

  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState(["", ""]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const addAnswer = () => {
    setAnswers([...answers, ""]);
  };

  const updateAnswer = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!question || !startTime || !endTime) {
      toast.info("Please fill out the form");
      return;
    }

    try {
      setIsCreating(true);
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
      const tx = await writeContract.write.createPrediction(
        [
          question,
          answers,
          BigInt(dayjs(startTime).unix()),
          BigInt(dayjs(endTime).unix()),
        ],
        {
          value: 0,
        }
      );
      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: txResponse,
      });
      if (transactionReceipt.status === "success") {
        toast.success("Create prediction successful");
      } else {
        toast.error("Create prediction failed, please try it again");
      }
    } catch (error) {
      console.log("Predict failed", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-accent text-xl font-bold mb-8">Create Prediction</h2>
      <p className="text-white mb-4">
        Create your own prediction and earn fee with the market. You would need
        to hold{" "}
        <a
          href="https://app.youngparrotnft.com/core/collections/youngparrot-member"
          target="_blank"
          className="text-accent underline"
        >
          YoungParrot Member NFT
        </a>{" "}
        in your wallet to be able to create prediction. Creation fee is{" "}
        {CREATION_FEE} YPC.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label className="text-primary-light block font-semibold mb-1">
            Question:
          </label>
          <input
            type="text"
            className="text-primary-light bg-gray-100 w-full p-2 border rounded"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="text-primary-light block font-semibold mb-1">
            Answers:
          </label>
          {answers.map((answer, index) => (
            <input
              key={index}
              type="text"
              className="text-primary-light bg-gray-100 w-full p-2 border rounded mb-2"
              value={answer}
              onChange={(e) => updateAnswer(index, e.target.value)}
            />
          ))}
          <button
            className="text-blue-500 text-sm underline"
            onClick={addAnswer}
          >
            Add Answer
          </button>
        </div>
        <div className="mb-4">
          <label className="text-primary-light block font-semibold mb-1">
            Start Time:
          </label>
          <input
            type="datetime-local"
            className="text-primary-light bg-gray-100 w-full p-2 border rounded"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="text-primary-light block font-semibold mb-1">
            End Time:
          </label>
          <input
            type="datetime-local"
            className="text-primary-light bg-gray-100 w-full p-2 border rounded"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-4">
          {isConnected ? (
            <button
              className="flex bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleSubmit}
            >
              Create
              {isCreating && (
                <FaSpinner className="ml-2 animate-spin text-white w-5 h-5" />
              )}
            </button>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePredictionTemplate;
