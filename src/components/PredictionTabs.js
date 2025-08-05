import { fetchTransactions } from "@/utils/api";
import Giscus from "@giscus/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { motion } from "framer-motion";
import { DEFAULT_CHAIN_ID, environments } from "@/utils/environment";
import { useWalletClient } from "wagmi";
import Image from "next/image";
import ChatRoom from "./ChatRoom";

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
const Activity = ({ id, prediction }) => {
  const [transactions, setTransactions] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const { data: walletClient } = useWalletClient();
  const answers = prediction.answers;

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
  }, [chainId]);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (transactions && transactions?.length === 0) {
    return (
      <div className="bg-white text-gray-700 p-4 flex gap-1 items-center">
        <p>No transactions</p>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-600 p-4 rounded-md">
      {transactions
        ? transactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex justify-between even:bg-gray-100 py-1"
            >
              <div className="flex gap-1">
                <a
                  href={`/profile/${transaction.userAddress}`}
                  title={transaction.userAddress}
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
                <span className="flex gap-1 text-secondary">
                  {transaction.amount} {transaction.paymentToken}
                  <Image
                    src={
                      environments[chainId]["PREDICTION_MARKET_ADDRESS"][
                        transaction.paymentToken
                      ].image
                    }
                    width={20}
                    height={20}
                    className="w-[24px] h-[24px]"
                    alt="Symbol"
                  />
                </span>
              </div>
              <div>
                {transaction.transactionId ? (
                  <a
                    href={`${environments[chainId]["SCAN_URL"]}/tx/${transaction.transactionId}`}
                    title="Transaction Link"
                    target="_blank"
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

const TopHolders = ({ id, prediction }) => {
  const [holdersList, setHoldersList] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const { data: walletClient } = useWalletClient();
  const answers = prediction.answers;

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

  if (holdersList && holdersList?.length === 0) {
    return (
      <div className="bg-white text-gray-700 p-4 flex gap-1 items-center">
        <p>No holders</p>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-600 p-4 rounded-md grid grid-cols-1 md:grid-cols-2 gap-6">
      {holdersList
        ? holdersList.map((holders) => (
            <div key={holders.outcomeIndex}>
              <div className="flex justify-between font-bold text-primary">
                <p>
                  {answers[holders.outcomeIndex]} Holders (Total:{" "}
                  {holders.holders.length})
                </p>
                <p>Amount</p>
              </div>
              {holders.holders.map((holder) => (
                <div
                  key={holder.userAddress}
                  className="flex justify-between even:bg-gray-100 py-1"
                >
                  <div>
                    <a
                      href={`/profile/${holder.userAddress}`}
                      title={holder.userAddress}
                    >{`${holder.userAddress.slice(
                      0,
                      6
                    )}...${holder.userAddress.slice(-4)}`}</a>
                  </div>
                  <div className="flex gap-1 text-secondary">
                    {holder.totalAmount} {holder.paymentToken}
                    <Image
                      src={
                        environments[chainId]["PREDICTION_MARKET_ADDRESS"][
                          holder.paymentToken
                        ].image
                      }
                      width={20}
                      height={20}
                      className="w-[24px] h-[24px]"
                      alt="Symbol"
                    />
                  </div>
                </div>
              ))}
            </div>
          ))
        : null}
    </div>
  );
};

const PredictionTabs = ({ id, prediction }) => {
  const [activeTab, setActiveTab] = useState("Comments");

  // Function to render the component based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "Comments":
        return <ChatRoom id={id} prediction={prediction} />;
      case "Activity":
        return <Activity id={id} prediction={prediction} />;
      case "Top Holders":
        return <TopHolders id={id} prediction={prediction} />;
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              cursor: "pointer",
              borderBottom: activeTab === tab ? "2px solid #F7C942" : "none",
              color: "#F7C942",
            }}
            className="px-2 md:px-6 py-2 font-bold"
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

export default PredictionTabs;
