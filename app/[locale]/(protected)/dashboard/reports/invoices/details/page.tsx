"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Printer, Download } from "lucide-react";
import { formatDateToDMY } from "@/utils";

const formatAmount = (val: any) => {
  const num = Number(val);
  return isNaN(num)
    ? "0.00"
    : num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

const InvoiceDetailsPage = () => {
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("selectedInvoice");
      if (stored) {
        setInvoice(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load invoice data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // const downloadPDF = async () => {
  //   const element = document.getElementById("printable-invoice");
  //   if (!element || !invoice) return;

  //   try {
  //     // @ts-ignore
  //     const html2canvasModule = await import("html2canvas-pro");
  //     const html2canvas = html2canvasModule.default || html2canvasModule;
  //     // @ts-ignore
  //     const { jsPDF } = await import("jspdf");

  //     const opt = {
  //       scale: 2,
  //       useCORS: true,
  //       logging: false,
  //       ignoreElements: (el: Element) => {
  //         return el.classList.contains("no-print");
  //       }
  //     };

  //     const canvas = await html2canvas(element, opt);
  //     const imgData = canvas.toDataURL("image/jpeg", 0.98);

  //     const pdf = new jsPDF({
  //       orientation: "portrait",
  //       unit: "mm",
  //       format: "a4"
  //     });

  //     const imgWidth = 210; // A4 size width in mm
  //     const pageHeight = 295; // A4 size height in mm
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //     let heightLeft = imgHeight;
  //     let position = 0;

  //     pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  //     heightLeft -= pageHeight;

  //     while (heightLeft >= 0) {
  //       position = heightLeft - imgHeight;
  //       pdf.addPage();
  //       pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  //       heightLeft -= pageHeight;
  //     }

  //     pdf.save(`invoice-${invoice.invoiceNumber || 'details'}.pdf`);
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //   }
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border/50 text-center space-y-4">
        <p className="text-xl font-semibold text-muted-foreground">
          Invoice data not found
        </p>
        <p className="text-sm text-muted-foreground/60">
          Please navigate to this page from the Invoices Report table.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/reports/invoices")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="printable-invoice">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice,
          #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
            color: black !important;
          }
          .no-print,
          .no-print * {
            visibility: hidden !important;
            display: none !important;
          }
        }
      `}} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 no-print">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/reports/invoices")}
              className="cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => window.print()}
              className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
            {/* <Button
              variant="soft"
              color="success"
              size="sm"
              onClick={downloadPDF}
              className="cursor-pointer flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Download
            </Button> */}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-default-900">
              Invoice Details
            </h2>
            <p className="text-sm text-default-500 mt-0.5 font-mono">
              #{invoice.invoiceNumber}
            </p>
          </div>
        </div>
        {/* {invoice.totalAmount !== undefined && (
          <div className="text-right">
            <span className="text-xs text-default-500 uppercase block">
              Total Amount
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatAmount(invoice.totalAmount)}
            </span>
          </div>
        )} */}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice Summary */}
        <Card>
          <CardHeader className="border-b border-default-200">
            <CardTitle className="text-sm uppercase tracking-wider text-default-500">
              Invoice Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between items-start gap-4 text-sm">
              <span className="text-muted-foreground">Invoice Number:</span>
              <span
                className="font-semibold text-default-800 text-right break-all max-w-[250px]"
                title={invoice.invoiceNumber}
              >
                {invoice.invoiceNumber}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Invoice Date:</span>
              <span className="font-semibold text-default-800">
                {formatDateToDMY(invoice.invoiceDate)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Invoice Type:</span>
              <span className="font-semibold text-default-800">
                {invoice.invoiceType || "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Doctor & Order Details */}
        <Card>
          <CardHeader className="border-b border-default-200">
            <CardTitle className="text-sm uppercase tracking-wider text-default-500">
              Doctor & Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Doctor Name:</span>
              <span className="font-semibold text-default-800">
                {invoice.userName || "Unknown"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Number:</span>
              <span className="font-semibold text-default-800">
                {invoice.orderNumber || "-"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="font-semibold text-default-800">
                {invoice.paymentMethod || "-"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventories / Order Items */}
      {invoice.inventories && invoice.inventories.length > 0 ? (
        <div className="space-y-6">
          {invoice.inventories.map((inventory: any, invIndex: number) => (
            <Card key={inventory.inventoryId || invIndex}>
              <CardHeader className="border-b border-default-200 flex flex-row items-center justify-between gap-4 py-4">
                <CardTitle className="text-base font-semibold text-default-850">
                  {inventory.inventoryName || `Inventory #${invIndex + 1}`}
                </CardTitle>
                {inventory.totalAmount !== undefined && (
                  <div className="text-right">
                    <span className="text-xs text-default-500 mr-2 font-medium">Subtotal:</span>
                    <span className="font-bold text-default-900">
                      {formatAmount(inventory.totalAmount)}
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-default-100/80 border-b border-default-200">
                        <th className="p-4 text-default-700 font-semibold">
                          Product Name
                        </th>
                        <th className="p-4 text-default-700 font-semibold text-center w-24">
                          Qty
                        </th>
                        <th className="p-4 text-default-700 font-semibold text-center w-24">
                          Purchase Price
                        </th>
                        <th className="p-4 text-default-700 font-semibold text-center w-24">
                          Revenue Percentage
                        </th>
                        <th className="p-4 text-default-700 font-semibold text-right w-32">
                          Price
                        </th>
                        <th className="p-4 text-default-700 font-semibold text-right w-32">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-default-100">
                      {inventory.orderItems && inventory.orderItems.length > 0 ? (
                        inventory.orderItems.map((item: any, itemIndex: number) => (
                          <tr
                            key={itemIndex}
                            className="hover:bg-default-50/40 transition-colors"
                          >
                            <td
                              className="p-4 font-medium text-default-800"
                              title={item.productName}
                            >
                              {item.productName}
                            </td>
                            <td className="p-4 text-center text-default-600 font-semibold">
                              {item.quantity}
                            </td>
                            <td className="p-4 text-center text-default-600 font-semibold">
                              {formatAmount(item.purchasePrice)}
                            </td>
                            <td className="p-4 text-center text-default-600 font-semibold">
                              {item.revenuePercentage}%
                            </td>
                            <td className="p-4 text-right text-default-600 font-medium">
                              {formatAmount(item.price)}
                            </td>
                            <td className="p-4 text-right text-default-800 font-semibold">
                              {formatAmount(item.total)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-6 text-center text-muted-foreground"
                          >
                            No items found in this inventory.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Fallback to old single order items list */
        <Card>
          <CardHeader className="border-b border-default-200">
            <CardTitle className="text-base">
              Order Items ({invoice.orderItems?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-default-100/80 border-b border-default-200">
                    <th className="p-4 text-default-700 font-semibold">
                      Product Name
                    </th>
                    <th className="p-4 text-default-700 font-semibold text-center w-24">
                      Qty
                    </th>
                    <th className="p-4 text-default-700 font-semibold text-right w-32">
                      Price
                    </th>
                    <th className="p-4 text-default-700 font-semibold text-right w-32">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100">
                  {invoice.orderItems && invoice.orderItems.length > 0 ? (
                    invoice.orderItems.map((item: any, index: number) => (
                      <tr
                        key={index}
                        className="hover:bg-default-50/40 transition-colors"
                      >
                        <td
                          className="p-4 font-medium text-default-800"
                          title={item.productName}
                        >
                          {item.productName}
                        </td>
                        <td className="p-4 text-center text-default-600 font-semibold">
                          {item.quantity}
                        </td>
                        <td className="p-4 text-right text-default-600 font-medium">
                          {formatAmount(item.price)}
                        </td>
                        <td className="p-4 text-right text-default-800 font-semibold">
                          {formatAmount(item.total)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-6 text-center text-muted-foreground"
                      >
                        No items found in this invoice.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Totals */}
      <div className="flex flex-col sm:flex-row sm:justify-end">
        <Card className="w-full sm:w-96">
          <CardHeader className="border-b border-default-200">
            <CardTitle className="text-sm uppercase tracking-wider text-default-500">
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-semibold text-default-800">
                {formatAmount(invoice.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping Fees:</span>
              <span className="font-semibold text-green-600">
                +{formatAmount(invoice.shippingFees)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Coupon Discount:</span>
              <span className="font-semibold text-destructive">
                -{formatAmount(invoice.coupon)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Credit Used:</span>
              <span className="font-semibold text-default-800">
                {formatAmount(invoice.creditUsed)}
              </span>
            </div>
            <div className="flex justify-between text-sm border-b border-default-200 pb-3">
              <span className="text-muted-foreground">Cash Paid:</span>
              <span className="font-semibold text-default-800">
                {formatAmount(invoice.cashPaid)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-default-900 text-base">
                Total Amount:
              </span>
              <span className="text-xl font-extrabold text-primary">
                {formatAmount(invoice.totalAmount - Number(invoice.coupon) + Number(invoice.shippingFees))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceDetailsPage;
