import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";
import {Balance, convertAccountsToArray} from "@/types/balance";

function useGettingBalanceForUser() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [balances, setBalances] = useState<Balance[] | null>(null);

    const getBalanceForUser = async (userId: string | string[] | undefined) => {
        setLoading(true);
        setError(null);
        await AxiosInstance.get(`/api/Balances/user/${userId}`).then((response) => {
            if (response.status !== 200) {
                throw new Error('Failed to fetch balance for user');
            }
            const accountsArray = convertAccountsToArray(response.data);
            setBalances(accountsArray);
        }).catch((error) => {
            setError(error.message);
        }).finally(() => {
            setLoading(false);
        })
    }

    return { balances, loading, error, getBalanceForUser };
}

export default useGettingBalanceForUser;