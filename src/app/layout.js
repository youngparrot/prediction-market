"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import Providers from "./providers";
import { ToastProvider } from "@/components/ToastProvider";
import Head from "next/head";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import i18n from "./i18n";

const I18nextProvider = dynamic(
  () => import("react-i18next").then((mod) => mod.I18nextProvider),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"] });

function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className}`}
        style={{
          backgroundImage: "url('/images/yp-prediction-market-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
          height: "100vh", // Set the height to cover the viewport or any desired size
          width: "100%", // Set the width to cover the full container>
        }}
      >
        <I18nextProvider i18n={i18n}>
          <Providers>
            <Nav />
            <main className="flex flex-col px-2 py-2 md:px-16 md:py-4 relative z-10">
              {children}
              <ToastProvider />
            </main>
            <Footer />
          </Providers>
          <ToastProvider />
        </I18nextProvider>
      </body>
    </html>
  );
}

export default RootLayout;
