import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ProductType } from "@/types/product";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { useLocale } from "next-intl";
import useDeleteProductById from "@/services/products/deleteProductById";

const ActionCell = ({
  row,
  refresh,
  t,
}: {
  row: { original: ProductType };
  refresh: () => void;
  t: (key: string) => string;
}) => {
  const { loading, deleteProductById } = useDeleteProductById(); 

  const handleDelete = (id: string) => {
    const toastId = toast(t("warning"), {
      description: t("delete_product_confirmation"),
      action: (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.dismiss(toastId)}
          >
            {t("cancel")}
          </Button>
          <Button
            size="sm"
            className="bg-red-600 text-white"
            disabled={loading}
            onClick={async () => {
              toast.dismiss(toastId);
              const { success } = await deleteProductById(id);
              if (success) {
                toast.success(t("delete_product_success"));
                refresh(); 
              }
            }}
          >
            {t("Confirm")}
          </Button>
        </div>
      ),
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/dashboard/edit-product/${row.original.id}`}
        className="p-2 text-info bg-info/10 rounded-full hover:bg-info hover:text-white transition-all"
      >
        <SquarePen className="w-4 h-4" />
      </Link>
      <button
        onClick={() => row.original.id && handleDelete(row.original.id)}
        className="p-2 text-destructive bg-destructive/10 rounded-full hover:bg-destructive hover:text-white transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export const baseColumns = ({
  refresh,
  t,
}: {
  refresh: () => void;
  t: (key: string) => string;
  locale: string;
}): ColumnDef<ProductType>[] => {
  const userRole = Cookies.get("userRole");
  const locale = useLocale();
  const isArabic = locale === "ar";

  const columns: ColumnDef<ProductType>[] = [
    {
      accessorKey: isArabic ? "productArabicName" : "productName",
      header: isArabic ? "اسم المنتج" : "Product Name",
      cell: ({ row }) => {
        const name = isArabic
          ? row.original.productArabicName
          : row.original.productName;
        return (
          <span className="text-sm font-medium">{name || t("unknown")}</span>
        );
      },
    },
    {
      accessorKey: "productCode",
      header: isArabic ? "كود المنتج" : "Product Code",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.productCode}</span>
      ),
    },
    {
      accessorKey: isArabic ? "arabicPreef" : "preef",
      header: isArabic ? "الوصف" : "Product Pref",
      cell: ({ row }) => (
        <span className="text-sm">
          {(isArabic ? row.original.arabicPreef : row.original.preef) || "-"}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: isArabic ? "الفئة" : "Category",
      cell: ({ row }) => {
        const categoryName = isArabic
          ? row.original.category?.arabicName
          : row.original.category?.name;
        return (
          <span className="text-sm">{categoryName || t("unknown")}</span>
        );
      },
    },
  ];

  if (userRole === "Admin") {
    columns.push({
      id: "actions",
      header: isArabic ? "الإجراءات" : "Actions",
      cell: ({ row }) => (
        <ActionCell row={row} refresh={refresh} t={t} />
      ),
    });
  }

  return columns;
};