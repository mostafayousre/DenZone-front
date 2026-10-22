import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

export interface HomeSectionDetailItemPayload {
  id?: string | null;
  kind: number;
  title: string;
  subtitle?: string;
  price?: number;
  oldPrice?: number | null;
  salesPrice?: number | null;
  discountRate?: number | null;
  imageFile?: File | Blob | string | null;
  imageUrl?: string | null;
  linkUrl?: string;
  productPriceId?: string | null;
  linkSectionId?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  orderNum?: number;
}

export interface UpdateHomeSectionDetailsPayload {
  title: string;
  subtitle: string;
  isVisible: boolean;
  items: HomeSectionDetailItemPayload[];
}

export function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
}

export function buildDetailsFormData(payload: UpdateHomeSectionDetailsPayload): FormData {
  const formData = new FormData();
  formData.append("Title", payload.title || "");
  formData.append("Subtitle", payload.subtitle || "");
  formData.append("IsVisible", String(Boolean(payload.isVisible)));

  payload.items.forEach((item, idx) => {
    if (isValidUuid(item.id)) {
      formData.append(`Items[${idx}].id`, item.id!);
    }
    formData.append(`Items[${idx}].kind`, String(item.kind ?? 1));
    formData.append(`Items[${idx}].title`, item.title || "");
    if (item.subtitle !== undefined && item.subtitle !== null) {
      formData.append(`Items[${idx}].subtitle`, item.subtitle);
    }
    if (item.kind !== 2 && item.price !== undefined && item.price !== null) {
      formData.append(`Items[${idx}].price`, String(item.price));
    }
    if (item.oldPrice !== undefined && item.oldPrice !== null) {
      formData.append(`Items[${idx}].oldPrice`, String(item.oldPrice));
    }
    if (item.kind !== 2 && item.salesPrice !== undefined && item.salesPrice !== null) {
      formData.append(`Items[${idx}].salesPrice`, String(item.salesPrice));
    }
    if (item.discountRate !== undefined && item.discountRate !== null) {
      formData.append(`Items[${idx}].discountRate`, String(item.discountRate));
    }

    // ImageFile: binary File/Blob or URL string
    const fileOrUrl = item.imageFile || item.imageUrl;
    if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
      formData.append(`Items[${idx}].imageFile`, fileOrUrl);
    } else if (
      typeof fileOrUrl === "string" &&
      fileOrUrl.trim() !== "" &&
      !fileOrUrl.startsWith("blob:")
    ) {
      formData.append(`Items[${idx}].imageFile`, fileOrUrl.trim());
    }

    if (item.linkUrl !== undefined && item.linkUrl !== null) {
      formData.append(`Items[${idx}].linkUrl`, item.linkUrl);
    }
    if (isValidUuid(item.productPriceId)) {
      formData.append(`Items[${idx}].productPriceId`, item.productPriceId!);
    }
    if (isValidUuid(item.linkSectionId)) {
      formData.append(`Items[${idx}].linkSectionId`, item.linkSectionId!);
    }
    if (isValidUuid(item.categoryId)) {
      formData.append(`Items[${idx}].categoryId`, item.categoryId!);
    }
    if (isValidUuid(item.brandId)) {
      formData.append(`Items[${idx}].brandId`, item.brandId!);
    }
    formData.append(`Items[${idx}].orderNum`, String(item.orderNum ?? idx));
  });

  return formData;
}

export function useUpdateHomeSectionDetails() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateHomeSectionDetails = async (
    id: string,
    payload: UpdateHomeSectionDetailsPayload | FormData
  ) => {
    setLoading(true);
    setError(null);

    const formData =
      payload instanceof FormData ? payload : buildDetailsFormData(payload);

    try {
      let response;
      try {
        response = await AxiosInstance.put(
          `/api/HomeSections/${id}/details`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } catch (putErr: any) {
        if (putErr?.response?.status === 405) {
          response = await AxiosInstance.post(
            `/api/HomeSections/${id}/details`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } else {
          throw putErr;
        }
      }

      if (
        response?.status === 200 ||
        response?.status === 201 ||
        response?.status === 204
      ) {
        return response.data;
      } else {
        return response.data;
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update home section details";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateHomeSectionDetails, loading, error };
}

export default useUpdateHomeSectionDetails;
