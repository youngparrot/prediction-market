"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { FaTwitter, FaDiscord, FaTelegram } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="text-white px-2 pb-6 pt-16 md:px-16 md:pt-16">
      <div className="mx-auto flex justify-center gap-6 md:gap-12">
        {/* Logo and description */}
        <div className="flex justify-center flex-col">
          <div className="flex justify-center space-x-2">
            {/* Logo */}
            <Image
              width={60}
              height={60}
              src="/images/yp-prediction-market-logo.png"
              alt="YoungParrot Prediction Market Logo"
              className="rounded-full"
            />
          </div>
          <p className="mt-4 text-highlight">YoungParrot Prediction Market</p>
          {/* Social icons */}
          <div className="flex justify-center space-x-2 mt-4">
            <a
              href="https://x.com/youngparrotnft"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter className="w-6 h-6 text-highlight hover:text-white" />
            </a>
            <a
              href="https://t.me/youngparrotnft"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTelegram className="w-6 h-6 text-highlight hover:text-white" />
            </a>
            <a
              href="https://discord.gg/RxcC4x4gk2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDiscord className="w-6 h-6 text-highlight hover:text-white" />
            </a>
          </div>
        </div>
      </div>
      {/* Footer Bottom */}
      <div className="mt-8 pt-4 text-center text-highlight text-sm">
        © {currentYear} YoungParrot. All rights reserved.
      </div>
    </footer>
  );
}
