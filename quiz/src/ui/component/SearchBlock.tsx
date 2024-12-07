import { Search } from "lucide-react";
import { useState, useCallback } from "react";

interface SearchBlockProps {
    placeholder: string;
    onSearch: (keyword: string) => void;
}

const SearchBlock = ({placeholder, onSearch}: SearchBlockProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            onSearch(searchTerm.trim());
        }
    }, [searchTerm, onSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="flex-1 max-w-3xl mx-12">
            <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleChange}
                    onKeyDown={handleSearch}
                    placeholder={placeholder}
                    className="w-full py-3 pl-10 pr-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
    );
};

export default SearchBlock;