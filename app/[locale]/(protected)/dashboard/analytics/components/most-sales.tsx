"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {useEffect, useState} from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useGettingAllMainAreas from "@/services/area/gettingAllMainAreas";
import AxiosInstance from "@/lib/AxiosInstance";

interface MostSalesProps {
  onRegionSummaryFetched: (summary: any) => void;
}

interface RegionSummaryMap {
  [regionId: string]: {
    totalSales: number;
  };
}

const MostSales = ({ onRegionSummaryFetched }: MostSalesProps) => {
  const { getAllMainAreas, mainAreas } = useGettingAllMainAreas();
  const [regionSummaries, setRegionSummaries] = useState<RegionSummaryMap>({});

    useEffect(() => {
        const fetchData = async () => {
            await getAllMainAreas();
        };
        fetchData();
    }, []);


    useEffect(() => {
    const fetchAllRegionSummaries = async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);

      const summaries: RegionSummaryMap = {};

      await Promise.all(
          mainAreas.map(async (region) => {
            const params = new URLSearchParams();
            params.set("StartDate", start.toISOString());
            params.set("EndDate", end.toISOString());
            params.set("RegionId", region.id as string);

            try {
              const response = await AxiosInstance.get(`/api/reports/summary?${params.toString()}`);
              summaries[region.id as string] = {
                totalSales: response.data?.totalSales || 0,
              };
            } catch (error) {
              summaries[region.id as string] = { totalSales: 0 };
            }
          })
      );

      setRegionSummaries(summaries);
    };

    if (mainAreas.length > 0) {
      fetchAllRegionSummaries();
    }
  }, [mainAreas]);

  const handleRegionClick = async (regionId: string) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);

    const params = new URLSearchParams();
    params.set("StartDate", start.toISOString());
    params.set("EndDate", end.toISOString());
    params.set("RegionId", regionId);

    try {
      const response = await AxiosInstance.get(`/api/reports/summary?${params.toString()}`);
      onRegionSummaryFetched(response.data);
    } catch (error) {
      console.error("Error fetching region summary:", error);
    }
  };

  return (
      <div className="w-full h-[500px]">
        <MapContainer center={[26.8206, 30.8025]} zoom={5.5} style={{ height: "100%", width: "100%" }}>
          <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mainAreas.map((region) => {
              const lat = parseFloat(region.lat);
              const lng = parseFloat(region.lang);

              if (Number.isNaN(lat) || Number.isNaN(lng)) {
                return null;
              }

              return (
                <Marker
                  key={region.id}
                  position={[lat, lng]}
                  eventHandlers={{
                    click: () => handleRegionClick(region.id as string),
                  }}
                  icon={L.divIcon({
                    className: "custom-icon",
                    html: `<div style="width: 120px;text-align: center; background:#1474AE;color:white;padding:5px 8px;border-radius:5px;">${region.regionName}</div>`,
                  })}
                >
                  <Popup>
                    {region.regionName} - {regionSummaries[region.id as string]?.totalSales != null
                      ? `${regionSummaries[region.id as string].totalSales} EGP`
                      : "Loading..."}
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>
  );
};

export default MostSales;