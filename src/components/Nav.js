"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  // Function to toggle the menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Function to close the menu when clicking outside of it
  const closeMenu = () => {
    setIsOpen(false);
  };

  // Add event listener to detect clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the menu
      if (
        isOpen &&
        !document.getElementById("side-menu").contains(event.target)
      ) {
        closeMenu();
      }
    };

    // Add event listener when the menu is open
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener on component unmount or when `isOpen` changes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="mb-2 px-2 md:px-16 md:sticky top-0 z-50 bg-black bg-opacity-50">
      <div className="relative mx-auto flex justify-between gap-4">
        <div className="flex md:gap-8 gap-4 items-center">
          <a href="/" title="Home">
            <Image
              width={221}
              height={60}
              src="/images/yp-prediction-market-logo.png"
              alt="YoungParrot Prediction Market logo"
              priority
            />
          </a>
          <motion.a
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="font-bold text-white flex items-center gap-1 flex-row cursor-pointer"
            href="/create-prediction"
            title="Create Prediction"
          >
            Create Prediction
          </motion.a>
        </div>
        <div className="flex gap-4 items-center hidden md:flex">
          <ConnectButton />
        </div>
        <div className="relative md:hidden">
          {/* Toggle Button (Sandwich Icon) */}
          <button
            onClick={toggleMenu}
            className="text-2xl p-3 text-white md:hidden"
          >
            <FaBars />
          </button>

          {/* Overlay (appears when menu is open) */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={closeMenu}
            ></div>
          )}

          {/* Side Menu - Hidden by default, visible when `isOpen` is true */}
          <div
            id="side-menu"
            className={`fixed top-0 left-0 w-64 h-full bg-gray-700 shadow-lg z-50 transform ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out md:hidden`}
          >
            {/* Menu Items */}
            <nav className="p-5 space-y-4">
              <ConnectButton />
            </nav>
          </div>
        </div>
      </div>
    </nav>
  );
}
