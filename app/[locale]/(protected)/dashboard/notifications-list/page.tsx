import React from 'react';
import { useTranslations } from "next-intl";
import NotificationsTable from './components/NotificationsTable';

function NotificationsListPage() {
    const t = useTranslations("NotificationsList");
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-default-900 dark:text-default-100 px-1">
                {t("title")}
            </h1>
            <NotificationsTable/>
        </div>
    );
}

export default NotificationsListPage;
