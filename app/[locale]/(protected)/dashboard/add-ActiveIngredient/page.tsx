// "use client";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import { Textarea } from "@/components/ui/textarea";
// import {useParams} from "next/navigation";
// import useGettingProductById from "@/services/products/gettingProductById";
// import {useEffect, useState} from "react";
// import {toast} from "sonner";
// import {useRouter} from "@/i18n/routing";
// import {Loader2} from "lucide-react";
// import GetCategories from "@/services/categories/getCategories";
// import useGettingAllActiveIngredient from "@/services/ActiveIngerients/gettingAllActiveIngerients";
// import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
// import {formatDateToDMY} from "@/utils";
// import {Price} from "@/types/price";
// import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
// import {
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable
// } from "@tanstack/react-table";
// import {productColumns} from "@/app/[locale]/(protected)/dashboard/edit-product/[id]/columns";
// import useUpdateProductById from "@/services/products/UpdateProductById";
// import useActiveIngredientById from "@/services/ActiveIngerients/ActiveIngredientById";
// import {ActiveIngredient} from "@/types/activeIngredient";
// import useUpdateActiveIngredient from "@/services/ActiveIngerients/updateActiveIngredient";
// import useCreateActiveIngredients from "@/services/ActiveIngerients/createActiveIngredients";
// import { useTranslations } from "next-intl";

// const AddActiveIngredient = () => {

//   const t = useTranslations("activeIngredients");

//   // router for navigation
//   const router = useRouter();

//   const {loading: activeIngredientLoading, createActiveIngredient} = useCreateActiveIngredients()

//   // state for data
//     const [formData, setFormData] = useState({
//         name: "",
//     });

//   // function to handle the update of product
//   const handleUpdateProduct = async ( formData: ActiveIngredient) => {
//     if (!formData.name) {
//       toast.error("Please fill all the fields");
//       return;
//     }

//     try {
//       const {success, error} = await createActiveIngredient({name: formData.name})
//        if (success) {
//         toast.success(t("activeIngredientCreated"));
//         setTimeout(() => {
//           router.push('/dashboard/ActiveIngredients');
//         }, 2000);
//       }
//       if (error) {
//         toast.error(t("activeIngredientCreationError"));
//         setTimeout(() => {
//           toast.dismiss();
//         }, 2000);
//       }
//     } catch (error: any)  {
//       toast.error( t("activeIngredientCreationError"));
//     }
//   }

//   return (
//     <div className=" grid grid-cols-12  gap-4  rounded-lg">
//       <div className="col-span-12 md:col-span-12 space-y-12 lg:col-span-12 ">
//         <Card>
//           <CardHeader className="border-b border-solid border-default-200 mb-6">
//             <CardTitle>{t("ingredientDetails")}</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center flex-wrap">
//               <Label className="w-[150px] flex-none" htmlFor="h_Fullname">
//                 {t("ingredientName")}
//               </Label>
//               <Input
//                   id="h_Fullname"
//                   type="text"
//                   placeholder={t("ingredientName")}
//                   value={formData?.name}
//                   onChange={(e) => setFormData({...formData, name: e.target.value})}
//               />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="col-span-12 flex justify-end">
//         <Button onClick={() => handleUpdateProduct(formData)}>{activeIngredientLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null} {t("addIngredient")}</Button>
//       </div>
//     </div>
//   );
// };

// export default AddActiveIngredient;
