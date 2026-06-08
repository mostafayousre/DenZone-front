import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { formatDateToDMY } from "@/utils";
import { Link } from "@/i18n/routing";

const ViewInvoiceAction = ({ row }: { row: any }) => {
  const invoice = row.original;

  const handleClick = () => {
    sessionStorage.setItem("selectedInvoice", JSON.stringify(invoice));
  };

  return (
    <Link
      href="/dashboard/reports/invoices/details"
      onClick={handleClick}
      className="flex items-center p-2 text-warning hover:text-warning-foreground bg-warning/20 hover:bg-warning duration-200 transition-all rounded-full cursor-pointer"
      title="View Details"
    >
      <Eye className="w-4 h-4" />
    </Link>
  );
};

export const baseColumns = ({refresh} : {refresh: () => void}) : ColumnDef<any>[] => [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice Number",
    cell: ({ row }) => <span>{row.getValue("invoiceNumber")}</span>,
  },
  {
    accessorKey: "userName",
    header: "Doctor",
    cell: ({ row }) => {
      const name = row.original.userName;
      return (
        <div className="font-medium text-card-foreground/80">
          <span className="text-sm text-default-600 whitespace-nowrap">
            {name ?? "Unknown User"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "cashPaid",
    header: "Cash Paid",
    cell: ({ row }) => {
      return <span>{row.getValue("cashPaid")}</span>;
    },
  },
  {
    accessorKey: "creditUsed",
    header: "Credit Used",
    cell: ({ row }) => {
      return <span>{row.getValue("creditUsed")}</span>;
    },
  },  {
    accessorKey: "coupon",
    header: "coupon",
    cell: ({ row }) => {
      return <span>{row.getValue("coupon")}</span>;
    },
  },  {
    accessorKey: "shippingFees",
    header: "Shipping Fees",
    cell: ({ row }) => {
      return <span>{row.getValue("shippingFees")}</span>;
    },
  },
  {
    accessorKey: "totalAmountAfter",
    header: "Total Amount",
    cell: ({ row }) => {
      return <span>{row.getValue("totalAmountAfter")}</span>;
    },
  },
  {
    accessorKey: "invoiceDate",
    header: "Invoice Date",
    cell: ({ row }) => {
      return <span>{formatDateToDMY(row.original.invoiceDate)}</span>;
    },
  },
  {
    id: "actions",
    accessorKey: "action",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <ViewInvoiceAction row={row} />
        </div>
      );
    },
  },
];
