"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useForm, SubmitHandler } from "react-hook-form";
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

type Inputs = {
    FullName: string;
    Email: string;
    Password: string;
    PhoneNumber: string;
    RoleId: string; 
    IsActive: boolean;
};

const RegForm = () => {
    const { registerUser } = useRegister();
    const userRole = Cookies.get("userRole");

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset
    } = useForm<Inputs>({
        defaultValues: {
            IsActive: true,
            RoleId: "",
        },
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
                <Input 
                    id="phone" 
                    placeholder="02123456789" 
                    {...register("PhoneNumber", { required: "Phone is required" })} 
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                    id="fullName" 
                    {...register("FullName", { required: "Full Name is required" })} 
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                    id="email" 
                    type="email" 
                    {...register("Email", { required: "Email is required" })} 
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    {...register("Password", { required: "Password is required" })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="userType">User Type</Label>
                <Controller
                    name="RoleId"
                    control={control}
                    rules={{ required: "Please select a role" }}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="E48E5A9F-2074-4DE9-A849-5C69FDD45E4E">User</SelectItem>
                                {userRole === "Admin" && (
                                    <>
                                        <SelectItem value="1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D">inventory-managers</SelectItem>
                                        <SelectItem value="8C2F4F3A-7F6D-4DB8-8B02-4A04D31F35D6">Admin</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <Button type="submit" className="w-full">
                Create An Account
            </Button>
        </form>
    );
};

export default RegForm;