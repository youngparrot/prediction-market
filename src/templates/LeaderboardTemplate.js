"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { fetchLeaderboard } from "@/utils/api";
import { formatTokenAddress } from "@/utils/format";
import { useEffect, useState } from "react";
import { FaRegCopy } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import { CORE_SCAN_URL } from "@/utils/environment";
import StatsSection from "@/components/StatsSection";

export default function LeaderboardTemplate() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchLeaderboard(isConnected ? address : null);
        setLeaderboard(response);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [isConnected]);

  const handleCopy = (address) => {
    navigator.clipboard.writeText(address);
    toast.info("Copied");
  };

  return (
    <div className="overflow-x-auto">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div>
          <h1
            className="pb-8 text-accent text-xl font-bold"
            style={{
              paddingBottom: "24px",
            }}
          >
            Leaderboard
          </h1>
          <div className="p-2 md:p-6 bg-white min-h-screen rounded-md">
            <StatsSection
              totalVolume={leaderboard?.totalVolume}
              totalUsers={leaderboard?.totalUser}
            />
            <p className="py-2 px-2 md:px-4 text-white bg-gray-700">
              This feature aims to gamify the trading experience by displaying
              real-time rankings of 100 top traders based on their trade volume.
              The leaderboard will incentivize competition by offering rewards
              like exclusive NFTs, token bonuses, or access to premium features.
            </p>
            <table className="w-full table-auto mt-8 bg-gray-700">
              <thead
                className="text-white"
                style={{
                  borderBottom: "2px solid white",
                }}
              >
                <tr>
                  <th className="px-2 py-2 text-left">Rank</th>
                  <th className="px-2 py-2">User Address</th>
                  <th className="px-2 py-2 text-right">Total Volume</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {leaderboard?.leaderboard?.length === 0 ? (
                  <tr className="border-b border-gray-300">
                    <td colSpan="3" className="h-4 py-4 text-center">
                      No users
                    </td>
                  </tr>
                ) : (
                  <>
                    {leaderboard?.leaderboard?.map((entry, index) => (
                      <tr
                        key={entry._id}
                        style={{
                          backgroundColor:
                            index % 2 === 0
                              ? entry._id.toLowerCase() ===
                                address?.toLowerCase()
                                ? "purple"
                                : "#5d5d5d"
                              : entry._id.toLowerCase() ===
                                address?.toLowerCase()
                              ? "purple"
                              : "",
                        }}
                      >
                        <td className="px-2 py-2">{index + 1}</td>
                        <td className="px-2 py-2 flex items-center justify-center">
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            href={`/profile/${entry._id}`}
                            title={entry._id}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {formatTokenAddress(entry._id)}
                          </motion.a>{" "}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            onClick={() => handleCopy(entry._id)}
                            className={`text-blue-500 ml-2`}
                            title="Copy Address"
                          >
                            <FaRegCopy color="white" />
                          </motion.button>
                        </td>
                        <td className="px-2 py-2 text-right">
                          {entry.totalVolume.toLocaleString()} CORE
                        </td>
                      </tr>
                    ))}
                    {leaderboard?.user_address && leaderboard.rank > 100 && (
                      <>
                        <tr className="border-b border-gray-300">
                          <td colSpan="3" className="h-4 py-4 text-center">
                            ...
                          </td>
                        </tr>
                        <tr className="border-b border-gray-300 bg-purple-500">
                          <td className="px-2 py-2">{leaderboard.rank}</td>
                          <td className="px-2 py-2 flex items-center justify-center">
                            <motion.a
                              whileHover={{ scale: 1.05 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              href={`/profile/${leaderboard.user_address}`}
                              title={leaderboard.user_address}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {formatTokenAddress(leaderboard.user_address)}
                            </motion.a>{" "}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              onClick={() =>
                                handleCopy(leaderboard.user_address)
                              }
                              className={`text-blue-500 ml-2`}
                              title="Copy Address"
                            >
                              <FaRegCopy color="white" />
                            </motion.button>
                          </td>
                          <td className="px-2 py-2 text-right">
                            {leaderboard.totalUserVolume.toLocaleString()} CORE
                          </td>
                        </tr>
                      </>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
