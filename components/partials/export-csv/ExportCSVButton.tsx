"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import useDownloadCsv from "@/services/products/csv/downloadCSV";
import { useTranslations } from "next-intl";

export function ExportCSVButton() {
  const t = useTranslations("exportFile");
  const { loading, error, downloadCSV } = useDownloadCsv();

  const handleClick = async () => {
    try {
      await downloadCSV();
      if (!error) {
        toast.success(t("fileDownloaded"));
      } else {
        throw new Error(error);
      }
    } catch (e) {
      toast.error(t("fileDownloadError"));
    }
  };

  return (
    <Button
      size="md"
      variant="outline"
      onClick={handleClick}
      disabled={loading}
      className="gap-2"
    >
      <FileDown className="w-4 h-4" />
      {loading ? `${t("Exporting")}...` : t("exportFile")}
    </Button>
  );
}