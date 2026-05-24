import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { clearCredentials } from "@/features/auth/authSlice";
import { queryClient } from "@/lib/queryClient";
import { disconnectSocket } from "@/lib/socket";
import type { AppDispatch } from "@/app/store";

export function useLogout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSettled: () => {
      dispatch(clearCredentials());
      queryClient.clear();
      disconnectSocket();
      navigate("/login");
    },
  });
}