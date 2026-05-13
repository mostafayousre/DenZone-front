import {BillSummaryProps, OrderItem} from "@/types/orders";
import { useTranslations } from "next-intl";

const BillSummary: React.FC<BillSummaryProps> = ({ items, deletedItems,totalAmount, defaultItems = [] }) => {
  const activeItems: OrderItem[] = items.filter((item: OrderItem) => !deletedItems?.includes(item?.productId || ''));
  const subtotal: number = activeItems.reduce(
      (sum, item) => sum + ((item.unitPrice || 0) * (item.quantity || 0)),
      0
  );
  const invoiceTotal: number = subtotal || 0;

  const t = useTranslations("orderDetailsPage.billSummary");

  return (
      <div className="border border-solid border-default-400 rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
          <tr>
            <th
              colSpan={3}
              className="bg-default-50 text-xs font-medium leading-4 uppercase text-default-600 text-left"
            >
              <span className="block px-6 py-5 font-semibold">{t("item")}</span>
            </th>
            <th className="bg-default-50 text-xs font-medium leading-4 uppercase text-default-600 text-left">
              <span className="block px-6 py-5 font-semibold">{t("quantity")}</span>
            </th>
            <th className="bg-default-50 text-xs font-medium leading-4 uppercase text-default-600 text-left">
              <span className="block px-6 py-5 font-semibold">{t("unitPrice")}</span>
            </th>
            <th className="bg-default-50 text-xs font-medium leading-4 uppercase text-default-600 text-left last:text-right">
              <span className="block px-6 py-5 font-semibold">{t("total")}</span>
            </th>
          </tr>
          </thead>
          <tbody>
          {defaultItems.map((data: OrderItem) => {
            const isDeleted: boolean = deletedItems.includes(data.productId || '');
            return (
                <tr
                    key={data.productId}
                    className={`border-b border-default-100 border-solid border-0 transition-all duration-300 ${
                        isDeleted ? 'opacity-50' : ''
                    }`}
                >
                  <td
                      colSpan={3}
                      className={`text-default-900 text-sm font-normal text-left px-6 py-4 relative ${
                          isDeleted ? 'line-through' : ''
                      }`}
                  >
                    {data.productName}
                    {isDeleted && (
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full h-0.5 bg-red-500 animate-pulse"></div>
                        </div>
                    )}
                  </td>
                  <td className={`text-default-900 text-sm font-normal text-left px-6 py-4 ${
                      isDeleted ? 'line-through' : ''
                  }`}>
                    {data.quantity}
                  </td>
                  <td className={`text-default-900 text-sm font-normal text-left px-6 py-4 ${
                      isDeleted ? 'line-through' : ''
                  }`}>
                    {data.unitPrice?.toFixed(2)} EGP
                  </td>
                  <td className={`text-default-900 text-sm font-normal text-left last:text-right px-6 py-4 ${
                      isDeleted ? 'line-through' : ''
                  }`}>
                    {((data.unitPrice || 0) * (data.quantity || 0)).toFixed(2)} EGP
                  </td>
                </tr>
            );
          })}
          </tbody>
        </table>
        <div className="md:flex px-6 py-6 items-center">
          <div className="flex-1 min-w-[270px] space-y-3">
            <div className="flex justify-between">
            <span className="font-medium text-default-600 text-xs uppercase">
              {t("subtotal")}:
            </span>
              <span className="text-default-900">{totalAmount} EGP</span>
            </div>
            <div className="flex justify-between border-solid border-t border-default-200 pt-3">
            <span className="font-medium text-default-600 text-xs uppercase">
              {t("totalAmount")}:
            </span>
              <span className="text-default-900 font-bold">{totalAmount} EGP</span>
            </div>
          </div>
        </div>
      </div>
  );
};

export default BillSummary;