export const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

export const PREDICTION_MARKET_APP =
  process.env.NEXT_PUBLIC_PREDICTION_MARKET_APP;

export const PREDICTION_MARKET_API =
  process.env.NEXT_PUBLIC_PREDICTION_MARKET_API;

export const GTM = process.env.NEXT_PUBLIC_GTM;

export const DEFAULT_CHAIN_ID = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;

export const NATIVE_TOKEN_ADDRESS =
  "0x0000000000000000000000000000000000000000";

export const environments = {
  [DEFAULT_CHAIN_ID]: {
    SCAN_URL: process.env.NEXT_PUBLIC_CORE_SCAN_URL,
    RPC: process.env.NEXT_PUBLIC_CORE_RPC_URL,
    NATIVE_TOKEN_SYMBOL: process.env.NEXT_PUBLIC_CORE_NATIVE_TOKEN_SYMBOL,
    NATIVE_TOKEN_IMAGE:
      "https://ypfile.myfilebase.com/ipfs/QmV9XWPiFf8HG4xwn6WbWxdjRRTcqCy1Gqhb3Wrqk9c62R",
    PREDICTION_MARKET_ADDRESS: {
      CORE: {
        tokenAddress: NATIVE_TOKEN_ADDRESS,
        image:
          "https://ypfile.myfilebase.com/ipfs/QmV9XWPiFf8HG4xwn6WbWxdjRRTcqCy1Gqhb3Wrqk9c62R",
        contract: process.env.NEXT_PUBLIC_CORE_PREDICTION_MARKET_ADDRESS,
      },
      USDT: {
        tokenAddress: process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS,
        image:
          "https://ypfile.myfilebase.com/ipfs/Qmchysx7eP2xMn9CvLeiVM4YCjNQGoSKcYq6rY2FUnkdj1",
        contract: process.env.NEXT_PUBLIC_USDT_PREDICTION_MARKET_ADDRESS,
      },
      YPC: {
        tokenAddress: process.env.NEXT_PUBLIC_YPC_TOKEN_ADDRESS,
        image:
          "https://ypfile.myfilebase.com/ipfs/Qmbw7YTAkRdSQGbGWBP8dApMAiET85opzW7zZa268EjEex",
        contract: process.env.NEXT_PUBLIC_YPC_PREDICTION_MARKET_ADDRESS,
      },
    },
    CREATION_FEE: process.env.NEXT_PUBLIC_CORE_CREATION_FEE,
    CREATION_SHARE_FEE_PERCENT:
      process.env.NEXT_PUBLIC_CORE_CREATION_SHARE_FEE_PERCENT,
    PLATFORM_FEE_PERCENT: process.env.NEXT_PUBLIC_CORE_PLATFORM_FEE_PERCENT,
  },
};
