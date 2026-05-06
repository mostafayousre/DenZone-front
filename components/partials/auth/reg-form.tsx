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
import { useEffect, useState, useRef } from "react";
import ReactSelect, { MultiValue } from "react-select";
import useGetCountries from "@/services/countries/getAllCountries";
import useGetCities from "@/services/cities/getAllCities";
import useGetAreas from "@/services/areas/getAllAreas";
import useGetZones from "@/services/zones/getAllZones";
import useGetAreaZones from "@/services/areaZones/getAllAreaZones";
import { Switch } from "@/components/ui/switch";
import useGetAllRoles from "@/services/roles/getAllRoles";

type Inputs = {
    FullName: string;
    Email: string;
    Password: string;
    PhoneNumber: string;
    RoleId: string;
    AddressLines: { value: string }[];
    IsActive: boolean;
    IsPopular?: boolean;
    Area?: string;
    SubArea?: string;
    Country?: string;
    Zone?: any;
    Salary?: string;
};

const RegForm = () => {
    const { registerUser } = useRegister();
    const userRole = Cookies.get("userRole");

    const [profileImage, setProfileImage] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImage(e.target.files[0]);
        }
    };

    const { countries, getAllCountries } = useGetCountries();
    const { cities, getAllCities } = useGetCities();
    const { areas, getAllAreas } = useGetAreas();
    const { zones, getAllZones } = useGetZones();
    const { areaZones, getAllAreaZones } = useGetAreaZones();
    const { data: roles, getAllRoles } = useGetAllRoles();

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<Inputs>({
        defaultValues: {
            IsActive: true,
            IsPopular: false,
            RoleId: "",
            AddressLines: [{ value: "" }],
            Area: "",
            SubArea: "",
            Country: "",
            Zone: "",
            Salary: "",
        },
    });

    const selectedRoleId = watch("RoleId");

    // Find role names dynamically to determine if it's a provider or deliverer
    const selectedRoleName = roles?.find(r => r.id.toLowerCase() === selectedRoleId?.toLowerCase())?.name;
    const isProvider = selectedRoleName === "Inventory";
    const isDeliver = selectedRoleName === "representative";

    const selectedCountryId = watch("Country");
    const selectedCityId = watch("SubArea");
    const selectedAreaId = watch("Area");

    const filteredCities = selectedCountryId
        ? cities?.filter((city: any) => city.countryName === countries?.find((c: any) => c.id.toString() === selectedCountryId)?.name) || []
        : [];

    const filteredAreas = selectedCityId
        ? areas?.filter((area: any) => area.cityName === cities?.find((c: any) => c.id.toString() === selectedCityId)?.name) || []
        : [];

    const filteredZones = selectedAreaId && areaZones
        ? zones?.filter((zone: any) => {
            const targetAreaName = areas?.find((a: any) => a.id.toString() === selectedAreaId)?.name;
            return areaZones.some((az: any) => az.areaName === targetAreaName && az.zoneName === zone.name);
        }) || []
        : [];

    useEffect(() => {
        getAllRoles();
    }, []);

    useEffect(() => {
        if (isProvider || isDeliver) {
            getAllCountries();
            getAllCities();
            getAllAreas();
            getAllZones();
            getAllAreaZones();
        }
    }, [isProvider, isDeliver]);

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

            if (isProvider || isDeliver) {
                if (data.Area) formData.append("Area", data.Area);
                if (data.SubArea) formData.append("SubArea", data.SubArea);
                if (data.Country) formData.append("Country", data.Country);

                if (isDeliver) {
                    if (data.Salary) formData.append("Salary", data.Salary);
                    if (Array.isArray(data.Zone)) {
                        data.Zone.forEach((z: any, index: number) => {
                            formData.append(`ZoneId[${index}]`, z.value);
                        });
                    } else if (data.Zone) {
                        formData.append("ZoneId[0]", data.Zone);
                    }
                } else {
                    if (data.Zone) formData.append("Zone", data.Zone);
                }

                if (isProvider && data.IsPopular !== undefined) formData.append("IsPopular", String(data.IsPopular));
                if (isProvider && profileImage) formData.append("ProfileImage", profileImage);
            }

            const result = await registerUser(formData);

            if (result) {
                toast.success("Registration successful!");
                reset();
                setProfileImage(null);
            }
        } catch (error) {
            toast.error("Registration failed.");
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...register("FullName", { required: "Required" })} />
            </div>


            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("Email", { required: "Required" })} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("PhoneNumber", { required: "Required" })} />
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
                                {roles?.map((role) => (
                                    <SelectItem key={role.id} value={role.id}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            {(isProvider || isDeliver) && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Controller
                                name="Country"
                                control={control}
                                rules={{ required: "Required" }}
                                render={({ field }) => (
                                    <Select onValueChange={(val) => {
                                        field.onChange(val);
                                        setValue("SubArea", "");
                                        setValue("Area", "");
                                        setValue("Zone", "");
                                    }} value={field.value}>
                                        <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                                        <SelectContent>
                                            {countries?.map((item: any) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.Country && <span className="text-sm text-red-500">{errors.Country.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subArea">City</Label>
                            <Controller
                                name="SubArea"
                                control={control}
                                rules={{ required: "Required" }}
                                render={({ field }) => (
                                    <Select onValueChange={(val) => {
                                        field.onChange(val);
                                        setValue("Area", "");
                                        setValue("Zone", "");
                                    }} value={field.value}>
                                        <SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger>
                                        <SelectContent>
                                            {filteredCities.map((item: any) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.SubArea && <span className="text-sm text-red-500">{errors.SubArea.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="area">Area</Label>
                            <Controller
                                name="Area"
                                control={control}
                                rules={{ required: "Required" }}
                                render={({ field }) => (
                                    <Select onValueChange={(val) => {
                                        field.onChange(val);
                                        setValue("Zone", "");
                                    }} value={field.value}>
                                        <SelectTrigger><SelectValue placeholder="Select Area" /></SelectTrigger>
                                        <SelectContent>
                                            {filteredAreas.map((item: any) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.Area && <span className="text-sm text-red-500">{errors.Area.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="zone">Zone</Label>
                            <Controller
                                name="Zone"
                                control={control}
                                rules={{ required: "Required" }}
                                render={({ field }) => (
                                    isDeliver ? (
                                        <ReactSelect
                                            isMulti
                                            options={filteredZones.map((z: any) => ({ value: z.id.toString(), label: z.name }))}
                                            className="react-select"
                                            classNamePrefix="select"
                                            onChange={field.onChange}
                                            value={field.value}
                                            placeholder="Select Zones"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    minHeight: '40px',
                                                    fontSize: '0.875rem',
                                                    backgroundColor: 'transparent',
                                                    borderColor: 'hsl(var(--input))',
                                                }),
                                                placeholder: (base) => ({
                                                    ...base,
                                                    fontSize: '0.875rem',
                                                    color: 'hsl(var(--muted-foreground))',
                                                }),
                                                multiValue: (base) => ({
                                                    ...base,
                                                    backgroundColor: 'hsl(var(--secondary))',
                                                    borderRadius: '4px',
                                                }),
                                                multiValueLabel: (base) => ({
                                                    ...base,
                                                    color: 'hsl(var(--secondary-foreground))',
                                                }),
                                                menu: (base) => ({
                                                    ...base,
                                                    backgroundColor: 'hsl(var(--popover))',
                                                    border: '1px solid hsl(var(--border))',
                                                }),
                                                option: (base, state) => ({
                                                    ...base,
                                                    backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
                                                    color: state.isFocused ? 'hsl(var(--accent-foreground))' : 'inherit',
                                                    fontSize: '0.875rem',
                                                }),
                                            }}
                                        />
                                    ) : (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger><SelectValue placeholder="Select Zone" /></SelectTrigger>
                                            <SelectContent>
                                                {filteredZones.map((item: any) => (
                                                    <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )
                                )}
                            />
                            {errors.Zone?.message && <span className="text-sm text-red-500">{String(errors.Zone.message)}</span>}
                        </div>
                        {isDeliver && (
                            <div className="space-y-2">
                                <Label htmlFor="salary">Salary</Label>
                                <Input
                                    id="salary"
                                    type="number"
                                    placeholder="Enter Salary"
                                    {...register("Salary", { required: isDeliver ? "Required" : false })}
                                />
                                {errors.Salary?.message && <span className="text-sm text-red-500">{String(errors.Salary.message)}</span>}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 mt-4">
                        <Label htmlFor="profileImage">Profile Image</Label>
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex gap-2 items-center"
                            >
                                <Plus className="w-4 h-4" />
                                Choose File
                            </Button>

                            <span className="text-sm text-muted-foreground truncate">
                                {profileImage ? profileImage.name : "No file chosen"}
                            </span>

                            <input
                                ref={fileInputRef}
                                id="profileImage"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {isProvider && (
                        <div className="flex items-center space-x-2 mt-4">
                            <Controller
                                name="IsPopular"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        id="is-popular"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label htmlFor="is-popular">Is Popular</Label>
                        </div>
                    )}
                </>
            )}

            <Button type="submit" className="w-full">Create An Account</Button>
        </form>
    );
};

export default RegForm;