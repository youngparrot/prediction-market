"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUserSecret } from "react-icons/fa";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

export default function ProfileTemplate() {
  const publicClient = usePublicClient(); // Fetches the public provider
  const { data: walletClient } = useWalletClient(); // Fetches the connected wallet signer

  const { address, isConnected } = useAccount();

  const { userAddress } = useParams();

  const [isFetching, setIsFetching] = useState(false);

  const activityData = [
    {
      market: "Will $CORE price exceed $3 in January 2025?",
      bet: "Yes",
      betValue: 0,
      poolTVL: 26,
    },
  ];

  const getUserPredictions = async (address) => {
    try {
    } catch (error) {
      conCOREe.log("Get user prediction failed", error);
    }
  };

  useEffect(() => {
    getUserPredictions(userAddress);
  }, []);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen px-6 py-8 rounded-md">
      <div className="mx-auto">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-gray-700 p-4 rounded-full">
            <FaUserSecret size={40} />
          </div>
          <div>
            <h1 className="text-primary text-2xl font-bold">@Degen</h1>
            <p className="text-gray-400">{`${userAddress.slice(
              0,
              6
            )}...${userAddress.slice(-4)}`}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between bg-gray-800 p-4 rounded-lg mb-8">
          <div>
            <p className="text-gray-400">Rank #</p>
            <p className="text-xl font-bold">N/A</p>
          </div>
          <div>
            <p className="text-gray-400">Profit/Loss</p>
            <p className="text-xl font-bold text-green-500">
              N/A $CORE (+XX.XX%)
            </p>
          </div>
          <div>
            <p className="text-gray-400">Total Volume</p>
            <p className="text-xl font-bold">N/A $CORE</p>
          </div>
        </div>

        {/* Predicted Section */}
        <h2 className="text-primary text-xl font-bold mb-4">Predicted</h2>
        <div className="space-y-4">
          {activityData.map((activity, index) => (
            <ActivityCard key={index} {...activity} />
          ))}
        </div>

        {/* WatchListed Section */}
        <h2 className="text-primary text-xl font-bold mb-4 mt-8">
          WatchListed
        </h2>
        <div className="space-y-4">
          {activityData.map((activity, index) => (
            <ActivityCard key={index} {...activity} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Activity Card Component
function ActivityCard({ market, bet, betValue, optionTVL, poolTVL }) {
  return (
    <div className="flex justify-between items-center bg-gray-800 p-4 rounded-md">
      <div>
        <p className="font-bold">{market}</p>
      </div>
      <div className="flex gap-6">
        <div>
          <p className="text-gray-400 text-sm">Your (CORE)</p>
          <p className="font-bold">{betValue}</p>
        </div>
      </div>
      <div className="flex gap-6">
        <div>
          <p className="text-gray-400 text-sm">Total TVL (CORE)</p>
          <p className="font-bold">{poolTVL}</p>
        </div>
      </div>
      <a
        href="/prediction/677c3868376b7eaf45722730"
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-bold"
      >
        View
      </a>
    </div>
  );
}
