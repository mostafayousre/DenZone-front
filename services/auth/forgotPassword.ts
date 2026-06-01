import axiosInstance from "@/lib/AxiosInstance";

/**
 * Initiates the forget password process by sending an email request.
 * Endpoint: POST /api/Users/forget-password
 * Parameters: email (in query)
 */
export const forgetPassword = async (email: string): Promise<any> => {
  try {
    const response = await axiosInstance.post("/api/Users/forget-password", null, {
      params: { email },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Failed to send recovery email");
  }
};

/**
 * Verifies the OTP code sent to the user's email.
 * Endpoint: POST /api/Users/verify-otp
 * Parameters: email, code (in query)
 */
export const verifyOtp = async (email: string, code: string): Promise<any> => {
  try {
    const response = await axiosInstance.post("/api/Users/verify-otp", null, {
      params: { email, code },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Invalid OTP code");
  }
};

/**
 * Resets the password using the new password value.
 * Endpoint: POST /api/Users/reset-password
 * Parameters: email, newPassword (in query)
 */
export const resetPassword = async (email: string, newPassword: string): Promise<any> => {
  try {
    const response = await axiosInstance.post("/api/Users/reset-password", null, {
      params: { email, newPassword },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Failed to reset password");
  }
};

/**
 * Resends the OTP code to the user's email.
 * Endpoint: POST /api/Users/resend-otp
 * Parameters: email (in query)
 */
export const resendOtp = async (email: string): Promise<any> => {
  try {
    const response = await axiosInstance.post("/api/Users/resend-otp", null, {
      params: { email },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Failed to resend OTP");
  }
};
