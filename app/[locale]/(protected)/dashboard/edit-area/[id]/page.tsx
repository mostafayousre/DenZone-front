"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import useUpdateArea from "@/services/areas/updateArea"; 
import useGetCities from "@/services/cities/getAllCities";
import AxiosInstance from "@/lib/AxiosInstance";
import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";

const EditAreaPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string; 
  const t = useTranslations("areas");

  const { updateArea, loading: updatingLoading } = useUpdateArea();
  const { cities, loading: citiesLoading, getAllCities } = useGetCities();

  const [name, setName] = useState("");
  const [shippingCosts, setShippingCosts] = useState<string>("0");
  const [cityId, setCityId] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    getAllCities();
    const getAreaData = async () => {
      try {
        const response = await AxiosInstance.get(`/api/Area/${id}`);
        if (response.data) {
          setName(response.data.name || "");
          setShippingCosts(response.data.shippingCosts?.toString() || "0");
          setCityId(response.data.cityId?.toString() || "");
        }
      } catch (error: any) {
        toast.error("Error fetching area data");
      } finally {
        setFetching(false);
      }
    };

    if (id) getAreaData();
  }, [id, t]);

  const filteredCities = cities?.filter((city: any) =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  ) || [];

  const handleUpdateArea = async () => {
    if (!name.trim() || !cityId || shippingCosts === "") {
      toast.error(t("error"), { description: "Please fill all required fields" });
      return;
    }

    const payload = {
      name: name,
      shippingCosts: Number(shippingCosts),
      cityId: Number(cityId),
    };

    try {
      const success = await updateArea(id, payload);
      if (success) {
        toast.success(t("edit_area_success"));
        setTimeout(() => {
          router.push("/dashboard/area");
        }, 1500);
      }
    } catch (error: any) {
      toast.error(typeof error === "string" ? error : "Update failed");
    }
  };

  if (fetching || citiesLoading) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 rounded-lg">
      <div className="col-span-12">
        <Card>
          <CardHeader className="border-b border-solid border-default-200 mb-6">
            <CardTitle>{t("areas")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="area-name">
                {t("area_name")}
              </Label>
              <Input
                id="area-name"
                className="flex-1 min-w-[300px]"
                placeholder={t("area_name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="shippingCosts">
                {t("shipping_costs")}
              </Label>
              <Input
                id="shippingCosts"
                type="number"
                className="flex-1 min-w-[300px]"
                placeholder={t("shipping_costs")}
                value={shippingCosts}
                onChange={(e) => setShippingCosts(e.target.value)}
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="cityId">
                {t("select_city")}
              </Label>
              <Select value={cityId} onValueChange={(value) => setCityId(value)}>
                <SelectTrigger className="flex-1 min-w-[300px]">
                  <SelectValue placeholder={t("select_city")} />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1">
                    <Input 
                      placeholder={t("search_city")} 
                      onChange={(e) => setCitySearch(e.target.value)} 
                    />
                  </div>
                  <SelectGroup>
                    {filteredCities.map((city: any) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 flex justify-center mt-4">
        <Button 
          onClick={handleUpdateArea} 
          disabled={updatingLoading}
          className="w-full max-w-[200px] gap-2"
        >
          {updatingLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t("confirm")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditAreaPage;
