import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Doctors',
  description: 'Doctors Page'
}
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
    </>
  );
};

export default Layout;
