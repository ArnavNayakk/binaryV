import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

const cache = new Map();
const DEFAULT_STALE_TIME = 30 * 1000;
const DEFAULT_CACHE_TIME = 5 * 60 * 1000;

function setCache(key, data, cacheTime) {
  if (cache.has(key)) clearTimeout(cache.get(key).timeout);
  cache.set(key, {
    data,
    timestamp: Date.now(),
    timeout: setTimeout(() => cache.delete(key), cacheTime),
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryRequest(
  error,
  originalRequest,
  baseDelay = 200,
  maxRetries = 3
) {
  if (!originalRequest) return Promise.reject(error);
  originalRequest._retrying = originalRequest._retrying || 0;
  if (originalRequest._retrying >= maxRetries) return Promise.reject(error);
  originalRequest._retrying += 1;
  const delay = baseDelay * Math.pow(2, originalRequest._retrying - 1);
  await wait(delay);
  return api(originalRequest);
}

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    console.log("this is access token", token);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error || !error.config) return Promise.reject(error);
    const originalRequest = error.config;
    const status = error.response?.status;

    // if (status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;
    //   try {
    //     const refreshResponse = await axios.post(
    //       `http://localhost:4000/api/auth/refresh`,
    //       {},
    //       { withCredentials: true }
    //     );
    //     const newAccessToken = refreshResponse?.data?.accessToken;
    //     if (!newAccessToken) throw new Error("No access token returned");

    //     Cookies.set("accessToken", newAccessToken);
    //     api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
    //     originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

    //     return api(originalRequest);
    //   } catch (refreshError) {
    //     Cookies.remove("accessToken");
    //     window.location.href = "/login";
    //     return Promise.reject(refreshError);
    //   }
    // }

    if (status >= 500 || status === 429) {
      return retryRequest(error, originalRequest);
    }

    return Promise.reject(error);
  }
);

api.cachedGet = async function (
  url,
  { staleTime = DEFAULT_STALE_TIME, cacheTime = DEFAULT_CACHE_TIME } = {}
) {
  const cached = cache.get(url);

  if (cached && Date.now() - cached.timestamp < staleTime) {
    return cached.data;
  }

  if (cached) {
    api
      .get(url)
      .then((data) => setCache(url, data, cacheTime))
      .catch(() => {});
    return cached.data;
  }

  const data = await api.get(url);
  setCache(url, data, cacheTime);
  return data;
};

const mutationMethods = ["post", "put", "patch", "delete"];

mutationMethods.forEach((method) => {
  const original = api[method];

  api[method] = async function (url, ...args) {
    const result = await original.call(api, url, ...args);

    const relatedGetUrl = url.split("?")[0];
    const cachedKeys = Array.from(cache.keys()).filter((key) =>
      key.includes(relatedGetUrl)
    );

    cachedKeys.forEach(async (key) => {
      try {
        const freshData = await api.get(key);
        setCache(key, freshData, DEFAULT_CACHE_TIME);
        console.log(`Cache Auto-updated GET cache for: ${key}`);
      } catch (e) {
        console.warn(`Cache Failed to update cache for: ${key}`);
      }
    });

    return result;
  };
});

export default api;
