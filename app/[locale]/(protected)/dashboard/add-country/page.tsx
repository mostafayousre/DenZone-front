"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import useAddCountry from "@/services/countries/addCountry"; 
import { Loader2, Save } from "lucide-react"; 
import { useTranslations } from "next-intl";

const AddCountryPage = () => {
  const { addCountry, loading } = useAddCountry(); 
  const router = useRouter();
  const t = useTranslations("countries");

  const [name, setName] = useState("");

  const handleAddCountrySubmit = async () => {
    if (!name.trim()) {
      toast.error(t("error"), { 
        description: "Please fill the country name"
      });
      return;
    }

    const payload = {
      name: name,
    };

    try {
      const success = await addCountry(payload);
      
      if (success) {
        toast.success(t("add_country_success"));
        setTimeout(() => {
          router.push("/dashboard/country");
        }, 1000);
      }
    } catch (error: any) {
      toast.error(t("error"), {
        description: typeof error === 'string' ? error : error.message,
      });
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 rounded-lg">
      <div className="col-span-12">
        <Card>
          <CardHeader className="border-b border-solid border-default-200 mb-6">
            <CardTitle>{t("countries")} </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="countryName">
                {t("country_name")}
              </Label>
              <Input
                id="countryName"
                className="flex-1 min-w-[300px]"
                placeholder={t("country_name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
           
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 flex justify-center mt-4">
        <Button 
          onClick={handleAddCountrySubmit} 
          disabled={loading} 
          className="w-full max-w-[200px] gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin"/>
          ) : (
            <Save className="w-4 h-4"/>
          )}
          {t("add_country")}
        </Button>
      </div>
    </div>
  );
};

export default AddCountryPage;
