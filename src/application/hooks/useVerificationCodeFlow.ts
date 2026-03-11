"use client";

import { useState } from "react";
import { sileo } from "sileo";
import { useAuth } from "./useAuth";
import { describeApiError } from "../../lib/errors/apiErrorMessage";

type UseVerificationCodeFlowOptions = {
  onVerified?: (result: { hasActiveSession: boolean }) => Promise<void> | void;
};

export function useVerificationCodeFlow(options?: UseVerificationCodeFlowOptions) {
  const { loadMe, resendVerification, verify } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const open = (nextEmail: string) => {
    setEmail(nextEmail.trim());
    setCode("");
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setCode("");
  };

  const submit = async () => {
    const trimmedCode = code.trim();
    if (trimmedCode.length !== 8) {
      sileo.error({
        title: "Invalid code",
        description: "Verification codes must contain 8 characters.",
      });
      return;
    }

    setIsVerifying(true);
    try {
      await verify({ email, code: trimmedCode });
      let hasActiveSession = true;
      try {
        await loadMe();
      } catch {
        hasActiveSession = false;
      }
      sileo.success({
        title: "Email verified",
        description: "Your account has been verified successfully.",
      });
      close();
      await options?.onVerified?.({ hasActiveSession });
    } catch (error: unknown) {
      sileo.error({
        title: "Verification failed",
        description: describeApiError(
          error,
          "The verification code could not be confirmed. Check the code and try again.",
        ),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resend = async () => {
    setIsResending(true);
    try {
      await resendVerification({ email });
      sileo.success({
        title: "Code sent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: unknown) {
      sileo.error({
        title: "Resend failed",
        description: describeApiError(
          error,
          "A new verification code could not be sent right now.",
        ),
      });
    } finally {
      setIsResending(false);
    }
  };

  return {
    isOpen,
    email,
    code,
    isVerifying,
    isResending,
    open,
    close,
    setCode,
    submit,
    resend,
  };
}
