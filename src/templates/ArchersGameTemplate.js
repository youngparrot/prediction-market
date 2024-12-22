"use client";

import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import ArchersGameABI from "@/lib/abi/ArchersGame.json";
import ERC721ABI from "@/lib/abi/ERC721.json";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import {
  formatEther,
  formatUnits,
  getContract,
  parseEther,
  parseUnits,
} from "viem";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import {
  ARCHERS_GAME_ADDRESS,
  ARCHERS_GAME_OWNER_ADDRESS,
  ARCHERS_NFT_ADDRESS,
  BOW_TOKEN_ADDRESS,
} from "@/utils/environment";
import Countdown from "@/components/Countdown";
import Modal from "@/components/Modal";
import { FaSpinner } from "react-icons/fa";
import ERC20ABI from "@/lib/abi/ERC20.json";

const POWER_UP_TYPE = {
  female: "female",
  male: "male",
};

const MINIMUM_AMOUNT = 2;
const MAX_ITERATIONS = 20;

const ArchersGameTemplate = () => {
  const publicClient = usePublicClient(); // Fetches the public provider
  const { data: walletClient } = useWalletClient(); // Fetches the connected wallet signer

  const { address, isConnected } = useAccount();
  const [powerUpAmount, setPowerUpAmount] = useState(MINIMUM_AMOUNT);
  const [roundStats, setRoundStats] = useState();
  const [playerStats, setPlayerStats] = useState();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [claimAmount, setClaimAmount] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isEndRounding, setIsEndRounding] = useState(false);
  const [isStartNewRounding, setIsStartNewRounding] = useState(false);
  const [isFemalePowerUping, setIsFemalePowerUping] = useState(false);
  const [isMalePowerUping, setIsMalePowerUping] = useState(false);
  const [amountNFT, setAmountNFT] = useState();

  const fetchRound = async () => {
    try {
      const gameContract = getContract({
        address: ARCHERS_GAME_ADDRESS,
        abi: ArchersGameABI,
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
        address: ARCHERS_GAME_ADDRESS,
        abi: ArchersGameABI,
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

  const fetchBalanceNFT = async () => {
    if (!address) {
      return;
    }

    try {
      const nftContract = getContract({
        address: ARCHERS_NFT_ADDRESS,
        abi: ERC721ABI,
        client: publicClient,
      });

      const amountNFT = await nftContract.read.balanceOf([address]);
      setAmountNFT(parseInt(amountNFT.toString()));
    } catch (error) {
      console.log("Fetch balance NFT failed", error);
    }
  };

  const fetchHasClaimed = async () => {
    if (!isDone()) {
      return;
    }

    try {
      const gameContract = getContract({
        address: ARCHERS_GAME_ADDRESS,
        abi: ArchersGameABI,
        client: publicClient,
      });
      const roundId = await gameContract.read.getCurrentRoundIndex();
      const hasClaimed = await gameContract.read.hasClaimed([
        parseInt(roundId.toString()),
        address,
      ]);
      setHasClaimed(hasClaimed);

      const claimAmount = await gameContract.read.getClaimRewardAmount([
        parseInt(roundId.toString()),
        address,
      ]);
      setClaimAmount(claimAmount.toString());
    } catch (error) {
      console.log("Fetch has claimed failed", error);
    }
  };

  useEffect(() => {
    if (!publicClient) {
      return;
    }

    fetchRound();
    fetchPlayer();
    fetchBalanceNFT();
  }, [publicClient, isConnected]);

  useEffect(() => {
    if (!roundStats) {
      return;
    }

    fetchHasClaimed();
  }, [roundStats]);

  const handlePowerUp = async (type) => {
    try {
      if (amountNFT === 0) {
        toast.info("You do not have Kyudo Archer NFT in your wallet.");
        return;
      }

      if (type === POWER_UP_TYPE.female) {
        setIsFemalePowerUping(true);
      } else {
        setIsMalePowerUping(true);
      }

      const tokenReadContract = getContract({
        address: BOW_TOKEN_ADDRESS,
        abi: ERC20ABI,
        client: publicClient,
      });
      const allowance = await tokenReadContract.read.allowance([
        address,
        ARCHERS_GAME_ADDRESS,
      ]);

      // Format the allowance based on token decimals
      const formattedAllowance = parseFloat(formatUnits(allowance, 18));

      if (formattedAllowance < powerUpAmount) {
        const writeTokenContract = getContract({
          address: BOW_TOKEN_ADDRESS,
          abi: ERC20ABI,
          client: walletClient,
        });

        const approveHash = await writeTokenContract.write.approve([
          ARCHERS_GAME_ADDRESS,
          parseUnits(powerUpAmount.toString(), 18),
        ]);
        await publicClient.waitForTransactionReceipt({
          hash: approveHash,
        });
      }

      const gameContract = getContract({
        address: ARCHERS_GAME_ADDRESS,
        abi: ArchersGameABI,
        client: walletClient,
      });

      let tx;
      if (type === POWER_UP_TYPE.female) {
        tx = await gameContract.write.powerUpOnFemale(
          [parseEther(powerUpAmount.toString())],
          {
            value: 0,
          }
        );
      } else {
        tx = await gameContract.write.powerUpOnMale(
          [parseEther(powerUpAmount.toString())],
          {
            value: 0,
          }
        );
      }
      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      if (transactionReceipt.status === "success") {
        toast.success("Power Up successful");

        fetchRound();
        fetchPlayer();
      } else {
        toast.error("Power Up failed, try it again");
      }
    } catch (error) {
      console.log("Power Up failed", error);
      if (error.message.startsWith("User rejected the request")) {
        toast.error("You rejected the request");
      } else {
        toast.error("Power Up failed");
      }
    } finally {
      if (type === POWER_UP_TYPE.female) {
        setIsFemalePowerUping(false);
      } else {
        setIsMalePowerUping(false);
      }
    }
  };

  const handleClaimReward = async () => {
    try {
      setIsClaiming(true);

      if (claimAmount == 0) {
        toast.info("You do not have any reward to claim");
        return;
      }

      if (hasClaimed) {
        toast.info("You already claimed");
        return;
      }

      const gameContract = getContract({
        address: ARCHERS_GAME_ADDRESS,
        abi: ArchersGameABI,
        client: walletClient,
      });

      const tx = await gameContract.write.claimReward([], {
        value: 0,
      });
      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      if (transactionReceipt.status === "success") {
        toast.success("Claim reward successful");
        fetchHasClaimed();
      } else {
        toast.error("Claim reward failed, try it again");
      }
    } catch (error) {
      console.log("Claim reward failed", error);
      if (error.message.startsWith("User rejected the request")) {
        toast.error("You rejected the request");
      } else {
        toast.error("Claim reward failed");
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const handleEndRound = async () => {
    try {
      setIsEndRounding(true);

      if (!isDone()) {
        toast.info("The round has not ended yet");
        return;
      }

      const gameContract = getContract({
        address: ARCHERS_GAME_ADDRESS,
        abi: MermaidVsSeaCreaturesGame,
        client: walletClient,
      });

      const tx = await gameContract.write.endRound([], {
        value: 0,
      });
      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      if (transactionReceipt.status === "success") {
        toast.success("End Round successful");
      } else {
        toast.error("End Round failed, try it again");
      }
    } catch (error) {
      console.log("End Round failed", error);
      if (error.message.startsWith("User rejected the request")) {
        toast.error("You rejected the request");
      } else {
        toast.error("End Round failed");
      }
    } finally {
      setIsEndRounding(false);
    }
  };

  const isGameOwner = () => {
    return address === ARCHERS_GAME_OWNER_ADDRESS;
  };

  const handleGetAmount = (e) => {
    setPowerUpAmount(e.target.value);
  };

  const handleHowToPlay = () => {
    setShowHowToPlay(!showHowToPlay);
  };

  const isDone = () => {
    if (!roundStats || !roundStats.endTime) {
      return false;
    }

    const targetDate = dayjs(roundStats.endTime.toString() * 1000);
    const now = dayjs();
    const difference = targetDate.diff(now);

    return difference <= 0;
  };

  const isFemaleSideWinner = () => {
    return (
      roundStats.totalFemalePower > roundStats.totalMalePower ||
      (roundStats.totalFemalePower == roundStats.totalMalePower &&
        roundStats.totalFemaleSpent > roundStats.totalMaleSpent)
    );
  };

  const isTie = () => {
    return (
      roundStats.totalFemalePower == roundStats.totalMalePower &&
      roundStats.totalFemaleSpent == roundStats.totalMaleSpent
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-0 md:px-8">
      <p className="text-4xl font-bold text-highlight py-4">Archers Game</p>
      <div>
        <button
          onClick={handleHowToPlay}
          className="text-xl text-hightlight mb-4"
        >
          [how to play]
        </button>
      </div>
      <div>
        <a
          href="https://app.youngparrotnft.com/core/collections/kyudo-archer"
          title="Buy Kyudo Archer NFT"
          target="_blank"
        >
          [Buy Kyudo Archer NFT]
        </a>
      </div>
      {roundStats ? (
        <>
          {!isDone() && (
            <Countdown date={roundStats.endTime.toString() * 1000} />
          )}
          <div className="flex flex-col items-center gap-2 max-w-lg py-4">
            <p className="text-2xl font-bold text-highlight">Total Rewards</p>
            <div className="flex">
              <p className="text-2xl text-highlight">
                {formatEther(roundStats.totalRewards.toString())} BOW
              </p>
            </div>
          </div>
          {isDone() ? (
            <div className="flex justify-between gap-4 max-w-lg">
              <p className="text-2xl text-highlight">
                {isTie() ? "Tie" : isFemaleSideWinner() ? "Winner" : "Loser"}{" "}
                {roundStats.totalFemalePower}
              </p>
              <p className="text-highlight">vs</p>
              <p className="text-2xl text-highlight">
                {roundStats.totalMalePower}{" "}
                {isTie() ? "Tie" : isFemaleSideWinner() ? "Loser" : "Winner"}
              </p>
            </div>
          ) : null}
        </>
      ) : null}
      <Image
        src="/images/archers-game.png"
        width={888}
        height={500}
        alt="Archers Game"
      />
      <div className="flex items-center gap-4">
        <select
          value={powerUpAmount}
          onChange={handleGetAmount}
          id="powerUpAmount"
          name="powerUpAmount"
          className="block w-full px-4 py-2 mt-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
        >
          {Array.from(
            { length: MAX_ITERATIONS },
            (_, i) => (i + 1) * MINIMUM_AMOUNT
          ).map((number) => (
            <option key={number} value={number}>
              {number}
            </option>
          ))}
        </select>
        <p className="mt-4 text-highlight">BOW</p>
      </div>
      {isConnected ? (
        <>
          <div className="flex justify-between gap-4 md:gap-6 max-w-lg py-4">
            <button
              onClick={() => handlePowerUp(POWER_UP_TYPE.seaCreatures)}
              className="bg-primary text-white font-bold py-2 px-4 rounded flex items-center"
              disabled={isDone()}
            >
              Power Up Male
              {isMalePowerUping && (
                <FaSpinner className="ml-2 animate-spin text-white w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => handlePowerUp(POWER_UP_TYPE.female)}
              className="bg-primary text-gray-700 font-bold py-2 px-4 rounded flex items-center"
              disabled={isDone()}
            >
              Power Up Female
              {isFemalePowerUping && (
                <FaSpinner className="ml-2 animate-spin text-white w-5 h-5" />
              )}
            </button>
          </div>
          {playerStats ? (
            <div className="flex justify-between gap-4 md:gap-6">
              <div>
                <p className="text-highlight">
                  Your Male Power:{" "}
                  <span className="text-highlight">
                    {playerStats.totalMalePower
                      ? playerStats.totalMalePower.toString()
                      : 0}
                  </span>
                </p>
                <p className="text-highlight">
                  Your Male Spent:{" "}
                  <span className="text-highlight">
                    {playerStats.totalMaleSpent
                      ? formatEther(playerStats.totalMaleSpent?.toString())
                      : 0}{" "}
                    BOW
                  </span>
                </p>
              </div>
              <div>
                <p className="text-highlight">
                  Your Female Power:{" "}
                  <span className="text-highlight">
                    {playerStats.totalFemalePower
                      ? playerStats.totalFemalePower.toString()
                      : 0}
                  </span>
                </p>
                <p className="text-highlight">
                  Your Female Spent:{" "}
                  <span className="text-highlight">
                    {playerStats.totalFemaleSpent
                      ? formatEther(playerStats.totalFemaleSpent?.toString())
                      : 0}{" "}
                    BOW
                  </span>
                </p>
              </div>
            </div>
          ) : null}
          {isDone() ? (
            <>
              <button
                onClick={() => handleClaimReward()}
                className="p-2 bg-secondary rounded mt-4 flex items-center"
                disabled={isClaiming}
              >
                Claim Reward
                {isClaiming && (
                  <FaSpinner className="ml-2 animate-spin text-white w-5 h-5" />
                )}
              </button>
              {isGameOwner() && (
                <>
                  <button
                    onClick={() => handleEndRound()}
                    className="p-2 bg-secondary rounded mt-4 flex items-center"
                    disabled={isEndRounding}
                  >
                    End Round
                    {isEndRounding && (
                      <FaSpinner className="ml-2 animate-spin text-white w-5 h-5" />
                    )}
                  </button>

                  {/* <button
                onClick={() => handleStartNewRound()}
                className="p-2 bg-secondary rounded mt-4 flex items-center"
                disabled={isStartNewRounding}
              >
                Start New Round
                {isStartNewRounding && (
                  <FaSpinner className="ml-2 animate-spin text-white w-5 h-5" />
                )}
              </button> */}
                </>
              )}
            </>
          ) : null}
        </>
      ) : (
        <div className="mt-4">
          <ConnectButton />
        </div>
      )}
      {showHowToPlay ? (
        <Modal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)}>
          <div className="py-4">
            <p className="text-center text-xl font-bold text-highlight py-2">
              How to Play
            </p>
            <ul style={{ overflowY: "scroll", height: "24rem" }}>
              <li className="p-2 text-highlight">
                1. Buy Kyudo Archer NFT from{" "}
                <a
                  href="https://app.youngparrotnft.com/core/collections/kyudo-archer"
                  className="text-white"
                  target="_blank"
                >
                  [YoungParrot]
                </a>
              </li>
              <li className="p-2 text-highlight">
                2. Your NFT Represent the sides you will be powering up example
                : If you hold #Female NFT you can only power up #Female, vice
                versa if you hold #Male NFT you can only power up #Male. However
                if you hold both, you can power up both up to your choice.
              </li>
              <li className="p-2 text-highlight">
                3. Each power up will cost {MINIMUM_AMOUNT} $BOW and{" "}
                {MINIMUM_AMOUNT} $BOW will then send to the reward pool. The
                highest power NFT side will be the winner and the reward ratio
                is depending on how many times you power up the NFT.
              </li>
              <li className="p-2 text-highlight">
                4. Player can &quot;Power Up&quot; up to{" "}
                {MAX_ITERATIONS * MINIMUM_AMOUNT} $BOW per transaction.
              </li>
              <li className="p-2 text-highlight">
                5. Each power up will have a success rate as below
                <br />
                60% Common Power Up : + 1 Power
                <br />
                30% Excellent Power Up : + 2 Power
                <br />
                8.5% Rare Power Up : + 3 Power
                <br />
                1% Epic Power Up : + 10 Power
                <br />
                0.45% Master Power Up : + 100 Power
                <br />
                0.05% Mythical Power Up : +500 Power
              </li>
              <li className="p-2 text-highlight">
                6. Total power of both #Female & #Male will be hidden until the
                end of turn for the thrill and excitement of the games, only a
                total of $BOW pool will be shown. Users are only able to view
                your own total power up, therefore team discussion on{" "}
                <a
                  href="https://t.me/ArcherSwapDEX"
                  target="_blank"
                  className="text-white"
                >
                  [Telegram]
                </a>{" "}
                is very crucial on winning the game.
              </li>
              <li className="p-2 text-highlight">
                7. Reward Pool Distribution
                <br />
                80% will goes to winning NFT Team
                <br />
                10% will carry forward to the next round
                <br />
                10% Fees for maintenance and development
              </li>
            </ul>
          </div>
        </Modal>
      ) : null}
    </div>
  );
};

export default ArchersGameTemplate;
