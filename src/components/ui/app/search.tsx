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

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search contacts... (Press ⌘K)"
        className="w-full pl-8"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onClick={() => setOpen(true)}
      />
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search contacts..."
          value={query}
          onValueChange={handleSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => handleSearch("marketing")}>
              <span>Search for OAS contacts</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSearch("sales")}>
              <span>Search for Embassy contacts</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSearch("tech")}>
              <span>Search for Private contacts</span>
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
  );
}
