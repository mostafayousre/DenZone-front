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
import useUpdateCity from "@/services/cities/updateCity"; 
import useGetCountries from "@/services/countries/getAllCountries";
import AxiosInstance from "@/lib/AxiosInstance";
import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";

const EditCityPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string; 
  const t = useTranslations("cities");

  const { updateCity, loading: updatingLoading } = useUpdateCity();
  const { countries, loading: countriesLoading, getAllCountries } = useGetCountries();

  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    getAllCountries();
    const getCityData = async () => {
      try {
        const response = await AxiosInstance.get(`/api/Cities/${id}`);
        if (response.data) {
          setName(response.data.name || "");
          setCountryId(response.data.countryId?.toString() || "");
        }
      } catch (error: any) {
        toast.error("Error fetching city data");
      } finally {
        setFetching(false);
      }
    };

    if (id) getCityData();
  }, [id, t]);

  const filteredCountries = countries?.filter((country: any) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  ) || [];

  const handleUpdateCity = async () => {
    if (!name.trim() || !countryId) {
      toast.error(t("error"), { description: "Please fill all required fields" });
      return;
    }

    const payload = {
      name: name,
      countryId: Number(countryId),
    };

    try {
      const success = await updateCity(id, payload);
      if (success) {
        toast.success(t("edit_city_success"));
        setTimeout(() => {
          router.push("/dashboard/city");
        }, 1500);
      }
    } catch (error: any) {
      toast.error(typeof error === "string" ? error : "Update failed");
    }
  };

  if (fetching || countriesLoading) {
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
            <CardTitle>{t("cities")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="city-name">
                {t("city_name")}
              </Label>
              <Input
                id="city-name"
                className="flex-1 min-w-[300px]"
                placeholder={t("city_name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="countryId">
                {t("select_country")}
              </Label>
              <Select value={countryId} onValueChange={(value) => setCountryId(value)}>
                <SelectTrigger className="flex-1 min-w-[300px]">
                  <SelectValue placeholder={t("select_country")} />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1">
                    <Input 
                      placeholder={t("search_country")} 
                      onChange={(e) => setCountrySearch(e.target.value)} 
                    />
                  </div>
                  <SelectGroup>
                    {filteredCountries.map((country: any) => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.name}
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
          onClick={handleUpdateCity} 
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

export default EditCityPage;
