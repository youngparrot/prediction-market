"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import Providers from "./providers";
import { ToastProvider } from "@/components/ToastProvider";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import i18n from "./i18n";
import Script from "next/script";
import HowToPredictModal from "@/components/HowToPredictModal";
import { useState } from "react";
import { GTM } from "@/utils/environment";

const I18nextProvider = dynamic(
  () => import("react-i18next").then((mod) => mod.I18nextProvider),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"] });

function RootLayout({ children }) {
  const [showHowToPredict, setShowHowToPredict] = useState(false);

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
        {/* Google Tag Manager Script */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM}');
            `,
          }}
        />

        {/* Google Tag Manager <noscript> Fallback */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <I18nextProvider i18n={i18n}>
          <Providers>
            <Nav setShowHowToPredict={setShowHowToPredict} />
            <main className="flex flex-col px-2 py-2 md:px-16 relative z-10">
              {children}
              <ToastProvider />
            </main>
            <Footer />
            <HowToPredictModal
              isOpen={showHowToPredict}
              onClose={() => setShowHowToPredict(false)}
            />
          </Providers>
          <ToastProvider />
        </I18nextProvider>
      </body>
    </html>
  );
}

export default RootLayout;
