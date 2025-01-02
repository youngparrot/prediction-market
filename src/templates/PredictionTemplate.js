"use client";

import React, { useEffect, useState } from "react";
import PredictionModal from "@/components/PredictionModal";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { PREDICTION_MARKET_ADDRESS } from "@/utils/environment";
import PredictionMarketABI from "@/lib/abi/PredictionMarket.json";
import { formatEther, getContract, parseEther } from "viem";
import { toast } from "react-toastify";
import { createTransaction, fetchPredictions } from "@/utils/api";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";
import { FaCheck, FaSpinner } from "react-icons/fa";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Giscus from "@giscus/react";
import dayjs from "dayjs";

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
  const [userStaked, setUserStaked] = useState();
  const [isClaiming, setIsClaiming] = useState(false);
  const [predictionContract, setPredictionContract] = useState();
  const isDone = prediction?.prediction?.endDate
    ? new Date(prediction.prediction.endDate).getTime() <= Date.now()
    : false;

  const { id } = useParams();

  const [isPredictionAllowed, setIsPredictionAllowed] = useState(true);

  useEffect(() => {
    if (!prediction?.prediction.predictionCutoffDate) {
      return;
    }

    const now = dayjs();

    setIsPredictionAllowed(
      now.isBefore(prediction?.prediction.predictionCutoffDate)
    );
  }, [prediction?.prediction.predictionCutoffDate]);

  const getPrediction = async () => {
    try {
      setIsFetching(true);
      const predictionData = await fetchPredictions({ id });
      setPrediction(predictionData);
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
      console.log("Fetching predictions contract failed", error);
    }
  };

  const fetchHasClaimed = async () => {
    try {
      const readContract = getContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PredictionMarketABI,
        client: publicClient,
      });
      const hasClaimed = await readContract.read.hasUserClaimed([
        prediction.prediction._id,
        address,
      ]);
      setHasClaimed(hasClaimed);
    } catch (error) {
      console.log("Fetching has claimed contract failed", error);
    }
  };

  useEffect(() => {
    getPrediction();
  }, []);

  const fetchUserContract = async () => {
    try {
      const readContract = getContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PredictionMarketABI,
        client: publicClient,
      });

      const hasClaimed = await readContract.read.hasUserClaimed([
        prediction.prediction._id,
        address,
      ]);
      setHasClaimed(hasClaimed);

      const claimAmount = await readContract.read.getRewardToClaim([
        prediction.prediction._id,
        address,
      ]);
      setClaimAmount(claimAmount.toString());

      const userStaked = await readContract.read.getUserStakesForPrediction([
        prediction.prediction._id,
        address,
      ]);
      setUserStaked(userStaked);
    } catch (error) {
      console.log("Fetching user contract failed", error);
    }
  };

  useEffect(() => {
    if (!address || !prediction) {
      return;
    }

    fetchUserContract();
  }, [address, prediction]);

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

    if (!isPredictionAllowed) {
      toast.info("Predictions are not accepted after Prediction Cutoff Time");
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
        [prediction.prediction._id, answerIndex],
        {
          value: parseEther(amount.toString()),
        }
      );
      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      if (transactionReceipt.status === "success") {
        toast.success("Predict successful");

        try {
          await createTransaction(
            prediction.prediction._id,
            answerIndex,
            address,
            parseInt(amount)
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

  if (isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto w-full text-primary-light">
      {prediction && prediction.prediction ? (
        <>
          <div className="bg-white mb-8 p-2 md:p-4 rounded-md">
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
            <div className="flex flex-col md:flex-row gap-2 md:gap-8 mb-2 text-gray-600">
              <p>
                Asked By:{" "}
                {`${prediction.prediction.createdBy.slice(
                  0,
                  6
                )}...${prediction.prediction.createdBy.slice(-4)}`}
              </p>
              <p>
                Prediction Cutoff At:{" "}
                {new Date(
                  prediction.prediction.predictionCutoffDate
                ).toLocaleString()}
              </p>
              <p>
                Ended At:{" "}
                {new Date(prediction.prediction.endDate).toLocaleString()}
              </p>
            </div>
            <div className="mb-2">
              <p className="text-secondary font-bold">
                Total:{" "}
                {predictionContract
                  ? formatEther(predictionContract[0].totalStaked)
                  : 0}{" "}
                $CORE
              </p>
            </div>
            <div className="text-primary font-bold mb-2">Outcomes:</div>
            <div className="flex flex-col">
              {prediction.prediction.answers.map((answer, index) => (
                <div
                  key={index}
                  className={`flex flex-row items-center gap-4 w-full text-left text-primary-light rounded mb-2`}
                >
                  <div className="flex flex-col md:flex-row">
                    <div>
                      <span className="text-gray-500 font-bold mr-2">
                        {index + 1}.
                      </span>
                      {answer}{" "}
                    </div>
                    <div className="flex gap-4 ml-4">
                      <span className="text-gray-500 font-bold">
                        Total:{" "}
                        {predictionContract
                          ? formatEther(predictionContract[0].stakes[index])
                          : null}{" "}
                        $CORE
                      </span>
                      <span className="text-gray-500">
                        Your:{" "}
                        {userStaked ? formatEther(userStaked[index]) : null}{" "}
                        $CORE
                      </span>
                    </div>
                  </div>
                  {isDone && predictionContract ? (
                    parseInt(predictionContract[0].winningAnswerIndex) ==
                    index ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      ""
                    )
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-2">
              <h1 className="text-gray-600 font-bold mb-2">Rules:</h1>
              <p
                dangerouslySetInnerHTML={{
                  __html: prediction.prediction.rules,
                }}
                className="text-gray-600"
              ></p>
            </div>
            <div className="mt-4">
              {isConnected ? (
                <>
                  {isDone ? (
                    <div className="mb-2">
                      <p>
                        Your rewards: {formatEther(claimAmount.toString())}{" "}
                        $CORE
                      </p>
                    </div>
                  ) : null}
                  <div className="flex gap-4">
                    <button
                      id="predict-button"
                      onClick={handlePredictButtonClick}
                      className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
                    >
                      Predict
                    </button>
                    {isDone ? (
                      <button
                        id="claim-rewards"
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
                </>
              ) : (
                <ConnectButton />
              )}
            </div>
          </div>
          <div className="bg-white p-2 md:p-4 rounded-md">
            <Giscus
              repo="youngparrot/prediction-market"
              repoId="R_kgDONg2FQw"
              category="General"
              categoryId="DIC_kwDONg2FQ84Cll6f"
              mapping={`/prediction/${id}`}
              reactionsEnabled="1"
              emitMetadata="0"
              inputPosition="bottom"
              theme="light"
              lang="en"
            />
          </div>
        </>
      ) : (
        <div className="text-white">Prediction is not found</div>
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
