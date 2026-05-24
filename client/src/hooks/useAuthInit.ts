import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "@/lib/axios";
import { setCredentials, clearCredentials } from "@/features/auth/authSlice";
import type { AppDispatch, RootState } from "@/app/store";
import type { User } from "@/types";

export function useAuthInit() {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(false);
      return;
    }

    api
      .post<{ data: { accessToken: string } }>("/auth/refresh")
      .then((r) => {
        const accessToken = r.data.data.accessToken;
        return api
          .get<{ data: { user: User } }>("/auth/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          .then((userRes) => {
            dispatch(
              setCredentials({
                user: userRes.data.data.user,
                accessToken,
              })
            );
          });
      })
      .catch(() => {
        dispatch(clearCredentials());
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch, isAuthenticated]);

  return { isLoading };
}