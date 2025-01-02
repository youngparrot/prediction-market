"use client";

import {
  CREATION_FEE,
  CREATION_SHARE_FEE_PERCENT,
  PREDICTION_MARKET_ADDRESS,
} from "@/utils/environment";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import PredictionMarketABI from "@/lib/abi/PredictionMarket.json";
import { getContract, parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import dayjs from "dayjs";
import { FaSpinner } from "react-icons/fa";
import { createPrediction, updatePrediction } from "@/utils/api";
import { useRouter } from "next/navigation";
import { RequiredField, RequiredLabel } from "@/components/RequiredLabel";

const CreatePredictionTemplate = () => {
  const publicClient = usePublicClient(); // Fetches the public provider
  const { data: walletClient } = useWalletClient(); // Fetches the connected wallet signer
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      question: "",
      answers: ["", ""],
      predictionCutoffDate: "",
      endTime: "",
      rules: "",
    },
  });

  const [answers, setAnswers] = useState(["", ""]);
  const [answersError, setAnswersError] = useState(""); // Error message for answers

  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const addAnswer = () => {
    setAnswers([...answers, ""]);
  };

  const removeAnswer = (index) => {
    const updatedAnswers = answers.filter((_, i) => i !== index);
    setAnswers(updatedAnswers);
  };

  const validateAnswers = () => {
    if (answers.some((answer) => answer.trim() === "")) {
      setAnswersError("All answers must be non-empty.");
      return false;
    }
    setAnswersError(""); // Clear error if valid
    return true;
  };

  const onSubmit = async (data) => {
    if (!validateAnswers()) {
      return; // Prevent submission if answers are invalid
    }

    const { question, predictionCutoffDate, endTime, rules } = data;

    if (dayjs(predictionCutoffDate) > dayjs(endTime)) {
      toast.info("Cutoff Time should not be after the End Time");
      return;
    }

    try {
      const predictionRes = await createPrediction(
        question,
        answers,
        predictionCutoffDate,
        endTime,
        address,
        rules
      );
      const metadataId = String(predictionRes.prediction._id);

      const writeContract = getContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PredictionMarketABI,
        client: walletClient,
      });

      const tx = await writeContract.write.createPrediction(
        [metadataId, answers.length, BigInt(dayjs(endTime).unix())],
        {
          value: parseEther(CREATION_FEE),
        }
      );

      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      if (transactionReceipt.status === "success") {
        if (window.dataLayer) {
          window.dataLayer.push({
            event: "create-success",
            userAddress: `address_${address}`,
            predictionId: metadataId,
            transaction_id: `id_${transactionReceipt.transactionHash}`,
          });
        }
        try {
          await updatePrediction(metadataId, "active");
        } catch (error) {
          console.log("Update prediction failed ", error);
        }

        toast.success("Create prediction successful");

        // Delay the redirect by 3 seconds
        setTimeout(() => {
          router.push(`/prediction/${metadataId}`);
        }, 3000);
      } else {
        if (window.dataLayer) {
          window.dataLayer.push({
            event: "create-failed-try-again",
            userAddress: `address_${address}`,
            predictionId: metadataId,
            transaction_id: `id_${transactionReceipt.transactionHash}`,
          });
        }
        toast.error("Create prediction failed, please try again");
      }
    } catch (error) {
      console.error("Prediction creation failed", error);
      if (error.message.startsWith("User rejected the request")) {
        toast.error("You rejected the request");
      } else {
        toast.error("An error occurred while creating the prediction");
        if (window.dataLayer) {
          window.dataLayer.push({
            event: "create-failed",
            userAddress: `address_${address}`,
          });
        }
      }
    }
  };

  return (
    <div className="p-2 md:p-6">
      <h2 className="text-accent text-xl font-bold mb-4">Create Prediction</h2>
      <p className="text-white mb-4">
        Create your own prediction and earn fees with the prediction market
        platform. Creation fee is {CREATION_FEE} CORE. Creator would earn{" "}
        {CREATION_SHARE_FEE_PERCENT}% of our platform fee for your own
        prediction.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="text-primary-light block font-semibold mb-1">
              Question:
              <RequiredField />
            </label>
            <input
              {...register("question", {
                required: "Question is required",
                maxLength: {
                  value: 100,
                  message: "Max 100 characters allowed",
                },
              })}
              type="text"
              placeholder="Enter your question (max 100 characters)"
              className={`text-primary-light bg-gray-100 w-full p-2 border rounded ${
                errors.question ? "border-red-500" : ""
              }`}
            />
            {errors.question && (
              <p className="text-red-500 text-sm">{errors.question.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="text-primary-light block font-semibold mb-1">
              Outcomes:
              <RequiredField />
            </label>
            {answers.map((answer, index) => (
              <div key={index} className="flex gap-4 mb-2">
                <input
                  type="text"
                  value={answer}
                  maxLength={100}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={`Outcome ${index + 1} (max 100 characters)`}
                  className="text-primary-light bg-gray-100 w-full p-2 border rounded"
                />
                {answers.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => removeAnswer(index)}
                    className="text-blue-500 underline"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))}
            {answersError && <p style={{ color: "red" }}>{answersError}</p>}
            {answers.length <= 1 && (
              <p style={{ color: "red" }}>At least two outcomes is required</p>
            )}
            <button
              type="button"
              onClick={addAnswer} // Add a new empty string to the answers array
              className="text-blue-500 underline"
            >
              Add Outcome
            </button>
          </div>
          <div className="mb-4">
            <label className="text-primary-light block font-semibold mb-1">
              Cutoff Time (UTC):
              <RequiredField />
            </label>
            <input
              {...register("predictionCutoffDate", {
                required: "Cutoff Time is required",
              })}
              type="datetime-local"
              className={`text-gray-400 bg-gray-100 w-full p-2 border rounded ${
                errors.predictionCutoffDate ? "border-red-500" : ""
              }`}
            />
            {errors.predictionCutoffDate && (
              <p className="text-red-500 text-sm">
                {errors.predictionCutoffDate.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="text-primary-light block font-semibold mb-1">
              End Time (UTC):
              <RequiredField />
            </label>
            <input
              {...register("endTime", { required: "End Time is required" })}
              type="datetime-local"
              className={`text-gray-400 bg-gray-100 w-full p-2 border rounded ${
                errors.endTime ? "border-red-500" : ""
              }`}
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm">{errors.endTime.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="text-primary-light block font-semibold mb-1">
              Rules:
              <RequiredField />
            </label>
            <textarea
              {...register("rules", {
                required: "Rules are required",
                maxLength: {
                  value: 400,
                  message: "Max 400 characters allowed",
                },
              })}
              rows="4"
              className={`text-primary-light bg-gray-100 w-full p-2 border rounded ${
                errors.rules ? "border-red-500" : ""
              }`}
              placeholder="Enter your rules (max 400 characters)"
            ></textarea>
            {errors.rules && (
              <p className="text-red-500 text-sm">{errors.rules.message}</p>
            )}
          </div>
          <div className="flex justify-end space-x-4">
            {isConnected ? (
              <button
                id="create-button"
                type="submit"
                className="flex bg-blue-500 text-white px-4 py-2 rounded"
                disabled={isSubmitting}
              >
                Create
                {isSubmitting && (
                  <FaSpinner className="ml-2 animate-spin text-white w-5 h-5" />
                )}
              </button>
            ) : (
              <ConnectButton />
            )}
          </div>
          <div className="flex items-center gap-2">
            <RequiredField />
            <RequiredLabel />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePredictionTemplate;
