"use client";

import React, { useEffect, useState } from "react";
import PredictionCard from "@/components/PredictionCard";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import {
  DEFAULT_CHAIN_ID,
  NATIVE_TOKEN_ADDRESS,
  environments,
} from "@/utils/environment";
import PredictionMarketABI from "@/lib/abi/PredictionMarket.json";
import PredictionMarketTokenPaymentABI from "@/lib/abi/PredictionMarketTokenPayment.json";
import { getContract } from "viem";
import { fetchPredictions, fetchWatchlist } from "@/utils/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion } from "framer-motion";
import StatusFilter from "@/components/StatusFilter";
import Categories from "@/components/Categories";
import { useRouter, useSearchParams } from "next/navigation";

const HomeTemplate = () => {
  const [status, setStatus] = useState("");

  return (
    <div>
      <div className="mb-8">
        <Categories categoryPath="all" />
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

const PAGE_SIZE = 20;

const Predictions = ({ status }) => {
  const publicClient = usePublicClient(); // Fetches the public provider
  const { data: walletClient } = useWalletClient(); // Fetches the connected wallet signer

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");

  const { address, isConnected } = useAccount();
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingWatchlists, setIsFetchingWatchlists] = useState(false);

  const [total, setTotal] = useState(0);
  const [predictions, setPredictions] = useState([]);
  const [watchlists, setWatchlists] = useState(null);

  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);
  useEffect(() => {
    const fetchChainId = async () => {
      if (walletClient) {
        const id = await walletClient.getChainId(); // Fetch the connected chain ID
        setChainId(id);
      }
    };

    fetchChainId();
  }, [walletClient]);

  const getPredictions = async () => {
    try {
      setIsFetching(true);
      const predictionsData = await fetchPredictions({
        status,
        chainId,
        page: currentPage,
        limit: PAGE_SIZE,
      });
      const metadataIds = predictionsData.predictions.map(
        (prediction) => prediction._id
      );

      for (let i = 0; i < predictionsData.predictions.length; i++) {
        const readContract = getContract({
          address:
            environments[chainId]["PREDICTION_MARKET_ADDRESS"][
              predictionsData.predictions[i].paymentToken
            ].contract,
          abi:
            environments[chainId]["PREDICTION_MARKET_ADDRESS"][
              predictionsData.predictions[i].paymentToken
            ].tokenAddress === NATIVE_TOKEN_ADDRESS
              ? PredictionMarketABI
              : PredictionMarketTokenPaymentABI,
          client: publicClient,
        });
        const predictionContractData =
          await readContract.read.getPredictionsByIds([metadataIds]);

        predictionsData.predictions[i].total =
          predictionContractData[i].totalStaked;
        predictionsData.predictions[i].winningAnswerIndex =
          predictionContractData[i].winningAnswerIndex;
        predictionsData.predictions[i].ended = predictionContractData[i].ended;

        if (watchlists && watchlists[predictionsData.predictions[i]._id]) {
          predictionsData.predictions[i].isInWatchlist = true;
        } else {
          predictionsData.predictions[i].isInWatchlist = false;
        }
      }

      setPredictions(predictionsData);
      setTotal(predictionsData.total);
    } catch (error) {
      console.log("Fetching active predictions failed", error);
    } finally {
      setIsFetching(false);
    }
  };

  const getWatchlists = async () => {
    try {
      setIsFetchingWatchlists(true);
      const response = await fetchWatchlist(address, chainId);
      const watchlistMap = {};
      for (let i = 0; i < response.watchlist.length; i++) {
        watchlistMap[response.watchlist[i]._id] = true;
      }
      setWatchlists(watchlistMap);
    } catch (error) {
      console.log("Fetch watchlists failed", error);
    } finally {
      setIsFetchingWatchlists(false);
    }
  };

  useEffect(() => {
    if (!address || !chainId) {
      return;
    }

    getWatchlists();
  }, [address, chainId]);

  useEffect(() => {
    if (!chainId || !watchlists) {
      return;
    }

    getPredictions();
  }, [status, watchlists, chainId, currentPage]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handlePageChange = (page) => {
    const query = new URLSearchParams(searchParams);
    query.set("page", page);
    router.push(`?${query.toString()}`);
  };

  if (isFetching || isFetchingWatchlists) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {predictions.predictions && predictions.predictions.length > 0 ? (
        <>
          <div className="flex justify-end mb-4 text-white">
            <span>Total: {predictions.total}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        </>
      ) : (
        <p className="text-white">No predictions</p>
      )}

      {/* Pagination */}
      <div className="flex flex-wrap justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          return (
            <button
              key={i}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 border rounded ${
                page === currentPage
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>
    </div>
  );
};
