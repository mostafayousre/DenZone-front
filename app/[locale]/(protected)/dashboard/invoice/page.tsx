"use client";

import UserInvoicesTable from "@/components/partials/UserInvoicesTable";
import { useSearchParams } from "next/navigation";

const EcomInvoice = () => {
  const searchParams = useSearchParams();
  const userId = searchParams ? searchParams.get("userId") : null;

  return (
    <div className="p-6">
      {userId ? (
        <UserInvoicesTable userId={userId} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border/50 text-center space-y-4">
          <p className="text-xl font-semibold text-muted-foreground">User ID not found</p>
          <p className="text-sm text-muted-foreground/60">Please navigate to this page from the User Management dashboard.</p>
        </div>
      )}
    </div>
  );
};

export default EcomInvoice;
