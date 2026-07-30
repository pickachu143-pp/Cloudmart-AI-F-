import axios, { AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send the httpOnly JWT cookie automatically
  headers: { "Content-Type": "application/json" },
});

// Attach a bearer token from localStorage as a fallback auth path
// (useful when cookies are blocked, e.g. some Safari/embedded contexts).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cloudmart_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error messages so components can just read `err.message`.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message = error.response?.data?.message || error.message || "Something went wrong.";
    return Promise.reject(new Error(message));
  }
);
