"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/components/navigation";
import { useSearchParams } from "next/navigation";
import { verifyOtp, resendOtp } from "@/services/auth/forgotPassword";

const schema = z.object({
  code: z.string().min(4, { message: "OTP code must be at least 4 characters." }),
});

type VerifyOtpInput = z.infer<typeof schema>;

const VerifyOtpForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const [isResending, startResendTransition] = React.useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: VerifyOtpInput) => {
    if (!email) {
      toast.error("Email is missing. Please request a new recovery email.");
      return;
    }
    startTransition(async () => {
      try {
        await verifyOtp(email, data.code);
        toast.success("OTP verified successfully!");
        
        setTimeout(() => {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      } catch (err: any) {
        toast.error(err.message || "Failed to verify OTP code");
      }
    });
  };

  const handleResend = () => {
    if (!email) {
      toast.error("Email is missing. Cannot resend OTP.");
      return;
    }
    startResendTransition(async () => {
      try {
        await resendOtp(email);
        toast.success("A new OTP code has been sent to your email!");
      } catch (err: any) {
        toast.error(err.message || "Failed to resend OTP");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="text-sm text-default-500 mb-2">
        Verification code sent to: <span className="font-semibold text-default-800">{email || "your email"}</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="code" className="font-medium text-default-600">
          OTP Code
        </Label>
        <Input
          id="code"
          type="text"
          disabled={isPending || isResending}
          placeholder="Enter the code sent to your email"
          {...register("code")}
          className={cn("h-[48px] text-sm text-default-900", {
            "border-destructive": errors.code,
          })}
        />
      </div>
      {errors.code && (
        <div className="text-destructive mt-2 text-sm">
          {errors.code.message}
        </div>
      )}

      <Button type="submit" fullWidth disabled={isPending || isResending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Verifying..." : "Verify Code"}
      </Button>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={handleResend}
          disabled={isPending || isResending}
          className="text-sm text-default-900 font-medium hover:underline disabled:opacity-50"
        >
          {isResending ? "Resending..." : "Resend OTP Code"}
        </button>
      </div>
    </form>
  );
};

export default VerifyOtpForm;
