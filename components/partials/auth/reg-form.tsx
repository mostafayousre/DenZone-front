"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useForm, SubmitHandler, useFieldArray } from "react-hook-form"; 
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import useRegister from "@/services/auth/register";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Plus, Trash2 } from "lucide-react"; 

type Inputs = {
    FullName: string;
    Email: string;
    Password: string;
    PhoneNumber: string;
    RoleId: string;
    AddressLines: { value: string }[]; 
    IsActive: boolean;
    Area?: string;
    SubArea?: string;
    Country?: string;
    Zone?: string;
};

const RegForm = () => {
    const { registerUser } = useRegister();
    const userRole = Cookies.get("userRole");

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors }
    } = useForm<Inputs>({
        defaultValues: {
            IsActive: true,
            RoleId: "",
            AddressLines: [{ value: "" }], 
            Area: "",
            SubArea: "",
            Country: "",
            Zone: "",
        },
    });

    const selectedRoleId = watch("RoleId");
    const isProvider = selectedRoleId === "1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D";

    const { fields, append, remove } = useFieldArray({
        control,
        name: "AddressLines",
    });

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        try {
            const formData = new FormData();

            formData.append("FullName", data.FullName);
            formData.append("Email", data.Email);
            formData.append("Password", data.Password);
            formData.append("PhoneNumber", data.PhoneNumber);
            formData.append("RoleId", data.RoleId);
            formData.append("IsActive", String(data.IsActive)); 

            data.AddressLines.forEach((addr, index) => {
                formData.append(`AddressLines[${index}]`, addr.value);
            });

            if (isProvider) {
                if (data.Area) formData.append("Area", data.Area);
                if (data.SubArea) formData.append("SubArea", data.SubArea);
                if (data.Country) formData.append("Country", data.Country);
                if (data.Zone) formData.append("Zone", data.Zone);
            }

            const result = await registerUser(formData);

            if (result) {
                toast.success("Registration successful!");
                reset(); 
            }
        } catch (error) {
            toast.error("Registration failed.");
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("PhoneNumber", { required: "Required" })} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...register("FullName", { required: "Required" })} />
            </div>

        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("Email", { required: "Required" })} />
        </div>
        <div className="space-y-2">
            <Label>Addresses</Label>
            {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                    <div className="flex-1">
                        <Input
                            placeholder={`Address Line ${index + 1}`}
                            {...register(`AddressLines.${index}.value` as const, {
                                required: "Address is required",
                            })}
                        />
                    </div>
                    {fields.length > 1 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            ))}
            <div className="flex items-center justify-between">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ value: "" })}
                    className="flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" /> Add Address
                </Button>
            </div>
        </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("Password", { required: "Required" })} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="userType">User Type</Label>
                <Controller
                    name="RoleId"
                    control={control}
                    rules={{ required: "Please select a role" }}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="E48E5A9F-2074-4DE9-A849-5C69FDD45E4E">Doctor</SelectItem>
                                {userRole === "Admin" && (
                                    <>
                                        <SelectItem value="1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D">Provider</SelectItem>
                                        <SelectItem value="8C2F4F3A-7F6D-4DB8-8B02-4A04D31F35D6">Admin</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            {isProvider && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" {...register("Country", { required: "Required for Provider" })} />
                        {errors.Country && <span className="text-sm text-red-500">{errors.Country.message}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="zone">Zone</Label>
                        <Input id="zone" {...register("Zone", { required: "Required for Provider" })} />
                        {errors.Zone && <span className="text-sm text-red-500">{errors.Zone.message}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="area">Area</Label>
                        <Input id="area" {...register("Area", { required: "Required for Provider" })} />
                        {errors.Area && <span className="text-sm text-red-500">{errors.Area.message}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subArea">SubArea</Label>
                        <Input id="subArea" {...register("SubArea", { required: "Required for Provider" })} />
                        {errors.SubArea && <span className="text-sm text-red-500">{errors.SubArea.message}</span>}
                    </div>
                </div>
            )}

            <Button type="submit" className="w-full">Create An Account</Button>
        </form>
    );
};

export default RegForm;