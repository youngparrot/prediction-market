"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import LanguageMenu from "./LanguageMenu";
import { useTranslation } from "react-i18next";

export default function Nav() {
  const { t } = useTranslation();
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
    <div className="mb-8 pb-1 flex justify-between gap-4 sticky top-0 z-20">
      <Link href="/">
        <Image
          width={60}
          height={60}
          src="/images/yp-prediction-market-logo.png"
          alt="YoungParrot Prediction Market Logo"
          className="rounded-full"
        />
      </Link>
      <div className="flex gap-4 items-center hidden md:flex">
        {/* <Link
          href="/"
          className="px-3 py-2 text-metallic rounded-md hover:text-white transition-all"
        >
          DEX
        </Link> */}
        {/* <LanguageMenu /> */}
        <ConnectButton />
      </div>
      <div className="relative md:hidden">
        {/* Toggle Button (Sandwich Icon) */}
        <button
          onClick={toggleMenu}
          className="text-2xl p-3 text-gray-700 md:hidden"
        >
          <FaBars />
        </button>

        {/* Overlay (appears when menu is open) */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-primary bg-opacity-50 z-40"
            onClick={closeMenu}
          ></div>
        )}

        {/* Side Menu - Hidden by default, visible when `isOpen` is true */}
        <div
          id="side-menu"
          className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out md:hidden`}
        >
          {/* Menu Items */}
          <nav className="p-5 space-y-4">
            {/* <a href="/" className="block text-lg font-semibold text-purple-700">
              DEX
            </a> */}
            {/* <LanguageMenu /> */}
            <ConnectButton />
          </nav>
        </div>
      </div>
    </div>
  );
}
