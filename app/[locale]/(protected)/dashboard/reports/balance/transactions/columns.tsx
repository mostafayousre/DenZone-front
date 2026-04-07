import { ColumnDef } from "@tanstack/react-table";
import { formatDateToDMY } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const baseColumns = ({
                              refresh,
                              type,
                            }: {
  refresh: () => void;
  type: "account" | "transaction" | "summary";
}): ColumnDef<any>[] => {
  if (type === "account") {
    return [
      {
        accessorKey: "fullName",
        header: "Username",
        cell: ({ row }) => <span>{row.getValue("fullName")}</span>,
      },
      {
        accessorKey: "accountType",
        header: "Account Type",
        cell: ({ row }) => {
          const accountType = row.original.accountType;
          return (
              <span className="text-sm text-default-600 whitespace-nowrap">
              {accountType ?? "Unknown Type"}
            </span>
          );
        },
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ row }) => <span>{row.getValue("balance")}</span>,
      },
      {
        accessorKey: "creditLimit",
        header: "Credit Limit",
        cell: ({ row }) => <span>{row.getValue("creditLimit")}</span>,
      },
      {
        accessorKey: "transactionCount",
        header: "Transaction Count",
        cell: ({ row }) => <span>{row.getValue("transactionCount")}</span>,
      },
      {
        accessorKey: "totalDeposits",
        header: "Total Deposits",
        cell: ({ row }) => <span>{row.getValue("totalDeposits")}</span>,
      },
      {
        accessorKey: "totalWithdrawals",
        header: "Total Withdrawals",
        cell: ({ row }) => <span>{row.getValue("totalWithdrawals")}</span>,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) =>
            row.original.createdAt ? (
                <span>{formatDateToDMY(row.original.createdAt)}</span>
            ) : (
                <span className="text-gray-500">No Date</span>
            ),
      },
    ];
  }

  if (type === "transaction") {
    return [
      {
        accessorKey: "userName",
        header: "Username",
        cell: ({ row }) => <span>{row.getValue("userName")}</span>,
      },
      {
        accessorKey: "transactionType",
        header: "Type",
        cell: ({ row }) => (
            <Badge
                className={cn(
                    "rounded-full px-3 py-1 text-xs",
                    row.getValue("transactionType") === "Deposit"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                )}
            >
              {row.getValue("transactionType")}
            </Badge>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => <span>{row.getValue("amount")}</span>,
      },
      {
        accessorKey: "orderNumber",
        header: "Order Number",
        cell: ({ row }) => (
            <span className="text-sm text-gray-700">
            {row.getValue("orderNumber") ?? "-"}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground max-w-xs line-clamp-2">
            {row.getValue("description")}
          </span>
        ),
      },
      {
        accessorKey: "transactionDate",
        header: "Transaction Date",
        cell: ({ row }) =>
            row.original.transactionDate ? (
                <span>{formatDateToDMY(row.original.transactionDate)}</span>
            ) : (
                <span className="text-gray-500">N/A</span>
            ),
      },
    ];
  }

  return []; 
};
