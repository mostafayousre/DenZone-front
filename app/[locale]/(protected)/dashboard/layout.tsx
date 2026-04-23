import PageTitle from "@/components/page-title";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DENTZONE",
  description: "DENTZONE Dashboard.",
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>
    {children}</>;
};

export default Layout;