import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

export interface HomeSectionItemPayload {
  kind: number;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  productPriceId?: string | null;
  linkSectionId?: string | null;
  price?: number | null;
  oldPrice?: number | null;
  salesPrice?: number | null;
  discountRate?: number | null;
  categoryId?: string | null;
  brandId?: string | null;
  imageFile?: File | Blob | null | string;
}

export interface AddHomeSectionItemsPayload {
  items: HomeSectionItemPayload[];
}

export function buildHomeSectionItemsFormData(
  items: HomeSectionItemPayload[]
): FormData {
  const formData = new FormData();

  items.forEach((item, idx) => {
    // 1. kind (required: 1 for banner, 2 for product)
    formData.append(`Items[${idx}].kind`, String(item.kind ?? 1));

    // 2. title
    if (item.title !== undefined && item.title !== null) {
      formData.append(`Items[${idx}].title`, item.title);
    }

    // 3. subtitle
    if (item.subtitle !== undefined && item.subtitle !== null) {
      formData.append(`Items[${idx}].subtitle`, item.subtitle);
    }

    // 4. imageUrl (only non-empty string URLs, never empty string or blob URLs)
    const effectiveImageUrl =
      (typeof item.imageUrl === "string" &&
      item.imageUrl.trim() !== "" &&
      !item.imageUrl.startsWith("blob:")
        ? item.imageUrl.trim()
        : "") ||
      (typeof item.imageFile === "string" &&
      item.imageFile.trim() !== "" &&
      !item.imageFile.startsWith("blob:")
        ? item.imageFile.trim()
        : "");

    if (effectiveImageUrl) {
      formData.append(`Items[${idx}].imageUrl`, effectiveImageUrl);
    }

    // 5. linkUrl
    if (item.linkUrl !== undefined && item.linkUrl !== null) {
      formData.append(`Items[${idx}].linkUrl`, item.linkUrl);
    }

    // 6. price (only for non-product items)
    if (item.kind !== 2 && item.price !== undefined && item.price !== null) {
      formData.append(`Items[${idx}].price`, String(item.price));
    }

    // 6a. oldPrice
    if (item.oldPrice !== undefined && item.oldPrice !== null) {
      formData.append(`Items[${idx}].oldPrice`, String(item.oldPrice));
    }

    // 6b. salesPrice (only for non-product items)
    if (item.kind !== 2 && item.salesPrice !== undefined && item.salesPrice !== null) {
      formData.append(`Items[${idx}].salesPrice`, String(item.salesPrice));
    }

    // 6c. discountRate
    if (item.discountRate !== undefined && item.discountRate !== null) {
      formData.append(`Items[${idx}].discountRate`, String(item.discountRate));
    }

    // 7. productPriceId
    if (item.productPriceId) {
      formData.append(`Items[${idx}].productPriceId`, item.productPriceId);
    }

    // 7b. linkSectionId
    if (item.linkSectionId && item.linkSectionId.trim() !== "") {
      formData.append(`Items[${idx}].linkSectionId`, item.linkSectionId.trim());
    }

    // 8. categoryId
    if (item.categoryId) {
      formData.append(`Items[${idx}].categoryId`, item.categoryId);
    }

    // 9. brandId
    if (item.brandId) {
      formData.append(`Items[${idx}].brandId`, item.brandId);
    }

    // 10. imageFile
    if (item.imageFile instanceof File || item.imageFile instanceof Blob) {
      formData.append(`Items[${idx}].imageFile`, item.imageFile);
    }
  });

  return formData;
}

export function useAddHomeSectionItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addHomeSectionItems = async (
    sectionId: string,
    payload: AddHomeSectionItemsPayload | FormData
  ) => {
    setLoading(true);
    setError(null);
    try {
      const dataToSend =
        payload instanceof FormData
          ? payload
          : buildHomeSectionItemsFormData(payload.items);

      const response = await AxiosInstance.post(
        `/api/HomeSections/${sectionId}/items`,
        dataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response?.status === 200 || response?.status === 201) {
        return response.data;
      } else {
        throw new Error("Failed to save section items");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save section items";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addHomeSectionItems, loading, error };
}

export default useAddHomeSectionItems;
