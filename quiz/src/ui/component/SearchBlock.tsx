import { Search } from "lucide-react";

interface SearchBlockProps {
    placeholder: string
}

const SearchBlock = ({placeholder}: SearchBlockProps) => {
    return (
        <div className="flex-1 max-w-3xl mx-12">
            <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full py-2 pl-10 pr-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
    )

}

export default SearchBlock;