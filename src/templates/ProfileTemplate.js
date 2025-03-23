"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import ProfileTabs from "@/components/ProfileTabs";
import { fetchLeaderboard, fetchUser, fetchUserPredictions } from "@/utils/api";
import { DEFAULT_CHAIN_ID, environments } from "@/utils/environment";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GiPlagueDoctorProfile } from "react-icons/gi";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

export default function ProfileTemplate() {
  const publicClient = usePublicClient(); // Fetches the public provider
  const { data: walletClient } = useWalletClient(); // Fetches the connected wallet signer

  const { address, isConnected } = useAccount();

  const { userAddress } = useParams();

  const [isFetching, setIsFetching] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [user, setUser] = useState();

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

  const fetchData = async () => {
    try {
      setIsFetching(true);
      const response = await fetchLeaderboard(userAddress, chainId);
      setLeaderboard(response);

      const user = await fetchUser(userAddress);
      setUser(user);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen px-2 md:px-6 py-8 rounded-md">
      <div className="mx-auto">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-gray-700 p-4 rounded-full">
            <GiPlagueDoctorProfile size={40} />
          </div>
          <div>
            <h1 className="text-primary text-2xl font-bold">{`${userAddress.slice(
              0,
              6
            )}...${userAddress.slice(-4)}`}</h1>
            <p className="text-gray-500">
              {user?.data.createdAt
                ? `Created At ${new Date(
                    user?.data.createdAt
                  ).toLocaleString()}`
                : null}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between bg-gray-800 p-4 rounded-lg mb-8">
          <div>
            <p className="text-gray-400">Rank #</p>
            <p className="text-xl font-bold">{leaderboard.rank}</p>
          </div>
          <div>
            <p className="text-gray-400">Total Point</p>
            <p className="text-xl font-bold text-right">
              {leaderboard.totalUserPoints}
            </p>
          </div>
          {/* <div>
            <p className="text-gray-400">Profit/Loss</p>
            <p className="text-xl font-bold text-green-500">
              N/A $CORE (+XX.XX%)
            </p>
          </div> */}
        </div>

        <ProfileTabs userAddress={userAddress} />
        {/* Predicted Section */}
        {/* <h2 className="text-primary text-xl font-bold mb-4">Predicted</h2>
        <div className="space-y-4">
          {userPredictions
            ? userPredictions.map((prediction) => (
                <ActivityCard
                  key={prediction.predictionId}
                  prediction={prediction}
                />
              ))
            : null}
        </div> */}

        {/* WatchListed Section */}
        {/* <h2 className="text-primary text-xl font-bold mb-4 mt-8">
          Your WatchListed
        </h2>
        <div className="space-y-4">
          {activityData.map((activity, index) => (
            <ActivityCard key={index} {...activity} />
          ))}
        </div> */}
      </div>
    </div>
  );
}
