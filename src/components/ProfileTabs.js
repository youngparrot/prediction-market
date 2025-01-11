import {
  fetchTransactions,
  fetchUserCreatedPredictions,
  fetchUserPredictions,
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

// Extend dayjs with the relativeTime plugin
dayjs.extend(relativeTime);

const PredictedCard = ({ prediction }) => {
  return (
    <div className="flex justify-between items-center bg-gray-800 p-4 rounded-md">
      <div>
        <a href={`/prediction/${prediction.predictionId}`}>
          <p className="font-bold">{prediction.predictionDetails.question}</p>
        </a>
      </div>
      <a
        href={`/prediction/${prediction.predictionId}`}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-bold"
      >
        View
      </a>
    </div>
  );
};

const CreatedCard = ({ prediction }) => {
  return (
    <div className="flex justify-between items-center bg-gray-800 p-4 rounded-md">
      <div>
        <a href={`/prediction/${prediction._id}`}>
          <p className="font-bold">{prediction.question}</p>
        </a>
      </div>
      <a
        href={`/prediction/${prediction._id}`}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-bold"
      >
        View
      </a>
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
    <div className="space-y-4">
      {userPredictions
        ? userPredictions.map((prediction) => {
            return (
              <PredictedCard
                key={prediction.predictionId}
                prediction={prediction}
              />
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
    <div className="space-y-4">
      {userCreatedPredictions
        ? userCreatedPredictions.map((prediction) => (
            <CreatedCard key={prediction._id} prediction={prediction} />
          ))
        : null}
    </div>
  );
};

const WatchListed = ({ id, answers }) => {
  const [holdersList, setHoldersList] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const getTopHolders = async (type, id) => {
    try {
      setIsFetching(true);
      const transactionsData = await fetchTransactions(type, id);
      setHoldersList(transactionsData.data);
    } catch (error) {
      console.log("Fetch top holders failed", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {}, []);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-600 p-4 rounded-md grid grid-cols-1 md:grid-cols-2 gap-6">
      Incoming
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
      case "WatchListed":
        return <WatchListed userAddress={userAddress} />;
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
        {["Predicted", "Created", "WatchListed"].map((tab) => (
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
            className="px-4 md:px-6 py-2 font-bold"
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
