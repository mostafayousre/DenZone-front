import LayoutProvider from "@/providers/layout.provider";
import LayoutContentProvider from "@/providers/content.provider";
import DashCodeSidebar from '@/components/partials/sidebar'
import DashCodeFooter from '@/components/partials/footer'
import ThemeCustomize from '@/components/partials/customizer'
import DashCodeHeader from '@/components/partials/header'
import { PermissionsProvider } from "@/providers/permissions-provider";
import PermissionGuard from "@/components/PermissionGuard";

const layout = async ({ children }: { children: React.ReactNode }) => {

    return (
        <PermissionsProvider>
            <LayoutProvider >
                <ThemeCustomize />
                <DashCodeHeader />
                <DashCodeSidebar />
                <LayoutContentProvider>
                    <PermissionGuard>
                        {children}
                    </PermissionGuard>
                </LayoutContentProvider>
                <DashCodeFooter />
            </LayoutProvider>
        </PermissionsProvider>
    )
};

export default layout;

