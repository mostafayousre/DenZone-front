"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useGetUsersWithFavorites from "@/services/products/getUsersWithFavorites";

const FavoritesPage = () => {
    const t = useTranslations("productList");
    const { getUsersWithFavorites, loading, error, data } = useGetUsersWithFavorites();

    useEffect(() => {
        getUsersWithFavorites();
    }, []);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500 text-center">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Heart className="text-red-500 fill-red-500" />
                <h1 className="text-2xl font-bold">{t("favorites")}</h1>
            </div>

            {data.length === 0 ? (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        No favorites found.
                    </CardContent>
                </Card>
            ) : (
                data.map((user) => (
                    <Card key={user.userId} className="overflow-hidden">
                        <CardHeader className="bg-muted/50 border-b py-3 px-4">
                            <CardTitle className="text-lg flex justify-between items-center">
                                <span>{user.fullName}</span>
                                <span className="text-xs font-normal text-muted-foreground">
                                    {user.userId}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[300px]">Product Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="hidden md:table-cell">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {user.favorites.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium py-3">
                                                {product.name}
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {product.arabicName}
                                                </div>
                                            </TableCell>
                                            <TableCell>{product.categoryName}</TableCell>
                                            <TableCell className="max-w-md truncate hidden md:table-cell" title={product.description}>
                                                {product.description}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
};

export default FavoritesPage;
