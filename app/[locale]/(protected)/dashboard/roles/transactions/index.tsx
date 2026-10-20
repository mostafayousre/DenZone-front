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
import { Loader2, Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import useGetPermissions, { PermissionData } from "@/services/roles/getPermissions";
import useAssignPermissions from "@/services/roles/assignPermissions";
import { toast } from "sonner";

// Extract group/category name from permission (e.g. "view order" -> "order", "Permissions.Order.View" -> "Order")
const getPermissionCategory = (permission: PermissionData): string => {
    const rawName = permission.name?.trim() || "";
    
    // Space separation (e.g. "view order", "create order", "view return order")
    if (rawName.includes(" ")) {
        const parts = rawName.split(/\s+/);
        // Resource name starts from index 1 (after the action like view/create/edit/delete)
        return parts.slice(1).join(" ");
    }

    // Dot notation (e.g. "Permissions.Order.View" or "Order.View")
    const rawDot = rawName.includes(".") ? rawName : (permission.code?.trim() || "");
    if (rawDot.includes(".")) {
        const parts = rawDot.split(".");
        if (parts.length >= 3 && parts[0].toLowerCase() === "permissions") {
            return parts[1];
        }
        if (parts.length >= 2) {
            return parts[1] || parts[0];
        }
    }

    return rawName || permission.code || "Other";
};

// Format category name nicely (e.g. "order" -> "Order", "return order" -> "Return Order")
const formatCategoryTitle = (category: string): string => {
    if (!category) return "Other";
    const clean = category.replace(/[_-]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
    return clean
        .split(" ")
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

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
    const [permissionSearch, setPermissionSearch] = useState<string>("");

    const t = useTranslations("brands"); 

    const handleOpenAssignPermissions = (role: RoleData) => {
        setSelectedRole(role);
        setPermissionSearch("");
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

    // Group permissions by category and filter by search
    const groupedPermissions = React.useMemo(() => {
        if (!permissions || !permissions.length) return [];

        const query = permissionSearch.trim().toLowerCase();
        const groupsMap = new Map<string, PermissionData[]>();

        permissions.forEach(permission => {
            const categoryKey = formatCategoryTitle(getPermissionCategory(permission));
            if (!groupsMap.has(categoryKey)) {
                groupsMap.set(categoryKey, []);
            }
            groupsMap.get(categoryKey)!.push(permission);
        });

        const sortedGroups = Array.from(groupsMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, items]) => ({
                category,
                permissions: items.sort((a, b) => a.name.localeCompare(b.name)),
            }));

        if (!query) return sortedGroups;

        return sortedGroups
            .map(group => {
                const matchesCategory = group.category.toLowerCase().includes(query);
                if (matchesCategory) return group;

                const matchingPerms = group.permissions.filter(p => 
                    p.name.toLowerCase().includes(query) || 
                    (p.code && p.code.toLowerCase().includes(query))
                );

                if (matchingPerms.length > 0) {
                    return {
                        category: group.category,
                        permissions: matchingPerms,
                    };
                }
                return null;
            })
            .filter(Boolean) as { category: string; permissions: PermissionData[] }[];
    }, [permissions, permissionSearch]);

    const togglePermission = (id: string) => {
        setSelectedPermissionIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleGroup = (groupPerms: PermissionData[]) => {
        const groupIds = groupPerms.map(p => p.id);
        const allSelected = groupIds.length > 0 && groupIds.every(id => selectedPermissionIds.includes(id));
        
        if (allSelected) {
            setSelectedPermissionIds(prev => prev.filter(id => !groupIds.includes(id)));
        } else {
            setSelectedPermissionIds(prev => Array.from(new Set([...prev, ...groupIds])));
        }
    };

    const handleSelectAll = () => {
        if (!permissions) return;
        setSelectedPermissionIds(permissions.map(p => p.id));
    };

    const handleDeselectAll = () => {
        setSelectedPermissionIds([]);
    };

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
                <DialogContent size="md" className="max-h-[85vh] flex flex-col p-6 overflow-hidden">
                    <DialogHeader className="pb-3 border-b border-default-200">
                        <DialogTitle className="text-xl">Assign Permissions to {selectedRole?.name}</DialogTitle>
                    </DialogHeader>
                    
                    {loadingPermissions ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                        </div>
                    ) : (
                        <div className="flex flex-col flex-1 min-h-0 space-y-4">
                            {/* Toolbar: Search & Select/Deselect all */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search permissions or groups..."
                                        value={permissionSearch}
                                        onChange={(e) => setPermissionSearch(e.target.value)}
                                        className="pl-8 text-xs h-9"
                                    />
                                    {permissionSearch && (
                                        <button
                                            type="button"
                                            onClick={() => setPermissionSearch("")}
                                            className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-2.5">
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        Selected: <strong className="text-foreground">{selectedPermissionIds.length}</strong> / {permissions?.length || 0}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-xs px-2.5"
                                            onClick={handleSelectAll}
                                            disabled={!permissions?.length || selectedPermissionIds.length === permissions.length}
                                        >
                                            Select All
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-xs px-2.5"
                                            onClick={handleDeselectAll}
                                            disabled={selectedPermissionIds.length === 0}
                                        >
                                            Deselect All
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions Groups List */}
                            <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[50vh]">
                                {groupedPermissions.length === 0 ? (
                                    <div className="text-center py-12 text-sm text-muted-foreground">
                                        No permissions found matching your search.
                                    </div>
                                ) : (
                                    groupedPermissions.map((group) => {
                                        const groupSelectedCount = group.permissions.filter(p => 
                                            selectedPermissionIds.includes(p.id)
                                        ).length;
                                        const isAllGroupSelected = group.permissions.length > 0 && 
                                            groupSelectedCount === group.permissions.length;

                                        return (
                                            <div 
                                                key={group.category} 
                                                className="border border-default-200 rounded-lg p-3.5 bg-card shadow-xs space-y-3"
                                            >
                                                <div className="flex items-center justify-between pb-2 border-b border-default-200">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-sm text-foreground">
                                                            {group.category}
                                                        </h4>
                                                        <Badge 
                                                            color={isAllGroupSelected ? "primary" : "secondary"} 
                                                            rounded="full" 
                                                            className="text-xs px-2 py-0.5"
                                                        >
                                                            {groupSelectedCount} / {group.permissions.length}
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleGroup(group.permissions)}
                                                        className="h-7 text-xs font-medium text-primary hover:text-primary/80 px-2"
                                                    >
                                                        {isAllGroupSelected ? "Deselect Group" : "Select Group"}
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                    {group.permissions.map((permission) => {
                                                        const isChecked = selectedPermissionIds.includes(permission.id);
                                                        return (
                                                            <div 
                                                                key={permission.id} 
                                                                onClick={() => togglePermission(permission.id)}
                                                                className={`flex items-center gap-2.5 border p-2.5 rounded-md transition-colors cursor-pointer select-none ${
                                                                    isChecked 
                                                                        ? "border-primary bg-primary/10 text-primary-foreground dark:bg-primary/20" 
                                                                        : "border-default-200 hover:bg-default-100"
                                                                }`}
                                                            >
                                                                <Checkbox 
                                                                    id={permission.id} 
                                                                    checked={isChecked}
                                                                    onCheckedChange={() => togglePermission(permission.id)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                                <Label
                                                                    htmlFor={permission.id}
                                                                    className="text-xs font-medium leading-tight cursor-pointer capitalize flex-1 text-foreground"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {permission.name}
                                                                </Label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-3 border-t border-default-200 mt-2">
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
