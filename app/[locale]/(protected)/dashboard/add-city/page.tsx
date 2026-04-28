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
import useAddCity from "@/services/cities/addCity"; 
import useGetCountries from "@/services/countries/getAllCountries";
import { Loader2, Save } from "lucide-react"; 
import { useTranslations } from "next-intl";

const AddCityPage = () => {
  const { addCity, loading: addingLoading } = useAddCity(); 
  const { countries, loading: countriesLoading, getAllCountries } = useGetCountries();
  const router = useRouter();
  const t = useTranslations("cities");

  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

  useEffect(() => {
    getAllCountries();
  }, []);

  const filteredCountries = countries?.filter((country: any) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  ) || [];

  const handleAddCitySubmit = async () => {
    if (!name.trim() || !countryId) {
      toast.error(t("error"), { 
        description: "Please fill all required fields"
      });
      return;
    }

    const payload = {
      name: name,
      countryId: Number(countryId),
    };

    try {
      const success = await addCity(payload);
      
      if (success) {
        toast.success(t("add_city_success"));
        setTimeout(() => {
          router.push("/dashboard/city");
        }, 1000);
      }
    } catch (error: any) {
      toast.error(t("error"), {
        description: typeof error === 'string' ? error : error.message,
      });
    }
  };

  if (countriesLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 rounded-lg">
      <div className="col-span-12">
        <Card>
          <CardHeader className="border-b border-solid border-default-200 mb-6">
            <CardTitle>{t("cities")} </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="cityName">
                {t("city_name")}
              </Label>
              <Input
                id="cityName"
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
              <Select onValueChange={(value) => setCountryId(value)}>
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
          onClick={handleAddCitySubmit} 
          disabled={addingLoading} 
          className="w-full max-w-[200px] gap-2"
        >
          {addingLoading ? (
            <Loader2 className="w-4 h-4 animate-spin"/>
          ) : (
            <Save className="w-4 h-4"/>
          )}
          {t("add_city")}
        </Button>
      </div>
    </div>
  );
};

export default AddCityPage;
