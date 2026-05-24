import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { api } from "@/lib/axios";
import { setCredentials } from "@/features/auth/authSlice";
import type { AppDispatch } from "@/app/store";
import type { User } from "@/types";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

export function useRegister() {
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      api
        .post<{ success: true; data: AuthResponse }>("/auth/register", payload)
        .then((r) => r.data.data),
    onSuccess: (data) => {
      dispatch(setCredentials(data));
    },
  });
}