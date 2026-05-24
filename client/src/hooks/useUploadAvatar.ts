import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { updateUser } from "@/features/auth/authSlice";
import type { AppDispatch } from "@/app/store";

export function useUploadAvatar() {
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      return api
        .post<{ success: true; data: { avatar: string } }>(
          "/upload/avatar",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        )
        .then((r) => r.data.data);
    },
    onSuccess: (data) => {
      dispatch(updateUser({ avatar: data.avatar }));
      toast.success("Avatar updated");
    },
    onError: () => {
      toast.error("Failed to upload avatar");
    },
  });
}