import axios from "axios";

const DEFAULT_DEV_API_URL = "http://localhost:8080/api/v1";

export const $api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || DEFAULT_DEV_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
