import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { SquarePen } from "lucide-react";
import { formatDateToDMY } from "@/utils";
import { Price } from "@/types/price";
import { UpdatePriceModal } from "./UpdatePriceModal";

const ActionCell = ({
  row,
  refresh,
  t,
}: {
  row: { original: Price };
  refresh: () => void;
  t: (key: string) => string;
}) => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setIsUpdateModalOpen(true)}
        className="flex items-center p-2 text-info hover:text-info-foreground bg-info/10 hover:bg-info duration-200 transition-all rounded-full"
        title={t("edit")}
      >
        <SquarePen className="w-4 h-4" />
      </button>

      <UpdatePriceModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        priceData={row.original}
        onSuccess={refresh}
      />
    </div>
  );
};

export const baseColumns = ({ t, refresh }: {
  t: (key: string) => string;
  refresh: () => void;
}): ColumnDef<Price>[] => [
  {
    accessorKey: "productName",
    header: t("productName"),
    cell: ({ row }) => {
      return (
        <div className="font-medium text-card-foreground/80">
          <div className="flex gap-3 items-center">
            <span className="text-sm text-default-600 whitespace-nowrap">
              {row.getValue("productName")}
            </span>
          </div>
        </div>
      );
    },
  },
  
  {
    accessorKey: "purchasePrice",
    header: t("purchasePrice"),
    cell: ({ row }) => <span>{row.getValue("purchasePrice")}</span>,
  },
  {
    accessorKey: "salesPrice",
    header: t("salesPrice"),
    cell: ({ row }) => <span>{row.getValue("salesPrice")}</span>,
  },{
  accessorKey: "discountRate",
  header: t("discount"),
  cell: ({ row }) => <span>{row.getValue("discountRate")}%</span>,
  },
  {
    accessorKey: "stockQuantity",
    header: t("stockQuantity"),
    cell: ({ row }) => {
      return <span>{row.original?.stockQuantity}</span>;
    },
  },
  {
    accessorKey: "maxQuantity",
    header: t("maxQuantity"),
    cell: ({ row }) => {
      return <span>{row.original?.maxQuantity}</span>;
    },
  },
  {
    accessorKey: "creationDate",
    header: t("createdAt"),
    cell: ({ row }) => {
      return <span>{formatDateToDMY(row.original.creationDate)}</span>;
    },
  },

  {
    id: "actions",
    header: t("actions"),
    cell: ({ row }) => <ActionCell row={row} refresh={refresh} t={t} />,
  },
];
