"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
    // هنغير الـ type بتاع setFilteredData عشان يستقبل string (نص البحث)
    setFilteredData: (value: string) => void; 
    placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ setFilteredData, placeholder }) => {
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        setFilteredData(searchValue);
    }, [searchValue, setFilteredData]);

    return (
        <Input
            type="text"
            placeholder={placeholder || "Search products..."}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full max-w-xl"
        />
    );
};

export default SearchInput;