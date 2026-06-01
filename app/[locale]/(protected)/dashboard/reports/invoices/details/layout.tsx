import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Invoice Details',
    description: 'Invoice Details Page'
}
const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            {children}
        </>
    );
};

export default Layout;
