import axios from "axios";
import { PREDICTION_MARKET_API } from "./environment";

export async function createPrediction(
  question,
  answers,
  predictionCutoffDate,
  endDate,
  createdBy,
  rules
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
  amount
) {
  const url = `${PREDICTION_MARKET_API}/api/transaction`;
  try {
    const response = await axios.post(url, {
      predictionId,
      outcomeIndex,
      userAddress,
      amount,
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
  status = "active",
}) {
  let url = `${PREDICTION_MARKET_API}/api/fetchPredictions?page=${page}&limit=${limit}&status=${status}`;
  if (id) {
    url += `&id=${id}`;
  }

  try {
    const response = await axios.get(url, {});
    return response.data;
  } catch (error) {
    console.error("Error posting user:", error);
    return null;
  }
}
