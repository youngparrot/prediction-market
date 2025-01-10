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
const Activity = ({ id, answers }) => {
  const [transactions, setTransactions] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const getTransactions = async (type, id) => {
    try {
      setIsFetching(true);
      const transactionsData = await fetchTransactions(type, id);
      setTransactions(transactionsData.data);
    } catch (error) {
      console.log("Fetch transaction failed", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    getTransactions("transactions", id);
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
                  title={transaction.userAddress}
                  target="_blank"
                  className="font-bold"
                >
                  {`${transaction.userAddress.slice(
                    0,
                    6
                  )}...${transaction.userAddress.slice(-4)}`}
                </a>{" "}
                predicted{" "}
                <span className="font-bold">
                  {answers[transaction.outcomeIndex]}
                </span>
                {" with "}
                <span className="text-secondary font-bold">
                  {transaction.amount} $CORE
                </span>
              </div>
              <div>
                {transaction.transactionId ? (
                  <a
                    href={`${CORE_SCAN_URL}/tx/${transaction.transactionId}`}
                    title="Transaction Link"
                    target="_blank"
                    className="font-bold"
                  >
                    {dayjs(transaction.createdAt).fromNow()}
                  </a>
                ) : (
                  dayjs(transaction.createdAt).fromNow()
                )}
              </div>
            </div>
          ))
        : null}
    </div>
  );
};
const TopHolders = ({ id, answers }) => {
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

  useEffect(() => {
    getTopHolders("topHolders", id);
  }, []);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-600 p-4 rounded-md grid grid-cols-1 md:grid-cols-2 gap-6">
      {holdersList
        ? holdersList.map((holders) => (
            <div key={holders.outcomeIndex}>
              <div className="flex justify-between font-bold text-primary">
                <p>{answers[holders.outcomeIndex]} Holders</p>
                <p>Amount</p>
              </div>
              {holders.holders.map((holder) => (
                <div key={holder.userAddress} className="flex justify-between">
                  <div className="font-bold">
                    <a
                      href={`${CORE_SCAN_URL}/address/${holder.userAddress}`}
                      title={holder.userAddress}
                      target="_blank"
                      className="font-bold"
                    >{`${holder.userAddress.slice(
                      0,
                      6
                    )}...${holder.userAddress.slice(-4)}`}</a>
                  </div>
                  <div className="text-secondary font-bold">
                    {holder.totalAmount} $CORE
                  </div>
                </div>
              ))}
            </div>
          ))
        : null}
    </div>
  );
};

const Tabs = ({ id, answers }) => {
  const [activeTab, setActiveTab] = useState("Comments");

  // Function to render the component based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "Comments":
        return <Comments id={id} />;
      case "Activity":
        return <Activity id={id} answers={answers} />;
      case "Top Holders":
        return <TopHolders id={id} answers={answers} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tab headers */}
      <div
        style={{ display: "flex", borderBottom: "1px solid #F7C942" }}
        className="gap-1 md:gap-4"
      >
        {["Comments", "Activity", "Top Holders"].map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              cursor: "pointer",
              borderBottom: activeTab === tab ? "2px solid #F7C942" : "none",
              color: "#F7C942",
            }}
            className="px-4 md:px-6 py-2 font-bold"
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Tab content */}
      <div className="py-2">{renderTabContent()}</div>
    </div>
  );
};

export default Tabs;
