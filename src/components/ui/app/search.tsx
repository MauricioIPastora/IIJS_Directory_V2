import { useState, useEffect } from "react";
import {
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandDialog,
} from "@/components/ui/command";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TableSearchProps {
  onSearch: (query: string) => void;
}

export function TableSearch({ onSearch }: TableSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  // Function to handle key down events in the search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission or other default behavior
      onSearch(query);
      setOpen(false);
    }
  };

  // Function to handle key down events in the CommandInput (inside dialog)
  const handleCommandKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default command behavior
      e.stopPropagation(); // Stop event from bubbling up
      onSearch(query);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search contacts... (Press ⌘K)"
        className="w-full !pl-10"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onClick={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      <div className="!bg-white !rounded-lg !overflow-hidden">
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="!bg-white !px-2 !py-2">
        <CommandInput
          className="!pl-1 !py-1 !bg-white"
          placeholder="Search contacts..."
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            handleSearch(value);
          }}
          onKeyDown={handleCommandKeyDown}
        /></div>
        <CommandList className="!pl-3 !py-1 bg-white">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions" className="bg-white">
            <CommandItem 
              onSelect={() => {
                handleSearch("OAS");
                setOpen(false);
              }} 
              className="hover:bg-gray-100"
            >
              <span>Search for OAS contacts</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => {
                handleSearch("Embassy");
                setOpen(false);
              }} 
              className="hover:bg-gray-100"
            >
              <span>Search for Embassy contacts</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => {
                handleSearch("Private");
                setOpen(false);
              }} 
              className="hover:bg-gray-100"
            >
              <span>Search for Private Organization contacts</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Tips">
            <CommandItem>
              <span>Use organization:acme to filter by organization</span>
            </CommandItem>
            <CommandItem>
              <span>Use type:client to filter by organization type</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      </div>
    </div>
  );
}