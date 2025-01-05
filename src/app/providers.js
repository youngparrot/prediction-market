"use client";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  metaMaskWallet,
  walletConnectWallet,
  rainbowWallet,
  okxWallet,
  tokenPocketWallet,
  bitgetWallet,
  coinbaseWallet,
  trustWallet,
  coin98Wallet,
} from "@rainbow-me/rainbowkit/wallets";
// import { mainnet, base } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";
import { WALLET_CONNECT_PROJECT_ID } from "@/utils/environment";

// Define Core chain
const coreChain = {
  id: 1116,
  name: "Core",
  network: "core",
  nativeCurrency: {
    decimals: 18,
    name: "Core",
    symbol: "CORE",
  },
  rpcUrls: {
    default: {
      http: [
        "https://rpc.coredao.org",
        "https://rpc.ankr.com/core",
        "https://rpc-core.icecreamswap.com",
      ],
    },
    public: {
      http: [
        "https://rpc.coredao.org",
        "https://rpc.ankr.com/core",
        "https://rpc-core.icecreamswap.com",
      ],
    },
  },
  blockExplorers: {
    default: { name: "CoreScan", url: "https://scan.coredao.org" },
  },
  testnet: false,
};

// Define chains
const chains = [coreChain];

const config = getDefaultConfig({
  appName: "YoungParrot Prediction Market",
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains,
  wallets: [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, walletConnectWallet, rainbowWallet],
    },
    {
      groupName: "Others",
      wallets: [
        coinbaseWallet,
        okxWallet,
        tokenPocketWallet,
        bitgetWallet,
        trustWallet,
        coin98Wallet,
      ],
    },
  ],
  ssr: true, // If you're using server-side rendering
});

// Create React Query client
const queryClient = new QueryClient();

export default function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
