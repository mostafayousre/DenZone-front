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
import useAddAreaZone from "@/services/areaZones/addAreaZone"; 
import useGetAreas from "@/services/areas/getAllAreas";
import useGetZones from "@/services/zones/getAllZones";
import { Loader2, Save } from "lucide-react"; 
import { useTranslations } from "next-intl";

const AddAreaZonePage = () => {
  const { addAreaZone, loading: addingLoading } = useAddAreaZone(); 
  const { areas, loading: areasLoading, getAllAreas } = useGetAreas();
  const { zones, loading: zonesLoading, getAllZones } = useGetZones();
  const router = useRouter();
  const t = useTranslations("area_zones");

  const [areaId, setAreaId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [areaSearch, setAreaSearch] = useState("");
  const [zoneSearch, setZoneSearch] = useState("");

  useEffect(() => {
    getAllAreas();
    getAllZones();
  }, []);

  const filteredAreas = areas?.filter((area: any) =>
    area.name.toLowerCase().includes(areaSearch.toLowerCase())
  ) || [];

  const filteredZones = zones?.filter((zone: any) =>
    zone.name.toLowerCase().includes(zoneSearch.toLowerCase())
  ) || [];

  const handleAddSubmit = async () => {
    if (!areaId || !zoneId) {
      toast.error(t("error"), { 
        description: "Please fill all required fields"
      });
      return;
    }

    const payload = {
      areaId: Number(areaId),
      zoneId: Number(zoneId),
    };

    try {
      const success = await addAreaZone(payload);
      
      if (success) {
        toast.success(t("add_area_zone_success"));
        setTimeout(() => {
          router.push("/dashboard/area-zone");
        }, 1000);
      }
    } catch (error: any) {
      toast.error(t("error"), {
        description: typeof error === 'string' ? error : error.message,
      });
    }
  };

  if (areasLoading || zonesLoading) {
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
            <CardTitle>{t("area_zones")} </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="areaId">
                {t("select_area")}
              </Label>
              <Select onValueChange={(value) => setAreaId(value)}>
                <SelectTrigger className="flex-1 min-w-[300px]">
                  <SelectValue placeholder={t("select_area")} />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1">
                    <Input 
                      placeholder={t("search_area")} 
                      onChange={(e) => setAreaSearch(e.target.value)} 
                    />
                  </div>
                  <SelectGroup>
                    {filteredAreas.map((area: any) => (
                      <SelectItem key={area.id} value={area.id.toString()}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="zoneId">
                {t("select_zone")}
              </Label>
              <Select onValueChange={(value) => setZoneId(value)}>
                <SelectTrigger className="flex-1 min-w-[300px]">
                  <SelectValue placeholder={t("select_zone")} />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1">
                    <Input 
                      placeholder={t("search_zone")} 
                      onChange={(e) => setZoneSearch(e.target.value)} 
                    />
                  </div>
                  <SelectGroup>
                    {filteredZones.map((zone: any) => (
                      <SelectItem key={zone.id} value={zone.id.toString()}>
                        {zone.name}
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
          onClick={handleAddSubmit} 
          disabled={addingLoading} 
          className="w-full max-w-[200px] gap-2"
        >
          {addingLoading ? (
            <Loader2 className="w-4 h-4 animate-spin"/>
          ) : (
            <Save className="w-4 h-4"/>
          )}
          {t("add_area_zone")}
        </Button>
      </div>
    </div>
  );
};

export default AddAreaZonePage;
