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
import { forgetPassword } from "@/services/auth/forgotPassword";

const schema = z.object({
  email: z.string().min(1, { message: "Email is required." }).email({ message: "Your email is invalid." }),
});

type ForgotPassInput = z.infer<typeof schema>;

const ForgotPass = () => {
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPassInput>({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPassInput) => {
    startTransition(async () => {
      try {
        await forgetPassword(data.email);
        toast.success("Recovery OTP sent successfully!");
        
        // Wait 1.5 seconds, then redirect to the OTP verification page
        setTimeout(() => {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(data.email)}`);
        }, 1500);
      } catch (err: any) {
        toast.error(err.message || "Failed to send recovery email");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="font-medium text-default-600">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          disabled={isPending}
          {...register("email")}
          className={cn("h-[48px] text-sm text-default-900", {
            "border-destructive": errors.email,
          })}
        />
      </div>
      {errors.email && (
        <div className="text-destructive mt-2 text-sm">
          {errors.email.message}
        </div>
      )}

      <Button type="submit" fullWidth disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Sending..." : "Send recovery email"}
      </Button>
    </form>
  );
};

export default ForgotPass;
