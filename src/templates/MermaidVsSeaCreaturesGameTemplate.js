"use client";

import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import MermaidVsSeaCreaturesGame from "@/lib/abi/MermaidVsSeaCreaturesGame.json";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { formatEther, getContract, parseEther, parseUnits } from "viem";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import {
  KAIA_SCAN_URL,
  MERMAID_VS_SEA_CREATURES_GAME_ADDRESS,
} from "@/utils/environment";
import Countdown from "@/components/Countdown";

const BET_TYPE = {
  mermaid: "mermaid",
  seaCreatures: "sea-creatures",
};

const MermaidVsSeaCreaturesGameTemplate = () => {
  const publicClient = usePublicClient(); // Fetches the public provider
  const { data: walletClient } = useWalletClient(); // Fetches the connected wallet signer

  const { address, isConnected } = useAccount();
  const [betAmount, setBetAmount] = useState(1);
  const [roundStats, setRoundStats] = useState();
  const [playerStats, setPlayerStats] = useState();

  const fetchRound = async () => {
    try {
      const gameContract = getContract({
        address: MERMAID_VS_SEA_CREATURES_GAME_ADDRESS,
        abi: MermaidVsSeaCreaturesGame,
        client: publicClient,
      });

      const roundId = await gameContract.read.getCurrentRoundIndex();
      const roundStats = await gameContract.read.getRoundStats([
        parseInt(roundId.toString()),
      ]);
      setRoundStats(roundStats);
    } catch (error) {
      console.log("Failed fetch data", error);
    }
  };

  const fetchPlayer = async () => {
    if (!address) {
      return;
    }

    try {
      const gameContract = getContract({
        address: MERMAID_VS_SEA_CREATURES_GAME_ADDRESS,
        abi: MermaidVsSeaCreaturesGame,
        client: publicClient,
      });
      const roundId = await gameContract.read.getCurrentRoundIndex();
      const playerStats = await gameContract.read.getPlayerStats([
        parseInt(roundId.toString()),
        address,
      ]);
      setPlayerStats(playerStats);
    } catch (error) {
      console.log("Fetch player failed", error);
    }
  };

  useEffect(() => {
    if (!publicClient) {
      return;
    }

    fetchRound();
    fetchPlayer();
  }, [publicClient, isConnected]);

  const handleBet = async (type) => {
    try {
      const gameContract = getContract({
        address: MERMAID_VS_SEA_CREATURES_GAME_ADDRESS,
        abi: MermaidVsSeaCreaturesGame,
        client: walletClient,
      });

      let tx;
      if (type === BET_TYPE.mermaid) {
        tx = await gameContract.write.betOnMermaid([], {
          value: parseEther(betAmount.toString()),
        });
      } else {
        tx = await gameContract.write.betOnSeaCreatures([], {
          value: parseEther(betAmount.toString()),
        });
      }
      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      if (transactionReceipt.transactionHash) {
        toast.success("Bet successful");

        fetchRound();
        fetchPlayer();
      } else {
        console.log("Bet failed", transactionReceipt);
        toast.error("Bet failed");
      }
    } catch (error) {
      console.log("Bet failed", error);
      if (error.message.startsWith("User rejected the request")) {
        toast.error("You rejected the request");
      } else {
        toast.error("Bet failed");
      }
    }
  };

  const handleClaimReward = async () => {
    try {
      const gameContract = getContract({
        address: MERMAID_VS_SEA_CREATURES_GAME_ADDRESS,
        abi: MermaidVsSeaCreaturesGame,
        client: walletClient,
      });

      const tx = await gameContract.write.claimReward([], {
        value: 0,
      });
      await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      toast.success("Claim reward successful");
    } catch (error) {
      console.log("Claim reward failed", error);
      if (error.message.startsWith("User rejected the request")) {
        toast.error("You rejected the request");
      } else {
        toast.error("Claim reward failed");
      }
    }
  };

  const handleGetAmount = (e) => {
    setBetAmount(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-0 md:px-8">
      <p className="text-4xl font-bold text-highlight py-4">
        Mermaid Vs Sea Creatures Game
      </p>
      {roundStats ? (
        <>
          {roundStats.endTime && (
            <Countdown date={roundStats.endTime.toString() * 1000} />
          )}
          <div className="flex flex-col items-center gap-2 max-w-lg py-4">
            <p className="text-2xl font-bold text-highlight">Total Rewards</p>
            <div className="flex">
              <p className="text-2xl text-metallic">
                {formatEther(roundStats.totalRewards.toString())} KAIA
              </p>
            </div>
          </div>
          <div className="flex justify-between gap-4 max-w-lg">
            <p className="text-2xl text-highlight">
              {roundStats.totalMermaidPower}
            </p>
            <p className="text-metallic">vs</p>
            <p className="text-2xl text-highlight">
              {roundStats.totalSeaCreaturesPower}
            </p>
          </div>
        </>
      ) : null}
      <Image
        src="/images/mermaid-vs-sea-creatures.png"
        width={888}
        height={500}
        alt="Mermaid Vs Sea Creatures Bet Game Image"
      />
      <div className="flex items-center gap-4">
        <input
          type="number"
          value={betAmount}
          onChange={handleGetAmount}
          id="betAmount"
          name="betAmount"
          placeholder="Enter amount"
          className="block w-full px-4 py-2 mt-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
        />
        <p className="mt-4 text-metallic">KAIA</p>
      </div>
      {isConnected ? (
        <>
          <div className="flex justify-between gap-4 md:gap-6 max-w-lg py-4">
            <button
              onClick={() => handleBet(BET_TYPE.mermaid)}
              className="bg-primary text-white font-bold py-2 px-4 rounded"
            >
              Power Up Mermaid
            </button>
            <button
              onClick={() => handleBet(BET_TYPE.seaCreatures)}
              className="bg-primary text-gray-700 font-bold py-2 px-4 rounded"
            >
              Power Up Sea Creatures
            </button>
          </div>
          {playerStats ? (
            <div className="flex justify-between gap-4 md:gap-6">
              <div>
                <p className="text-highlight">
                  Your Mermaid Power:{" "}
                  <span className="text-metallic">
                    {playerStats.totalMermaidPower.toString()}
                  </span>
                </p>
                <p className="text-highlight">
                  Your Mermaid Spent:{" "}
                  <span className="text-metallic">
                    {formatEther(playerStats.totalMermaidSpent.toString())} KAIA
                  </span>
                </p>
              </div>
              <div>
                <p className="text-highlight">
                  Your Sea Creatures Power:{" "}
                  <span className="text-metallic">
                    {playerStats.totalSeaCreaturesPower.toString()}
                  </span>
                </p>
                <p className="text-highlight">
                  Your Sea Creatures Spent:{" "}
                  <span className="text-metallic">
                    {formatEther(playerStats.totalSeaCreaturesSpent.toString())}{" "}
                    KAIA
                  </span>
                </p>
              </div>
            </div>
          ) : null}
          {/* <button onClick={() => handleClaimReward()}>Claim Reward</button> */}
        </>
      ) : (
        <div className="mt-4">
          <ConnectButton />
        </div>
      )}
    </div>
  );
};

export default MermaidVsSeaCreaturesGameTemplate;
