"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
    data?: any[];
    setFilteredData: (value: any[]) => void; 
    filterKey?: string;
    placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ data = [], setFilteredData, filterKey = "name", placeholder }) => {
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        if (!searchValue) {
            setFilteredData(data);
        } else {
            const filtered = data.filter((item) =>
                String(item[filterKey]).toLowerCase().includes(searchValue.toLowerCase())
            );
            setFilteredData(filtered);
        }
    }, [searchValue, data, filterKey, setFilteredData]);

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