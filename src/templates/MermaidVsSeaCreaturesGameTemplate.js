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

const BET_TYPE = {
  mermaid: "mermaid",
  seaCreatures: "sea-creatures",
};

const MermaidVsSeaCreaturesGameTemplate = () => {
  const publicClient = usePublicClient(); // Fetches the public provider
  const { data: walletClient } = useWalletClient(); // Fetches the connected wallet signer

  const { address, isConnected } = useAccount();
  const [betAmount, setBetAmount] = useState(1);
  const [totalRewards, setTotalRewards] = useState(0);
  const [mermaidTotalPower, setMermaidTotalPower] = useState(0);
  const [seaCreaturesTotalPower, setSeaCreaturesTotalPower] = useState(0);

  const fetchData = async () => {
    console.log("fetchData()");
    try {
      const gameContract = getContract({
        address: MERMAID_VS_SEA_CREATURES_GAME_ADDRESS,
        abi: MermaidVsSeaCreaturesGame,
        client: publicClient,
      });

      const roundId = await gameContract.read.getCurrentRoundIndex();
      console.log({ roundId });
      const roundStats = await gameContract.read.getRoundStats([
        parseInt(roundId.toString()),
      ]);
      const playerStats = await gameContract.read.getPlayerStats([
        parseInt(roundId.toString()),
        address,
      ]);
      console.log({ roundStats, playerStats });
      setMermaidTotalPower(roundStats.totalBetMermaid.toString());
      setSeaCreaturesTotalPower(roundStats.totalBetSeaCreatures.toString());
      setTotalRewards(formatEther(roundStats.totalRewards.toString()));
    } catch (error) {
      console.log("Failed fetch data", error);
    }
  };

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    fetchData();
  }, [isConnected]);

  const fetchUserInfo = async () => {};

  const handleAfterBet = async () => {
    // call bet info API

    // fetch user info
    fetchUserInfo();
  };

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
      await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      toast.success("Bet successful");

      handleAfterBet();
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
        Mermaid Vs Sea Creatures
      </p>
      <div className="flex flex-col items-center gap-2 max-w-lg py-4">
        <p className="text-xl font-bold text-highlight">Total Rewards</p>
        <div className="flex">
          <p className="text-xl text-metallic">{totalRewards} KAIA</p>
        </div>
      </div>
      <div className="flex justify-between gap-4 max-w-lg">
        <p className="text-xl text-metallic">{mermaidTotalPower}</p>
        <p>vs</p>
        <p className="text-xl text-metallic">{seaCreaturesTotalPower}</p>
      </div>
      <Image
        src="/images/mermaid-vs-sea-creatures.png"
        width={500}
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
        <p className="mt-4">KAIA</p>
      </div>
      <div className="flex justify-between gap-4 max-w-lg py-4">
        <button
          onClick={() => handleBet(BET_TYPE.mermaid)}
          className="bg-primary text-white font-bold py-2 px-4 rounded"
        >
          Power Up Mermaid
        </button>
        <button
          onClick={() => handleBet(BET_TYPE.seaCreatures)}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
        >
          Power Up Sea Creatures
        </button>
      </div>
      <button onClick={() => handleClaimReward()}>Claim Reward</button>
    </div>
  );
};

export default MermaidVsSeaCreaturesGameTemplate;
