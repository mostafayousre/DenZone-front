"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import useUpdateZone from "@/services/zones/updateZone"; 
import AxiosInstance from "@/lib/AxiosInstance";
import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";

const EditZonePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string; 
  const t = useTranslations("zones");

  const { updateZone, loading: updatingLoading } = useUpdateZone();

  const [name, setName] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const getZoneData = async () => {
      try {
        const response = await AxiosInstance.get(`/api/Zones/${id}`);
        if (response.data) {
          setName(response.data.name || "");
        }
      } catch (error: any) {
        toast.error("Error fetching zone data");
      } finally {
        setFetching(false);
      }
    };

    if (id) getZoneData();
  }, [id, t]);

  const handleUpdateZone = async () => {
    if (!name.trim()) {
      toast.error(t("error"), { description: "Please fill all required fields" });
      return;
    }

    const payload = {
      name: name,
    };

    try {
      const success = await updateZone(id, payload);
      if (success) {
        toast.success(t("edit_zone_success"));
        setTimeout(() => {
          router.push("/dashboard/zone");
        }, 1500);
      }
    } catch (error: any) {
      toast.error(typeof error === "string" ? error : "Update failed");
    }
  };

  if (fetching) {
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
            <CardTitle>{t("zones")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="zone-name">
                {t("zone_name")}
              </Label>
              <Input
                id="zone-name"
                className="flex-1 min-w-[300px]"
                placeholder={t("zone_name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 flex justify-center mt-4">
        <Button 
          onClick={handleUpdateZone} 
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

export default EditZonePage;
