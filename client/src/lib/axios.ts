import axios from "axios";
import { store } from "@/app/store";
import { updateAccessToken, clearCredentials } from "@/features/auth/authSlice";
import { queryClient } from "@/lib/queryClient";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(err: unknown, token: string | null) {
  pendingQueue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest?.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest!);
      });
    }

    originalRequest!._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{ data: { accessToken: string } }>(
        `${import.meta.env.VITE_API_URL as string}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const newToken = data.data.accessToken;
      store.dispatch(updateAccessToken(newToken));
      processQueue(null, newToken);
      if (originalRequest?.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return api(originalRequest!);
    } catch (refreshError) {
      processQueue(refreshError, null);
      store.dispatch(clearCredentials());
      queryClient.clear();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);