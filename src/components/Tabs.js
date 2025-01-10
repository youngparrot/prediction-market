import { fetchTransactions } from "@/utils/api";
import { CORE_SCAN_URL } from "@/utils/environment";
import Giscus from "@giscus/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

// Extend dayjs with the relativeTime plugin
dayjs.extend(relativeTime);

// Define the components for each tab
const Comments = ({ id }) => (
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
);
const Activity = ({ id }) => {
  const [transactions, setTransactions] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const getTransactions = async (id) => {
    try {
      setIsFetching(true);
      const transactionsData = await fetchTransactions(id);
      setTransactions(transactionsData.data);
    } catch (error) {
      console.log("Fetch transaction failed", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    getTransactions(id);
  }, []);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-600 p-4 rounded-md">
      {transactions
        ? transactions.map((transaction) => (
            <div key={transaction._id} className="flex justify-between">
              <div>
                <a
                  href={`${CORE_SCAN_URL}/address/${transaction.userAddress}`}
                  title="Predictor Address"
                  target="_blank"
                  className="text-primary font-bold"
                >
                  {`${transaction.userAddress.slice(
                    0,
                    6
                  )}...${transaction.userAddress.slice(-4)}`}
                </a>{" "}
                predicted{" "}
                <span className="text-secondary font-bold">
                  {transaction.amount} $CORE
                </span>
              </div>
              <div>{dayjs(transaction.createdAt).fromNow()}</div>
            </div>
          ))
        : null}
    </div>
  );
};
const TopHolders = ({ id }) => (
  <div className="bg-white text-gray-600 p-4 rounded-md">Incoming</div>
);

const Tabs = ({ id }) => {
  const [activeTab, setActiveTab] = useState("Comments");

  // Function to render the component based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "Comments":
        return <Comments id={id} />;
      case "Activity":
        return <Activity id={id} />;
      case "Top Holders":
        return <TopHolders id={id} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tab headers */}
      <div style={{ display: "flex", borderBottom: "1px solid #F7C942" }}>
        {["Comments", "Activity", "Top Holders"].map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              borderBottom: activeTab === tab ? "2px solid #F7C942" : "none",
              fontWeight: activeTab === tab ? "bold" : "normal",
              color: "#F7C942",
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "20px" }}>{renderTabContent()}</div>
    </div>
  );
};

export default Tabs;
