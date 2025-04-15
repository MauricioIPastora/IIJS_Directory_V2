import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../dialog";
import { Button } from "../button";
import { Label } from "../label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import type { Organization, OrganizationType } from "@/lib/types"; // needs to be created still
import { Input } from "../input";

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizations: Organization[];
  organizationTypes: OrganizationType[];
  onApplyFilters: (filters: Record<string, string>) => void;
  activeFilters: Record<string, string>;
}

export function FilterDialog({
  isOpen,
  onClose,
  organizations,
  organizationTypes,
  onApplyFilters,
  activeFilters,
}: FilterDialogProps) {
  const [filters, setFilters] = useState<Record<string, string>>(activeFilters);

  useEffect(() => {
    setFilters(activeFilters);
  }, [activeFilters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApply = () => {
    // Remove empty filters
    const nonEmptyFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "")
    );
    onApplyFilters(nonEmptyFilters);
    onClose();
  };

  const handleClear = () => {
    setFilters({});
    onApplyFilters({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader className="!pl-3 !pt-6">
          <DialogTitle>Filter Contacts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 !p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization" className="!pl-2 !pb-2">Organization</Label>
              <Select
                value={filters.organization || ""}
                onValueChange={(value) =>
                  handleFilterChange("organization", value)
                }
              >
                <SelectTrigger id="organization">
                  <SelectValue placeholder="All organizations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.name}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationType" className="!pl-2 !pb-2">Organization Type</Label>
              <Select
                value={filters.organizationType || ""}
                onValueChange={(value) =>
                  handleFilterChange("organizationType", value)
                }
              >
                <SelectTrigger id="organizationType">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {organizationTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="!p-2">Name</Label>
            <Input
              className="!pl-2"
              id="fullName"
              placeholder="Filter by name"
              value={filters.fullName || ""}
              onChange={(e) => handleFilterChange("fullName", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="!p-2">Email</Label>
              <Input
                className="!pl-2"
                id="email"
                placeholder="Filter by email"
                value={filters.email || ""}
                onChange={(e) => handleFilterChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="!p-2">Phone</Label>
              <Input
                className="!pl-2"
                id="phone"
                placeholder="Filter by phone"
                value={filters.phone || ""}
                onChange={(e) => handleFilterChange("phone", e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between !p-4 !gap-2">
          <Button variant="outline" onClick={handleClear}>
            Clear Filters
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
