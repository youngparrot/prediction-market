import {
  fetchTransactions,
  fetchUserCreatedPredictions,
  fetchUserPredictions,
  fetchWatchlist,
  unWatchlist,
} from "@/utils/api";
import {
  CREATION_SHARE_FEE_PERCENT,
  DEFAULT_CHAIN_ID,
  environments,
} from "@/utils/environment";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { FaMoneyBillAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAccount, useWalletClient } from "wagmi";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";

// Extend dayjs with the relativeTime plugin
dayjs.extend(relativeTime);

const PredictedCard = ({ prediction }) => {
  return (
    <div className="flex justify-between items-center text-gray-500 rounded-md">
      <div className="flex flex-col items-start">
        <a href={`/prediction/${prediction.predictionId}`}>
          <p className="font-bold">{prediction.predictionDetails.question}</p>
        </a>
        <span className="px-2 py-1 rounded text-white text-xs bg-gray-700">
          {prediction.predictionDetails.category}
        </span>
      </div>
    </div>
  );
};

const CreatedCard = ({ prediction }) => {
  return (
    <div className="flex justify-between items-center text-gray-500 rounded-md">
      <div className="flex flex-col items-start">
        <a href={`/prediction/${prediction._id}`}>
          <p className="font-bold">{prediction.question}</p>
        </a>
        <span className="px-2 py-1 rounded text-white text-xs bg-gray-700">
          {prediction.category}
        </span>
      </div>
    </div>
  );
};

const WatchlistCard = ({ prediction, deleteWatchlist, userAddress }) => {
  const { address, isConnected } = useAccount();

  return (
    <div className="flex justify-between items-center text-gray-500 rounded-md">
      <div className="flex flex-col items-start">
        <a href={`/prediction/${prediction._id}`}>
          <p className="font-bold">{prediction.question}</p>
        </a>
        <span className="px-2 py-1 rounded text-white text-xs bg-gray-700">
          {prediction.category}
        </span>
      </div>
      <div className="flex gap-2">
        {isConnected && userAddress === address ? (
          <button
            onClick={() => deleteWatchlist(prediction._id)}
            className="bg-secondary hover:bg-secondary-dark px-4 py-2 rounded text-white text-sm font-bold"
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
};

// Define the components for each tab
const Predicted = ({ userAddress }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [userPredictions, setUserPredictions] = useState();
  const { data: walletClient } = useWalletClient();

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
      const userPredictionsData = await fetchUserPredictions(
        userAddress,
        chainId
      );
      setUserPredictions(userPredictionsData.data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [chainId]);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (userPredictions && userPredictions?.length === 0) {
    return (
      <div className="text-gray-700 mt-4 flex gap-1 items-center">
        <p>
          No predicted predictions. Let&apos;s choose any predictions{" "}
          <a href="/" title="Home" className="text-primary font-bold">
            HERE
          </a>{" "}
          and predict and earn money
        </p>
        <FaMoneyBillAlt size={25} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {userPredictions
        ? userPredictions.map((prediction) => {
            return (
              <div
                key={prediction.predictionId}
                className="even:bg-gray-100 rounded-md p-2"
              >
                <PredictedCard
                  key={prediction.predictionId}
                  prediction={prediction}
                />
              </div>
            );
          })
        : null}
    </div>
  );
};

const Created = ({ userAddress }) => {
  const [userCreatedPredictions, setUserCreatedPredictions] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const { data: walletClient } = useWalletClient();

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

  const getUserCreatedPredictions = async (userAddress) => {
    try {
      setIsFetching(true);
      const userCreatedPredictionsData = await fetchUserCreatedPredictions(
        userAddress,
        chainId
      );
      setUserCreatedPredictions(userCreatedPredictionsData.data);
    } catch (error) {
      console.log("Fetch transaction failed", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    getUserCreatedPredictions(userAddress);
  }, [chainId]);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (userCreatedPredictions && userCreatedPredictions?.length === 0) {
    return (
      <div className="text-gray-700 mt-4">
        No created predictions. Create a prediction{" "}
        <a
          href="/create-prediction"
          title="Create Prediction"
          className="text-primary font-bold"
        >
          HERE
        </a>{" "}
        and earn {CREATION_SHARE_FEE_PERCENT}% of our platform fee for your own
        prediction.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {userCreatedPredictions
        ? userCreatedPredictions.map((prediction) => (
            <div
              key={prediction._id}
              className="even:bg-gray-100 rounded-md p-2"
            >
              <CreatedCard key={prediction._id} prediction={prediction} />
            </div>
          ))
        : null}
    </div>
  );
};

const Watchlisted = ({ userAddress }) => {
  const [watchlists, setWatchlists] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const { data: walletClient } = useWalletClient();

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

  const getWatchlists = async () => {
    try {
      setIsFetching(true);
      const response = await fetchWatchlist(userAddress, chainId);
      setWatchlists(response.watchlist);
    } catch (error) {
      console.log("Fetch watchlists failed", error);
    } finally {
      setIsFetching(false);
    }
  };

  const deleteWatchlist = async (predictionId) => {
    try {
      await unWatchlist(userAddress, predictionId, chainId);
      toast.success("Watchlist is removed");
      getWatchlists();
    } catch (error) {
      console.log("Remove watchlist failed", error);
      toast.error("Remove watchlist is failed");
    }
  };

  useEffect(() => {
    getWatchlists();
  }, [chainId]);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (watchlists && watchlists.length === 0) {
    return <div className="text-gray-700 mt-4">There is no watchlists.</div>;
  }

  return (
    <div className="space-y-2">
      {watchlists
        ? watchlists.map((prediction) => (
            <div
              key={prediction._id}
              className="even:bg-gray-100 rounded-md p-2"
            >
              <WatchlistCard
                key={prediction._id}
                prediction={prediction}
                deleteWatchlist={deleteWatchlist}
                userAddress={userAddress}
              />
            </div>
          ))
        : null}
    </div>
  );
};

const TABS = ["Predicted", "Created", "Watchlisted"];

const ProfileTabs = ({ userAddress }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse ?tab from URL and normalize it
  const initialTab = (() => {
    const tab = searchParams?.get("tab")?.toLowerCase();
    if (tab === "created") return "Created";
    if (tab === "watchlisted") return "Watchlisted";
    return "Predicted";
  })();

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const tabQuery = tab.toLowerCase().replace(/\s+/g, "");
    router.push(`?tab=${tabQuery}`, { scroll: false });
  };

  // Function to render the component based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "Predicted":
        return <Predicted userAddress={userAddress} />;
      case "Created":
        return <Created userAddress={userAddress} />;
      case "Watchlisted":
        return <Watchlisted userAddress={userAddress} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tab headers */}
      <div
        style={{ display: "flex", borderBottom: "1px solid #00539C" }}
        className="gap-1 md:gap-4"
      >
        {TABS.map((tab) => (
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            key={tab}
            onClick={() => handleTabClick(tab)}
            style={{
              cursor: "pointer",
              borderBottom: activeTab === tab ? "2px solid #00539C" : "none",
              color: "#00539C",
            }}
            className="px-4 md:px-6 py-2 font-bold text-base md:text-lg"
          >
            {tab}
          </motion.div>
        ))}
      </div>

      {/* Tab content */}
      <div className="py-2">{renderTabContent()}</div>
    </div>
  );
};

export default ProfileTabs;
