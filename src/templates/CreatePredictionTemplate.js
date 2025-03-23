"use client";

import {
  DEFAULT_CHAIN_ID,
  NATIVE_TOKEN_ADDRESS,
  environments,
} from "@/utils/environment";
import React, { useEffect, useState } from "react";
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
import { generateUUID } from "@/utils/uuid";

const categories = [
  { label: "Politics", path: "politics" },
  { label: "Sports", path: "sports" },
  { label: "Crypto", path: "crypto" },
  { label: "Global Elections", path: "global-elections" },
  { label: "Elon Tweets", path: "elon-tweets" },
  { label: "Global Events", path: "global-events" },
  { label: "Pop Culture", path: "pop-culture" },
  { label: "Business", path: "business" },
];

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
      twitter: "",
    },
  });

  const [answers, setAnswers] = useState([
    { id: generateUUID(), text: "" },
    { id: generateUUID(), text: "" },
  ]);
  const [answersError, setAnswersError] = useState(""); // Error message for answers

  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);

  useEffect(() => {
    if (!walletClient) {
      return;
    }

    const fetchChainId = async () => {
      const id = await walletClient.getChainId(); // Fetch the connected chain ID
      setChainId(id);
    };

    fetchChainId();
  }, [walletClient]);

  const handleAnswerChange = (id, newValue) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.id === id ? { ...answer, text: newValue } : answer
      )
    );
  };

  const addAnswer = () => {
    setAnswers((prev) => [
      ...prev,
      { id: generateUUID(), text: "" }, // Add a new answer with a unique ID
    ]);
  };

  const removeAnswer = (id) => {
    setAnswers((prev) => prev.filter((answer) => answer.id !== id));
  };

  const validateAnswers = () => {
    if (answers.some((answer) => answer.text.trim() === "")) {
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

    const {
      question,
      predictionCutoffDate,
      endTime,
      rules,
      twitter,
      category,
      paymentToken,
    } = data;

    if (predictionCutoffDate && dayjs(predictionCutoffDate) > dayjs(endTime)) {
      toast.info("Cutoff Time should not be after the End Time");
      return;
    }

    try {
      const predictionRes = await createPrediction(
        question,
        answers.map((answer) => answer.text),
        predictionCutoffDate,
        endTime,
        address,
        rules,
        twitter,
        category,
        chainId,
        paymentToken
      );
      const metadataId = String(predictionRes.prediction._id);

      const writeContract = getContract({
        address:
          environments[chainId]["PREDICTION_MARKET_ADDRESS"][
            predictionRes.prediction.paymentToken
          ].contract,
        abi:
          environments[chainId]["PREDICTION_MARKET_ADDRESS"][
            predictionRes.prediction.paymentToken
          ].tokenAddress === NATIVE_TOKEN_ADDRESS
            ? PredictionMarketABI
            : PredictionMarketTokenPaymentABI,
        client: walletClient,
      });

      const tx = await writeContract.write.createPrediction(
        [metadataId, answers.length, BigInt(dayjs(endTime).unix())],
        {
          value: parseEther(environments[chainId]["CREATION_FEE"]),
        }
      );

      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
        timeout: 180_000,
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
    <div>
      <h2 className="text-accent text-xl font-bold mb-4">Create Prediction</h2>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="py-2 px-2 md:px-4 text-white bg-gray-800 mb-6">
          Create your own prediction and earn fees with the prediction market
          platform. Creation fee is {environments[chainId]["CREATION_FEE"]}{" "}
          {environments[chainId]["NATIVE_TOKEN_SYMBOL"]}. Creator would earn{" "}
          {environments[chainId]["CREATION_SHARE_FEE_PERCENT"]}% of our platform
          fee for your own prediction. Our platform fee is{" "}
          {environments[chainId]["PLATFORM_FEE_PERCENT"]}%.
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Category Selection */}
          <div className="mb-4">
            <label htmlFor="category" className="block font-bold text-gray-700">
              Select Category:
              <RequiredField />
            </label>
            <select
              id="category"
              {...register("category", { required: "Category is required" })}
              className={`text-primary-light bg-gray-100 w-full p-2 border rounded ${
                errors.category ? "border-red-500" : ""
              }`}
            >
              <option value="">-- Choose a category --</option>
              {categories.map((category) => (
                <option key={category.path} value={category.path}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">
                {errors.category.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="text-gray-700 font-bold block mb-1">
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
            <label className="text-gray-700 font-bold block mb-1">
              Outcomes:
              <RequiredField />
            </label>
            {answers.map((answer, index) => (
              <div key={answer.id} className="flex gap-4 mb-2">
                <input
                  type="text"
                  value={answer.text}
                  maxLength={100}
                  onChange={(e) =>
                    handleAnswerChange(answer.id, e.target.value)
                  }
                  placeholder={`Outcome ${index + 1} (max 100 characters)`}
                  className="text-primary-light bg-gray-100 w-full p-2 border rounded"
                />
                {answers.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => removeAnswer(answer.id)}
                    className="text-blue-500 underline"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))}
            {answersError && <p style={{ color: "red" }}>{answersError}</p>}

            {answers.length <= 1 && (
              <p style={{ color: "red" }}>At least two outcomes are required</p>
            )}

            <button
              type="button"
              onClick={addAnswer}
              className="text-primary font-bold underline"
            >
              Add Outcome
            </button>
          </div>
          <div className="mb-4">
            <label className="text-gray-700 font-bold block mb-1">
              Cutoff Time (UTC):
              {/* <RequiredField /> */}
            </label>
            <input
              {...register("predictionCutoffDate", {
                // required: "Cutoff Time is required",
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
            <label className="text-gray-700 font-bold block mb-1">
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
            <label className="text-gray-700 font-bold block mb-1">
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
          {/* Payment Token Selection */}
          <div className="mb-4">
            <label
              htmlFor="paymentToken"
              className="block font-bold text-gray-700"
            >
              Select Payment Token:
              <RequiredField />
            </label>
            <select
              id="paymentToken"
              {...register("paymentToken", {
                required: "Payment token is required",
              })}
              className={`text-primary-light bg-gray-100 w-full p-2 border rounded ${
                errors.paymentToken ? "border-red-500" : ""
              }`}
            >
              <option value="">-- Choose a payment token --</option>
              {Object.keys(
                environments[chainId]["PREDICTION_MARKET_ADDRESS"]
              ).map((paymentToken) => (
                <option
                  key={paymentToken.tokenAddress}
                  value={paymentToken}
                  className="flex gap-1"
                >
                  {paymentToken}
                </option>
              ))}
            </select>
            {errors.paymentToken && (
              <p className="mt-1 text-sm text-red-500">
                {errors.paymentToken.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="text-gray-700 font-bold block mb-1">
              Twitter/X:
              <RequiredField />
            </label>
            <input
              {...register("twitter", {
                required: "Twitter/X is required",
                maxLength: {
                  value: 100,
                  message: "Max 100 characters allowed",
                },
              })}
              type="text"
              placeholder="Enter your Twitter/X (max 100 characters)"
              className={`text-primary-light bg-gray-100 w-full p-2 border rounded ${
                errors.twitter ? "border-red-500" : ""
              }`}
            />
            {errors.twitter && (
              <p className="text-red-500 text-sm">{errors.twitter.message}</p>
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
