import {
  fetchTransactions,
  fetchUserCreatedPredictions,
  fetchUserPredictions,
  fetchWatchlist,
  unWatchlist,
} from "@/utils/api";
import {
  CORE_SCAN_URL,
  CREATION_FEE,
  CREATION_SHARE_FEE_PERCENT,
} from "@/utils/environment";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { FaMoneyBillAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";

// Extend dayjs with the relativeTime plugin
dayjs.extend(relativeTime);

const PredictedCard = ({ prediction }) => {
  return (
    <div className="flex justify-between items-center text-gray-500 rounded-md">
      <div className="flex gap-1 items-start">
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
      <div className="flex gap-1 items-start">
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
      <div className="flex gap-1 items-start">
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

  const fetchData = async () => {
    try {
      setIsFetching(true);
      const userPredictionsData = await fetchUserPredictions(userAddress);
      setUserPredictions(userPredictionsData.data);
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

  const getUserCreatedPredictions = async (userAddress) => {
    try {
      setIsFetching(true);
      const userCreatedPredictionsData = await fetchUserCreatedPredictions(
        userAddress
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
  }, []);

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

  const getWatchlists = async () => {
    try {
      setIsFetching(true);
      const response = await fetchWatchlist(userAddress);
      setWatchlists(response.watchlist);
    } catch (error) {
      console.log("Fetch watchlists failed", error);
    } finally {
      setIsFetching(false);
    }
  };

  const deleteWatchlist = async (predictionId) => {
    try {
      await unWatchlist(userAddress, predictionId);
      toast.success("Watchlist is removed");
      getWatchlists();
    } catch (error) {
      console.log("Delete watchlist failed", error);
      toast.error("Remove watchlist is failed");
    }
  };

  useEffect(() => {
    getWatchlists();
  }, []);

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

const ProfileTabs = ({ userAddress }) => {
  const [activeTab, setActiveTab] = useState("Predicted");

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
        {["Predicted", "Created", "Watchlisted"].map((tab) => (
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            key={tab}
            onClick={() => setActiveTab(tab)}
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
