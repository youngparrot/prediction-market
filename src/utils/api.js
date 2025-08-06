import axios from "axios";
import { DEFAULT_CHAIN_ID, PREDICTION_MARKET_API } from "./environment";

export async function createPrediction(
  question,
  answers,
  image,
  predictionCutoffDate,
  endDate,
  createdBy,
  rules,
  twitter,
  category,
  chainId,
  paymentToken
) {
  const url = `${PREDICTION_MARKET_API}/api/createPrediction`;
  const response = await axios.post(url, {
    question,
    answers: answers,
    image,
    predictionCutoffDate,
    endDate,
    createdBy,
    rules,
    twitter,
    category,
    chainId,
    paymentToken,
  });
  return response.data;
}

export async function createTransaction(
  predictionId,
  outcomeIndex,
  userAddress,
  amount,
  transactionId,
  chainId,
  paymentToken
) {
  const url = `${PREDICTION_MARKET_API}/api/transaction`;
  const response = await axios.post(url, {
    predictionId,
    outcomeIndex,
    userAddress,
    amount,
    transactionId,
    chainId,
    paymentToken,
  });
  return response.data;
}

export async function updatePrediction(predictionId, status) {
  const url = `${PREDICTION_MARKET_API}/api/updatePrediction`;
  const response = await axios.put(url, {
    predictionId,
    status,
  });
  return response.data;
}

export async function fetchPredictions({
  page = 1,
  limit = 20,
  id,
  status,
  category,
}) {
  let url = `${PREDICTION_MARKET_API}/api/fetchPredictions?page=${page}&limit=${limit}`;
  if (id) {
    url += `&id=${id}`;
  }
  if (status) {
    url += `&status=${status}`;
  }
  if (category && category !== "all") {
    url += `&category=${category}`;
  }

  const response = await axios.get(url, {});
  return response.data;
}

export async function postUser(userAddress, point, chainId) {
  const url = `${PREDICTION_MARKET_API}/api/user`;
  const response = await axios.post(url, {
    userAddress,
    point,
    chainId,
  });
  return response.data;
}

export async function fetchLeaderboard(
  userAddress = null,
  chainId = DEFAULT_CHAIN_ID
) {
  let url = `${PREDICTION_MARKET_API}/api/leaderboard?chainId=${chainId}`;
  if (userAddress) {
    url += `&userAddress=${userAddress}`;
  }

  const response = await axios.get(url);
  return response.data;
}

export async function fetchTransactions(
  type,
  predictionId,
  page = 1,
  limit = 20
) {
  let url = `${PREDICTION_MARKET_API}/api/transaction?type=${type}&page=${page}&limit=${limit}`;
  if (predictionId) {
    url += `&predictionId=${predictionId}`;
  }

  const response = await axios.get(url);
  return response.data;
}

export async function fetchUserPredictions(userAddress, chainId) {
  let url = `${PREDICTION_MARKET_API}/api/getUserPredictions?userAddress=${userAddress}&chainId=${chainId}`;

  const response = await axios.get(url);
  return response.data;
}

export async function fetchUserCreatedPredictions(userAddress, chainId) {
  let url = `${PREDICTION_MARKET_API}/api/getUserCreatedPredictions?chainId=${chainId}&userAddress=${userAddress}`;

  const response = await axios.get(url);
  return response.data;
}

export async function fetchUser(userAddress, chainId = DEFAULT_CHAIN_ID) {
  let url = `${PREDICTION_MARKET_API}/api/user?chainId=${chainId}&userAddress=${userAddress}`;

  const response = await axios.get(url);
  return response.data;
}

// Function to add to watchlist
export async function addToWatchlist(userAddress, predictionId, chainId) {
  let url = `${PREDICTION_MARKET_API}/api/watchlist`;

  const response = await axios.post(url, {
    userAddress,
    predictionId,
    chainId,
  });

  return response.data;
}

// Function to fetch user's watchlist
export async function fetchWatchlist(userAddress, chainId) {
  let url = `${PREDICTION_MARKET_API}/api/watchlist?chainId=${chainId}&userAddress=${userAddress}`;

  const response = await axios.get(url);
  return response.data;
}

// Function to fetch user's watchlist
export async function unWatchlist(userAddress, predictionId, chainId) {
  let url = `${PREDICTION_MARKET_API}/api/watchlist`;

  const response = await axios.delete(url, {
    data: {
      userAddress,
      predictionId,
      chainId,
    },
  });
  return response.data;
}

export async function uploadIpfs(file) {
  const formData = new FormData();
  formData.append("image", file);

  const url = `${PREDICTION_MARKET_API}/api/upload-ipfs`;

  const response = await axios.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.url;
}
