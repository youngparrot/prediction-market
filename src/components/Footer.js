"use client";

import {
  FaTwitter,
  FaTelegramPlane,
  FaDiscord,
  FaEnvelope,
  FaRegCopy,
} from "react-icons/fa";

import { motion } from "framer-motion";
import { formatTokenAddress } from "@/utils/format";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleCopy = (address) => {
    navigator.clipboard.writeText(address);
    toast.info("Copied");
  };

  return (
    <footer className="text-white px-2 mt-4 pb-8 md:px-16 bg-black bg-opacity-50">
      <div className="pt-8 md:pt-8 relative mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
        {/* Logo and description */}
        <div>
          <div className="flex items-center space-x-2">
            {/* Logo */}
            <img
              src="/images/yp-prediction-market-logo.png"
              alt="YoungParrot Logo"
            />
          </div>
          <p className="mt-4 text-white">
            The world&apos;s digital marketplace for crypto collectibles,
            non-fungible tokens (NFTs), DEX aggregator, prediction market,
            decentralized token launchpad, dev tools, and games.
          </p>
          {/* Social icons */}
          <div className="flex space-x-4 mt-4">
            <motion.a
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              href="https://twitter.com/youngparrotnft"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter className="w-6 h-6" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              href="https://t.me/youngparrotnft"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTelegramPlane className="w-6 h-6" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              href="https://discord.gg/RxcC4x4gk2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDiscord className="w-6 h-6" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              href="mailto:support@youngparrotnft.com"
            >
              <FaEnvelope className="w-6 h-6" />
            </motion.a>
          </div>
        </div>

        {/* Presales Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-accent">
            Prediction Market
          </h3>
          <ul className="space-y-2">
            <li>
              <motion.a
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
                href="/"
                className="inline-block"
                title="Swap"
              >
                Home
              </motion.a>
            </li>
            <li>
              <motion.a
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
                href="/create-prediction"
                className="inline-block"
                title="Create Prediction"
              >
                Create Prediction
              </motion.a>
            </li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-accent">Company</h3>
          <ul className="space-y-2">
            <li>
              <motion.a
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
                href="https://app.youngparrotnft.com"
                target="_blank"
                title="NFT Marketplace"
                className="inline-block"
              >
                NFT Marketplace
              </motion.a>
            </li>
            <li>
              <motion.a
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
                href="https://dex.youngparrotnft.com"
                target="_blank"
                title="DEX"
                className="inline-block"
              >
                DEX
              </motion.a>
            </li>
            <li>
              <motion.a
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
                href="https://token.youngparrotnft.com"
                target="_blank"
                title="Token Launchpad"
                className="inline-block"
              >
                Token Launchpad
              </motion.a>
            </li>
            <li>
              <motion.a
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
                href="https://tools.youngparrotnft.com"
                target="_blank"
                title="Dev Tools"
                className="inline-block"
              >
                Dev Tools
              </motion.a>
            </li>
            <li>
              <motion.a
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
                href="https://games.youngparrotnft.com"
                target="_blank"
                title="Games"
                className="inline-block"
              >
                <span>Games</span>
              </motion.a>
            </li>
          </ul>
        </div>
      </div>
      {/* Footer Bottom */}
      <div className="relative mt-8 pt-4 text-center text-gray-400 text-sm">
        2022-{currentYear} @ copyrights, all rights reserved.
      </div>
    </footer>
  );
}
