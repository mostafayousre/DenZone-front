import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Add Flash Sale',
  description: 'Add Flash Sale Page'
}
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
    </>
  );
};

export default Layout;
