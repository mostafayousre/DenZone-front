import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Sales Rep Doctors',
  description: 'Manage Sales Rep Doctors Leads'
}
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
    </>
  );
};

export default Layout;
