"use client";

import { FiGlobe, FiCheck, FiX } from "react-icons/fi";
// import CheckIcon from "@mui/icons-material/Check";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const LOCALES = {
  ENGLISH: {
    code: "en",
    name: "English",
  },
  ARABIC: {
    code: "ar",
    name: "العربية",
  },
  CHINESE: {
    code: "zh",
    name: "中文 (繁体)",
  },
  INDONESIAN: {
    code: "id",
    name: "Bahasa Indonesia",
  },
  SPANISH: {
    code: "es",
    name: "Española",
  },
  FRENCH: {
    code: "fr",
    name: "Français",
  },
  HINDI: {
    code: "hi",
    name: "हिंदी",
  },
  VIETNAMESE: {
    code: "vi",
    name: "Tiếng Việt",
  },
};

const LanguagesMenu = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const languages = Object.keys(LOCALES);
  const menuRef = useRef(null);

  useEffect(() => {
    const lang = localStorage.getItem("language") || LOCALES.ENGLISH.code;
    i18n.changeLanguage(lang);
  }, [i18n]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("language", code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Globe Icon Button */}
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center justify-center p-2 rounded-full text-gray-200 hover:bg-gray-700 focus:outline-none"
      >
        <FiGlobe className="h-7 w-7" aria-hidden="true" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center z-50 md:hidden">
          {/* Close Button */}
          <button
            onClick={toggleDropdown}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            <FiX className="h-8 w-8" />
          </button>
          <ul className="space-y-4 text-xl text-white">
            {languages.map((code) => {
              const lang = LOCALES[code];
              return (
                <li
                  key={lang.code}
                  onClick={() => selectLanguage(lang.code)}
                  className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-gray-700 rounded"
                >
                  <span>{lang.name}</span>
                  {i18n.language === lang.code && (
                    <FiCheck className="text-green-400" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Dropdown Menu for Desktop */}
      {isOpen && (
        <div className="hidden md:block absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 text-white z-50">
          <ul className="py-1">
            {languages.map((code) => {
              const lang = LOCALES[code];
              return (
                <li
                  key={lang.code}
                  onClick={() => selectLanguage(lang.code)}
                  className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-700"
                >
                  <span>{lang.name}</span>
                  {i18n.language === lang.code && (
                    <FiCheck className="text-green-400" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguagesMenu;
