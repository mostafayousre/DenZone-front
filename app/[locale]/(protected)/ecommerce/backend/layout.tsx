import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DENTZONE",
  description: "DENTZONE dashboard.",
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
