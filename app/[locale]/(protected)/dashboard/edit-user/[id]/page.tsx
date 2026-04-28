"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useGettingUserById from "@/services/users/gettingUserById";
import { Loader2 } from "lucide-react";
import useGettingBalanceForUser from "@/services/balance/gettingBalanceForUser";
import useDepositCash from "@/services/balance/deposit-cash";
import useUpdateUser from "@/services/users/updateUser";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";

const EditUser = () => {
    const t = useTranslations("EditUser");
    const params = useParams();
    const id = params?.id as string;
    const isAdmin = Cookies.get("userRole") === "Admin";

    const { loading, user, getUserById } = useGettingUserById();
    const { loading: balanceLoading, balances, getBalanceForUser } = useGettingBalanceForUser();
    const { depositCash, loading: depositCashLoading } = useDepositCash();
    const { loading: updateUserLoading, updateUser } = useUpdateUser();

    const [activate, setActivate] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (id) {
            getUserById(id);
            if (isAdmin) getBalanceForUser(id);
        }
    }, [id]);

    useEffect(() => {
        if (user) {
            setActivate(user?.isActive ?? false);
            setFullName(user?.fullName || "");
            setEmail(user?.email || ""); 
            setPhoneNumber(user?.phoneNumber || "");
        }
    }, [user]);

    const handleUpdate = async () => {
        const formData = new FormData();
        
        formData.append("FullName", fullName);
        formData.append("PhoneNumber", phoneNumber);
        formData.append("IsActive", activate.toString());
        
        formData.append("PharmacyDetails", 'null');
        formData.append("DesName", 'null');

        try {
            const { success, error } = await updateUser(formData, id);
            if (success) {
                toast.success(t("updateUser"), { description: t("userUpdated") });
                await getUserById(id); 
            } else {
                toast.error(error || t("updateFailed"));
            }
        } catch (err) {
            toast.error(t("updateFailed"));
        }
    };

    const handleDepositCash = async () => {
        if (!amount) return toast.error("Please enter an amount");
        try {
            const { success, error } = await depositCash({ amount, description }, id);
            if (success) {
                toast.success(t("depositCash"), { description: t("depositAmountSuccess") });
                setAmount("");
                setDescription("");
                getBalanceForUser(id);
            } else {
                toast.error(error || "Deposit failed");
            }
        } catch (err) {
            toast.error(t("depositAmountError"));
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] justify-center items-center">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="gap-4 rounded-lg space-y-6">
            <Card>
                <CardHeader className="border-b border-solid border-default-200 mb-6">
                    <CardTitle>{t("userInformation")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center flex-wrap gap-2">
                        <Label className="w-[150px] flex-none" htmlFor="fullName">{t("fullName")}</Label>
                        <Input
                            id="fullName"
                            className="flex-1"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                        <Label className="w-[150px] flex-none" htmlFor="email">{t("email")}</Label>
                        <Input
                            id="email"
                            className="flex-1 bg-transparent cursor-default focus-visible:ring-0 border-dashed" 
                            value={email}
                            readOnly
                        />
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                        <Label className="w-[150px] flex-none" htmlFor="phone">{t("phoneNumber")}</Label>
                        <Input
                            id="phone"
                            className="flex-1"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>

                    {/* <div className="flex items-center flex-wrap gap-2">
                        <Label className="w-[150px] flex-none">{t("active")}</Label>
                        <Select 
                            value={activate ? "true" : "false"} 
                            onValueChange={(v) => setActivate(v === "true")}
                        >
                            <SelectTrigger className="flex-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">{t("activate")}</SelectItem>
                                <SelectItem value="false">{t("deactivate")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div> */}

                    <div className="flex justify-end mt-4">
                        <Button onClick={handleUpdate} disabled={updateUserLoading}>
                            {updateUserLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                            {t("updateUser")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isAdmin && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="border-b border-solid border-default-200 mb-6">
                            <CardTitle>{t("BalanceInformation")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {balanceLoading ? (
                                <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border text-sm text-left">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="p-2 border">{t("AccountType")}</th>
                                                <th className="p-2 border">{t("Balance")}</th>
                                                <th className="p-2 border">{t("CreditLimit")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {balances?.map((b: any, i: number) => (
                                                <tr key={i}>
                                                    <td className="p-2 border">{b.accountType === 0 ? "Cash" : "Credit"}</td>
                                                    <td className="p-2 border font-mono">{b.balance.toFixed(2)}</td>
                                                    <td className="p-2 border font-mono">{b.creditLimit.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b border-solid border-default-200 mb-6">
                            <CardTitle>{t("depositCash")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center flex-wrap gap-2">
                                <Label className="w-[150px] flex-none">{t("amount")}</Label>
                                <Input type="number" className="flex-1" value={amount} onChange={(e) => setAmount(e.target.value)} />
                            </div>
                            <div className="flex items-center flex-wrap gap-2">
                                <Label className="w-[150px] flex-none">{t("Description")}</Label>
                                <Textarea className="flex-1" value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <div className="flex justify-end mt-4">
                                <Button onClick={handleDepositCash} disabled={depositCashLoading}>
                                    {depositCashLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                    {t("depositCash")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default EditUser;