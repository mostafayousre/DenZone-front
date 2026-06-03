import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

function useExportArea() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const exportArea = async (): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.get('/api/Area/export-excel', {
                responseType: 'blob',
            });

            if (response.status !== 200) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'areas.xlsx';
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);

            return true;
        } catch (err: any) {
            console.error('Export areas failed:', err);
            const errorMessage = err.message || 'An error occurred while exporting areas';
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, exportArea };
}

export default useExportArea;
