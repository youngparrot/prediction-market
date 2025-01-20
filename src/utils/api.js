import axios from "axios";
import { PREDICTION_MARKET_API } from "./environment";

export async function createPrediction(
  question,
  answers,
  predictionCutoffDate,
  endDate,
  createdBy,
  rules,
  twitter,
  category
) {
  const url = `${PREDICTION_MARKET_API}/api/createPrediction`;
  try {
    const response = await axios.post(url, {
      question,
      answers: answers,
      predictionCutoffDate,
      endDate,
      createdBy,
      rules,
      twitter,
      category,
    });
    return response.data;
  } catch (error) {
    console.error("Error create prediction:", error);
    return null;
  }
}

export async function createTransaction(
  predictionId,
  outcomeIndex,
  userAddress,
  amount,
  transactionId
) {
  const url = `${PREDICTION_MARKET_API}/api/transaction`;
  try {
    const response = await axios.post(url, {
      predictionId,
      outcomeIndex,
      userAddress,
      amount,
      transactionId,
    });
    return response.data;
  } catch (error) {
    console.error("Error create prediction:", error);
    return null;
  }
}

export async function updatePrediction(predictionId, status) {
  const url = `${PREDICTION_MARKET_API}/api/updatePrediction`;
  try {
    const response = await axios.put(url, {
      predictionId,
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error update prediction:", error);
    return null;
  }
}

export async function fetchPredictions({
  page = 1,
  limit = 20,
  id,
  status,
  topic,
}) {
  let url = `${PREDICTION_MARKET_API}/api/fetchPredictions?page=${page}&limit=${limit}`;
  if (id) {
    url += `&id=${id}`;
  }
  if (status) {
    url += `&status=${status}`;
  }
  if (topic) {
    url += `&topic=${topic}`;
  }

  try {
    const response = await axios.get(url, {});
    return response.data;
  } catch (error) {
    console.error("Error posting user:", error);
    return null;
  }
}

export async function postUser(userAddress, volume) {
  const url = `${PREDICTION_MARKET_API}/api/user`;
  try {
    const response = await axios.post(url, {
      userAddress,
      volume: parseFloat(volume),
    });
    return response.data;
  } catch (error) {
    console.error("Error posting user:", error);
    return null;
  }
}

export async function fetchLeaderboard(userAddress = null) {
  let url = `${PREDICTION_MARKET_API}/api/leaderboard`;
  if (userAddress) {
    url += `?userAddress=${userAddress}`;
  }

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return null;
  }
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

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return null;
  }
}

export async function fetchUserPredictions(userAddress) {
  let url = `${PREDICTION_MARKET_API}/api/getUserPredictions?userAddress=${userAddress}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching user predictions:", error);
    return null;
  }
}

export async function fetchUserCreatedPredictions(userAddress) {
  let url = `${PREDICTION_MARKET_API}/api/getUserCreatedPredictions?userAddress=${userAddress}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching user predictions:", error);
    return null;
  }
}

export async function fetchUser(userAddress) {
  let url = `${PREDICTION_MARKET_API}/api/user?userAddress=${userAddress}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

// Function to add to watchlist
export async function addToWatchlist(userAddress, predictionId) {
  let url = `${PREDICTION_MARKET_API}/api/watchlist`;

  const response = await axios.post(url, {
    userAddress,
    predictionId,
  });

  return response.data;
}

// Function to fetch user's watchlist
export async function fetchWatchlist(userAddress) {
  let url = `${PREDICTION_MARKET_API}/api/watchlist?userAddress=${userAddress}`;

  const response = await axios.get(url);
  return response.data;
}

// Function to fetch user's watchlist
export async function unWatchlist(userAddress, predictionId) {
  let url = `${PREDICTION_MARKET_API}/api/watchlist`;

  const response = await axios.delete(url, {
    data: {
      userAddress,
      predictionId,
    },
  });
  return response.data;
}
