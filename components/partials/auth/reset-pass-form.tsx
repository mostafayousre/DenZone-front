"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/components/navigation";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/services/auth/forgotPassword";

const schema = z
  .object({
    newPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string().min(1, { message: "Confirm password is required." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

type ResetPassInput = z.infer<typeof schema>;

const ResetPassForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const [newPasswordType, setNewPasswordType] = React.useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = React.useState("password");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  const toggleNewPasswordType = () => {
    setNewPasswordType((prev) => (prev === "password" ? "text" : "password"));
  };

  const toggleConfirmPasswordType = () => {
    setConfirmPasswordType((prev) => (prev === "password" ? "text" : "password"));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPassInput>({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPassInput) => {
    if (!email) {
      toast.error("Email is missing. Please request a new recovery email.");
      return;
    }
    startTransition(async () => {
      try {
        await resetPassword(email, data.newPassword);
        toast.success("Password reset successfully!");
        
        // Wait 1.5 seconds, then redirect to the login page
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } catch (err: any) {
        toast.error(err.message || "Failed to reset password");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="text-sm text-default-500 mb-2">
        Resetting password for: <span className="font-semibold text-default-800">{email || "your email"}</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword" className="font-medium text-default-600">
          New Password
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={newPasswordType}
            disabled={isPending}
            placeholder="Enter new password"
            {...register("newPassword")}
            className={cn("h-[48px] text-sm text-default-900 pr-10", {
              "border-destructive": errors.newPassword,
            })}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer"
            onClick={toggleNewPasswordType}
          >
            {newPasswordType === "password" ? (
              <Icon icon="heroicons:eye" className="w-5 h-5 text-default-400" />
            ) : (
              <Icon
                icon="heroicons:eye-slash"
                className="w-5 h-5 text-default-400"
              />
            )}
          </div>
        </div>
      </div>
      {errors.newPassword && (
        <div className="text-destructive mt-2 text-sm">
          {errors.newPassword.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="font-medium text-default-600">
          Confirm New Password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={confirmPasswordType}
            disabled={isPending}
            placeholder="Confirm new password"
            {...register("confirmPassword")}
            className={cn("h-[48px] text-sm text-default-900 pr-10", {
              "border-destructive": errors.confirmPassword,
            })}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer"
            onClick={toggleConfirmPasswordType}
          >
            {confirmPasswordType === "password" ? (
              <Icon icon="heroicons:eye" className="w-5 h-5 text-default-400" />
            ) : (
              <Icon
                icon="heroicons:eye-slash"
                className="w-5 h-5 text-default-400"
              />
            )}
          </div>
        </div>
      </div>
      {errors.confirmPassword && (
        <div className="text-destructive mt-2 text-sm">
          {errors.confirmPassword.message}
        </div>
      )}

      <Button type="submit" fullWidth disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
};

export default ResetPassForm;
