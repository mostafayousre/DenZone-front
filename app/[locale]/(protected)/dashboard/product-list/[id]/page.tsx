"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import useGettingProductById from "@/services/products/gettingProductById";
import { useLocale } from "next-intl";
import { 
  Tag, Calendar, BarChart3, Image as ImageIcon, FileText, Clock, Package
} from "lucide-react";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const locale = useLocale();
  const isArabic = locale === "ar";
  const { product, loading, error, getProductById } = useGettingProductById();

  useEffect(() => {
    if (id) getProductById(id as string);
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center text-primary font-bold animate-pulse">Loading...</div>;
  if (error) return <div className="p-10 text-red-500 text-center bg-red-50 rounded-lg m-6 border border-red-200">Error: {error}</div>;
  if (!product) return null;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen space-y-6">
      
      {/* 1. Top Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isArabic ? product.productArabicName : product.productName}
          </h1>
          <div className="flex gap-4 mt-1">
            <p className="text-slate-700 text-[13px] font-mono uppercase tracking-wider">Product ID: {product.productId}</p>
          </div>
                      <p className="text-blue-600 text-[13px] font-bold uppercase tracking-wider  px-2 py-0.5 rounded">Code: {product.productCode}</p>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Image + Timeline */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="aspect-square bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-200 overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0]} 
                  alt="product" 
                  className="object-contain w-full h-full hover:scale-105 transition-transform duration-300" 
                />
              ) : (
                <div className="text-slate-300 flex flex-col items-center">
                  <ImageIcon size={48} />
                  <span className="text-xs mt-2 italic">No Product Image</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-slate-700 font-bold text-[13px] uppercase flex items-center gap-2">
               System Timeline
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                <Calendar size={16} className="text-slate-700" />
                <div>
                  <p className="text-[9px] text-slate-700 font-bold uppercase">Created At</p>
                  <p className="text-xs text-slate-700 font-bold">
                    {new Date(product.createdAt).toLocaleDateString()} - {new Date(product.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                <BarChart3 size={16} className="text-slate-700" />
                <div>
                  <p className="text-[9px] text-slate-700 font-bold uppercase">Last Updated</p>
                  <p className="text-xs text-slate-700 font-bold">
                    {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "Never"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Descriptions + Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            
            <div className="p-8 space-y-8">
              <h3 className="text-slate-700 font-bold text-[13px] uppercase flex items-center gap-2 border-b border-slate-50 pb-2">
                Content Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6 text-sm">
                  <div>
                    <label className="text-[13px] font-black text-slate-700">Preface</label>
                    <p className="text-slate-700 leading-relaxed ">
                      {product.preef || "No preface available."}
                    </p>
                  </div>
                  <div>
                    <label className="text-[13px] font-black text-slate-700 ">Description</label>
                    <p className="text-slate-700 leading-relaxed">
                      {product.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="space-y-6 text-sm text-right" dir="rtl">
                  <div>
                    <label className="text-[13px] font-black text-slate-700 ">الوصف المختصر</label>
                    <p className="text-slate-700 leading-relaxed ">
                      {product.arabicPreef || "غير متوفر"}
                    </p>
                  </div>
                  <div>
                    <label className="text-[13px] font-black text-slate-700 ">الوصف الكامل</label>
                    <p className="text-slate-700 leading-relaxed">
                      {product.arabicDescription || "غير متوفر"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Category */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3 text-slate-700 uppercase font-bold text-[9px]">
                  Category Information
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12  rounded-lg flex items-center justify-center overflow-hidden border">
                     {product.category?.imageName ? (
                        <img src={product.category.imageName} className="object-cover w-full h-full" alt="cat" />
                     ) : (
                        <Tag size={20} className="text-slate-300"/>
                     )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">
                        {isArabic ? product.category?.arabicName : product.category?.name}
                    </p>
                    <p className="text-[9px] text-slate-700 font-mono truncate">{product.categoryId}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="flex-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="text-[8px] text-slate-700 uppercase font-bold">Company %</p>
                    <p className="text-[11px] font-bold text-blue-600">{product.category?.companyPercentage ?? 0}%</p>
                  </div>
                  <div className="flex-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="text-[8px] text-slate-700 uppercase font-bold">Pref</p>
                    <p className="text-[11px] font-bold text-slate-700 truncate">{product.category?.pref || "General"}</p>
                  </div>
                </div>
              </div>

              {/* Provider / Inventory List */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3 text-slate-700 uppercase font-bold text-[9px]">
                  <div className="flex items-center gap-2">
                    Provider
                  </div>
                </div>

                <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                  {product.inventories && product.inventories.length > 0 ? (
                    product.inventories.map((inv: any, index: number) => (
                      <div key={index} className="bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[13px] font-bold text-slate-800 truncate uppercase w-2/3">
                            {inv.inventoryName}
                          </p>
                          <div className="text-right">
                            <p className="text-[11px] font-black text-blue-600">{inv.stockQuantity}</p>
                            <p className="text-[8px] text-slate-700 uppercase font-bold">Stock</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pt-2 border-t border-slate-200/50">
                          <div>
                            <p className="text-[8px] text-slate-700 uppercase">Price</p>
                            <p className="text-[13px] font-bold text-slate-700">${inv.salesPrice.toFixed(2)}</p>
                          </div>
                          {inv.discountRate > 0 && (
                            <div className="border-l border-slate-200 pl-3">
                              <p className="text-[8px] text-slate-700 uppercase font-bold text-red-700">Discount</p>
                              <p className="text-[13px] font-bold text-red-500">-{inv.discountRate}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-[13px] text-slate-700 font-bold uppercase">No Inventory Assigned</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Scrollbar Styling */}
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}