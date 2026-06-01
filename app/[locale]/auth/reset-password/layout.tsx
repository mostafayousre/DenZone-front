import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password - Dashcode Next Js",
  description: "Reset your account password.",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
