import React from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import addProductsByExcel from "@/services/products/csv/addProductByExcel";

interface ExcelUploadButtonProps {
  onSuccess?: () => void;
}

const ExcelUploadButton: React.FC<ExcelUploadButtonProps> = ({ onSuccess }) => {
  const { loading, addProductsByExcel: uploadProducts } = addProductsByExcel();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload an Excel file (.xlsx or .xls)",
      });
      return;
    }

    const uploadToastId = toast.loading("Uploading Excel file...", {
      description: "Processing your product data...",
    });

    try {
      const result = await uploadProducts(file, true);
      toast.dismiss(uploadToastId);

      if (result.success) {
        if (result.hasFailedEntries) {
          toast.warning("Upload completed with issues", {
            description: (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    Some products were processed successfully, but some failed
                    validation.
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Failed entries have been downloaded as:{" "}
                  {result.failedEntriesFile}
                </div>
              </div>
            ),
            duration: 8000,
          });
        } else {
          toast.success("Excel upload successful!", {
            description: "All products were processed successfully.",
            icon: <CheckCircle className="w-4 h-4" />,
          });
        }

        onSuccess?.();
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      toast.dismiss(uploadToastId);
      toast.error("Upload failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to process Excel file",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = "";
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="excel-upload"
        accept=".xlsx,.xls"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={loading}
      />
      <Button
        size="md"
        color="success"
        disabled={loading}
        className="gap-2 bg-green-600 hover:bg-green-200 hover:text-green-800 hover:ring-green-300 text-white transition-colors duration-200"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <FileSpreadsheet className="w-4 h-4" />
            Import from Excel
          </>
        )}
      </Button>
    </div>
  );
};

export default ExcelUploadButton;