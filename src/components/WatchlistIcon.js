"use client";

import { useEffect, useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import { addToWatchlist, unWatchlist } from "@/utils/api";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";

export default function WatchlistIcon({ prediction }) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();

  const handleWatchlistClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!prediction._id) {
      toast.info("prediction ID is required!");
      return;
    }

    const predictionId = prediction._id;

    try {
      setLoading(true);
      if (isInWatchlist) {
        await unWatchlist(address, predictionId);
        setIsInWatchlist(false); // Update the icon state
        toast.success("Watchlist is removed");
      } else {
        await addToWatchlist(address, predictionId);
        setIsInWatchlist(true); // Update the icon state
        toast.success("Watchlist is added");
      }
    } catch (error) {
      console.log(
        "Error adding to watchlist:",
        error.response?.data || error.message
      );
      if (error.status === 409) {
        toast.info("You already watchlisted");
        setIsInWatchlist(true); // Update the icon state
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!prediction) {
      return;
    }

    setIsInWatchlist(prediction.isInWatchlist);
  }, [prediction]);

  return (
    <button
      className={`cursor-pointer flex items-center justify-center w-6 h-6 rounded-full ${
        isInWatchlist ? "bg-yellow-400 text-white" : "bg-gray-200 text-gray-600"
      } ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-300"}`}
      onClick={handleWatchlistClick}
      disabled={loading}
      title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
    >
      {isInWatchlist ? <FaStar size={10} /> : <FaRegStar size={10} />}
    </button>
  );
}
