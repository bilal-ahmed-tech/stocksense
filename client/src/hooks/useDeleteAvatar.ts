import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { updateUser } from "@/features/auth/authSlice";
import type { AppDispatch } from "@/app/store";

export function useDeleteAvatar() {
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: () => api.delete("/upload/avatar").then((r) => r.data),
    onSuccess: () => {
      dispatch(updateUser({ avatar: null }));
      toast.success("Avatar removed");
    },
    onError: () => {
      toast.error("Failed to remove avatar");
    },
  });
}