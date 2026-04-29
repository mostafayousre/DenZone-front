import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2, Eye, Image as ImageIcon } from "lucide-react";
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
      {/* زر العرض - View Details */}
      <Link
  href={`/dashboard/product-list/${row.original.id}`} 
  className="p-2 text-primary bg-primary/10 rounded-full hover:bg-primary hover:text-white transition-all"
  title={t("view")}
>
  <Eye className="w-4 h-4" />
</Link>

      {/* زر التعديل - Edit */}
      <Link
        href={`/dashboard/edit-product/${row.original.id}`}
        className="p-2 text-info bg-info/10 rounded-full hover:bg-info hover:text-white transition-all"
        title={t("edit")}
      >
        <SquarePen className="w-4 h-4" />
      </Link>

      {/* زر الحذف - Delete */}
      <button
        onClick={() => row.original.id && handleDelete(row.original.id)}
        className="p-2 text-destructive bg-destructive/10 rounded-full hover:bg-destructive hover:text-white transition-all"
        title={t("delete")}
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
      accessorKey: "images",
      header: isArabic ? "الصورة" : "Image",
      cell: ({ row }) => {
        const hasImage = row.original.images && row.original.images.length > 0;
        return (
          <div className="w-12 h-12 rounded-md overflow-hidden border border-default-200 flex items-center justify-center bg-slate-50">
            {hasImage ? (
              <img 
                src={row.original.images[0]} 
                alt={isArabic ? row.original.productArabicName : row.original.productName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-slate-300" />
            )}
          </div>
        );
      },
    },
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
    {
      accessorKey: "isPopular",
      header: isArabic ? "شائع" : "Popular",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.original.isPopular ? "bg-success/20 text-success" : "bg-red-500 text-white"}`}>
          {row.original.isPopular ? "yes" : "No"}
        </span>
      ),
    },
  ];

  if (userRole === "Admin") {
    columns.push({
      id: "actions",
      header: isArabic ? "الإجراءات" : "Actions",
      cell: ({ row }) => <ActionCell row={row} refresh={refresh} t={t} />,
    });
  }

  return columns;
};