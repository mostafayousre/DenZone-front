import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

export interface UpdateHomeSectionItemPayload {
  kind?: number;
  title?: string;
  subtitle?: string;
  price?: number | null;
  oldPrice?: number | null;
  salesPrice?: number | null;
  discountRate?: number | null;
  imageUrl?: string;
  imageFile?: File | Blob | null | string;
  linkUrl?: string;
  productPriceId?: string | null;
  linkSectionId?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
}

export function buildUpdateHomeSectionItemFormData(
  payload: UpdateHomeSectionItemPayload
): FormData {
  const formData = new FormData();

  // 1. Kind (required integer)
  if (payload.kind !== undefined && payload.kind !== null) {
    formData.append("Kind", String(payload.kind));
  } else {
    formData.append("Kind", "1");
  }

  // 2. Title
  if (payload.title !== undefined && payload.title !== null) {
    formData.append("Title", payload.title);
  }

  // 3. Subtitle
  if (payload.subtitle !== undefined && payload.subtitle !== null) {
    formData.append("Subtitle", payload.subtitle);
  }

  // 4. Price (only for non-product items)
  if (payload.kind !== 2 && payload.price !== undefined && payload.price !== null) {
    formData.append("Price", String(payload.price));
  }

  // 4a. OldPrice
  if (payload.oldPrice !== undefined && payload.oldPrice !== null) {
    formData.append("OldPrice", String(payload.oldPrice));
  }

  // 4b. SalesPrice (only for non-product items)
  if (payload.kind !== 2 && payload.salesPrice !== undefined && payload.salesPrice !== null) {
    formData.append("SalesPrice", String(payload.salesPrice));
  }

  // 4c. DiscountRate
  if (payload.discountRate !== undefined && payload.discountRate !== null) {
    formData.append("DiscountRate", String(payload.discountRate));
  }

  // 5. ImageUrl
  const effectiveImageUrl =
    typeof payload.imageUrl === "string" &&
    payload.imageUrl.trim() !== "" &&
    !payload.imageUrl.startsWith("blob:")
      ? payload.imageUrl.trim()
      : "";

  if (effectiveImageUrl) {
    formData.append("ImageUrl", effectiveImageUrl);
  }

  // 6. ImageFile (binary)
  if (payload.imageFile instanceof File || payload.imageFile instanceof Blob) {
    formData.append("ImageFile", payload.imageFile);
  }

  // 7. LinkUrl
  if (payload.linkUrl !== undefined && payload.linkUrl !== null) {
    formData.append("LinkUrl", payload.linkUrl);
  }

  // 8. ProductPriceId
  if (payload.productPriceId && payload.productPriceId.trim() !== "") {
    formData.append("ProductPriceId", payload.productPriceId.trim());
  }

  // 8b. LinkSectionId
  if (payload.linkSectionId && payload.linkSectionId.trim() !== "") {
    formData.append("LinkSectionId", payload.linkSectionId.trim());
  }

  // 9. CategoryId
  if (payload.categoryId && payload.categoryId.trim() !== "") {
    formData.append("CategoryId", payload.categoryId.trim());
  }

  // 10. BrandId
  if (payload.brandId && payload.brandId.trim() !== "") {
    formData.append("BrandId", payload.brandId.trim());
  }

  return formData;
}

export function useUpdateHomeSectionItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateHomeSectionItem = async (
    sectionId: string,
    itemId: string,
    payload: UpdateHomeSectionItemPayload | FormData
  ) => {
    setLoading(true);
    setError(null);
    try {
      const dataToSend =
        payload instanceof FormData
          ? payload
          : buildUpdateHomeSectionItemFormData(payload);

      let response;
      try {
        response = await AxiosInstance.put(
          `/api/HomeSections/${sectionId}/items/${itemId}`,
          dataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } catch (putErr: any) {
        // Fallback to POST if server endpoint expects POST instead of PUT (HTTP 405)
        if (putErr?.response?.status === 405) {
          response = await AxiosInstance.post(
            `/api/HomeSections/${sectionId}/items/${itemId}`,
            dataToSend,
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
        "Failed to update section item";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateHomeSectionItem, loading, error };
}

export default useUpdateHomeSectionItem;
