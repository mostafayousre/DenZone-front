"use client";

import * as React from "react";
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { baseColumns } from "./columns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import TablePagination from "./table-pagination";
import { CardContent } from "@/components/ui/card";
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import useGetAllRoles, { RoleData } from "@/services/roles/getAllRoles";
import { Loader2 } from "lucide-react";
import SearchInput from "@/app/[locale]/(protected)/components/SearchInput/SearchInput";
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import useGetPermissions, { PermissionData } from "@/services/roles/getPermissions";
import useAssignPermissions from "@/services/roles/assignPermissions";
import { toast } from "sonner";

const RolesTable = () => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const { data, loading, getAllRoles } = useGetAllRoles();
    const { data: permissions, getPermissions, loading: loadingPermissions } = useGetPermissions();
    const { assignPermissions, loading: assigningPermissions } = useAssignPermissions();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

    const t = useTranslations("brands"); 

    const handleOpenAssignPermissions = (role: RoleData) => {
        setSelectedRole(role);
        setIsDialogOpen(true);
        getPermissions();
    };

    useEffect(() => {
        if (permissions && selectedRole) {
            const initialIds = permissions
                .filter(p => p.rolePermissions?.some((rp: any) => rp.roleId === selectedRole.id))
                .map(p => p.id);
            setSelectedPermissionIds(initialIds);
        }
    }, [permissions, selectedRole]);

    const columns = baseColumns({ 
        refresh: getAllRoles, 
        t, 
        onAssignPermissions: handleOpenAssignPermissions 
    });

    const [filteredRoles, setFilteredRoles] = useState<RoleData[]>([]);

    const table = useReactTable({
        data: filteredRoles ?? [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    useEffect(() => {
        getAllRoles();
    }, []);

    useEffect(() => {
        if (data) {
            setFilteredRoles(data);
        }
    }, [data]);

    if (loading === true) {
        return (
            <div className="flex mx-auto justify-center items-center h-16 w-16">
                <Loader2 size={32} className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex flex-wrap justify-end items-center py-4 px-6 border-b border-solid border-default-200">
                <SearchInput data={data ?? []} setFilteredData={setFilteredRoles} filterKey={"name"} placeholder="Search roles..." />
                <div className="#flex-none">
                    <div className="flex items-center gap-4 flex-wrap">
                        <Link href="/dashboard/add-role">
                            <Button size={"md"} variant="outline">
                                Add Role
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <CardContent className="pt-6">
                <div className="border border-solid border-default-200 rounded-lg overflow-hidden border-t-0">
                    <Table>
                        <TableHeader className="bg-default-200">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead className="last:text-start" key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="h-[75px]">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <TablePagination table={table} />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Assign Permissions to {selectedRole?.name}</DialogTitle>
                    </DialogHeader>
                    
                    {loadingPermissions ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            {permissions?.map((permission) => (
                                <div key={permission.id} className="flex items-center space-x-2 border p-2 rounded-md hover:bg-default-100 transition-colors">
                                    <Checkbox 
                                        id={permission.id} 
                                        checked={selectedPermissionIds.includes(permission.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedPermissionIds([...selectedPermissionIds, permission.id]);
                                            } else {
                                                setSelectedPermissionIds(selectedPermissionIds.filter(id => id !== permission.id));
                                            }
                                        }}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label
                                            htmlFor={permission.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {permission.name}
                                        </Label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            disabled={assigningPermissions || loadingPermissions} 
                            onClick={async () => {
                                if (!selectedRole) return;
                                try {
                                    const success = await assignPermissions({
                                        roleId: selectedRole.id,
                                        permissionIds: selectedPermissionIds
                                    });
                                    if (success) {
                                        toast.success("Permissions assigned successfully");
                                        setIsDialogOpen(false);
                                        getAllRoles();
                                    }
                                } catch (error: any) {
                                    toast.error(error.message || "Failed to assign permissions");
                                }
                            }}
                        >
                            {assigningPermissions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Permissions
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RolesTable;
