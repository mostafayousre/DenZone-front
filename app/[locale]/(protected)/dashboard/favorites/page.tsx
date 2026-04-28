"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Heart, User, Package, Tag, Layers, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import useGetUsersWithFavorites from "@/services/products/getUsersWithFavorites";

const FavoritesPage = () => {
    const t = useTranslations("productList");
    const searchParams = useSearchParams();
    const router = useRouter();
    const filterUserId = searchParams ? searchParams.get("userId") : null;
    const { getUsersWithFavorites, loading, error, data } = useGetUsersWithFavorites();

    useEffect(() => {
        getUsersWithFavorites();
    }, []);

    const filteredData = useMemo(() => {
        if (!filterUserId) return data;
        return data.filter(user => user.userId === filterUserId);
    }, [data, filterUserId]);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted-foreground animate-pulse font-medium">
                    Loading favorites...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/20 bg-destructive/5 m-4">
                <CardContent className="p-8 text-center text-destructive">
                    <p className="font-semibold text-lg">{error}</p>
                    <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => getUsersWithFavorites()}
                    >
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8 p-1 sm:p-4 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-50 rounded-2xl shadow-sm">
                        <Heart className="text-red-500 fill-red-500 w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">{t("favorites")}</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage and view user's favorite dental products
                        </p>
                    </div>
                </div>
                {filterUserId && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.push('/dashboard/favorites')}
                        className="w-fit"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        View All
                    </Button>
                )}
            </div>

            {filteredData.length === 0 ? (
                <Card className="border-dashed shadow-none">
                    <CardContent className="p-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-muted rounded-full">
                                <Heart className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-muted-foreground text-lg font-medium">
                                {filterUserId ? "No favorites found for this user." : "Your favorite list is empty."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-8">
                    {filteredData.map((user) => (
                        <Card key={user.userId} className="overflow-hidden border-none shadow-xl bg-card transition-all hover:shadow-2xl">
                            <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b py-4 px-6">
                                <CardTitle className="text-xl flex justify-between items-center">
                                    <div className="flex items-center gap-3 text-foreground/90">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User size={20} />
                                        </div>
                                        <span className="font-bold">{user.fullName}</span>
                                    </div>
                                    <Badge color="default" className="font-mono text-xs font-semibold py-1">
                                        ID: {user.userId}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-transparent border-b">
                                            <TableHead className="py-4 px-6 w-[400px] font-bold text-foreground/70 uppercase text-[10px] tracking-widest">
                                                <div className="flex items-center gap-2">
                                                    <Package size={14} /> Product Details
                                                </div>
                                            </TableHead>
                                            <TableHead className="py-4 px-6 font-bold text-foreground/70 uppercase text-[10px] tracking-widest">
                                                <div className="flex items-center gap-2">
                                                    <Layers size={14} /> Category
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {user.favorites.map((product) => (
                                            <TableRow key={product.id} className="group hover:bg-muted/20 transition-colors border-b last:border-0">
                                                <TableCell className="py-5 px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold group-hover:text-primary transition-colors text-base">
                                                            {product.name}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground font-arabic leading-relaxed">
                                                            {product.arabicName}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5 px-6">
                                                    <Badge color="secondary" className="px-3 py-1 rounded-md bg-secondary/50 text-secondary-foreground flex w-fit items-center gap-1.5 font-medium transition-all group-hover:bg-primary/10 group-hover:text-primary">
                                                        <Tag size={12} className="opacity-70" />
                                                        {product.categoryName}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;
