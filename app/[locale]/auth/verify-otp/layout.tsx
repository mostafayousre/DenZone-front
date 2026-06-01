import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify OTP - Dashcode Next Js",
  description: "Verify the OTP code sent to your email.",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
