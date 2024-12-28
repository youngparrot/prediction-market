import axios from "axios";
import { PREDICTION_MARKET_API } from "./environment";

export async function createPrediction(
  question,
  answers,
  endDate,
  createdBy,
  rules
) {
  const url = `${PREDICTION_MARKET_API}/api/createPrediction`;
  try {
    const response = await axios.post(url, {
      question,
      answers: answers,
      endDate,
      createdBy,
      rules,
    });
    return response.data;
  } catch (error) {
    console.error("Error posting user:", error);
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
