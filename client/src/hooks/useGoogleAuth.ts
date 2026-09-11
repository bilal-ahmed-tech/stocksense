import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { api } from "@/lib/axios";
import { setCredentials } from "@/features/auth/authSlice";
import type { AppDispatch } from "@/app/store";
import type { User } from "@/types";

interface AuthResponse {
  user: User;
  accessToken: string;
}

export function useGoogleAuth() {
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: (idToken: string) =>
      api
        .post<{ success: true; data: AuthResponse }>("/auth/google", { idToken })
        .then((r) => r.data.data),
    onSuccess: (data) => {
      dispatch(setCredentials(data));
    },
  });
}
