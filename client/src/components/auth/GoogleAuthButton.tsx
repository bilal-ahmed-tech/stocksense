import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import axios from "axios";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

interface GoogleAuthButtonProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export default function GoogleAuthButton({
  onSuccess,
  onError,
  disabled,
}: GoogleAuthButtonProps) {
  const { mutate: googleAuth, isPending } = useGoogleAuth();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  if (!clientId) return null;

  function handleSuccess(response: CredentialResponse) {
    if (!response.credential) {
      onError("Google sign-in failed. Please try again.");
      return;
    }

    googleAuth(response.credential, {
      onSuccess,
      onError: (err) => {
        onError(
          axios.isAxiosError(err)
            ? ((err.response?.data as { error?: string })?.error ??
                "Google sign-in failed")
            : "Google sign-in failed",
        );
      },
    });
  }

  return (
    <>
      <div
        className={`w-full flex justify-center ${disabled || isPending ? "opacity-40 pointer-events-none" : ""}`}
        aria-busy={isPending}
      >
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => onError("Google sign-in was cancelled or failed")}
          theme="filled_black"
          size="large"
          text="continue_with"
          shape="rectangular"
          width={384}
        />
      </div>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          or continue with email
        </span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>
    </>
  );
}
