import "./App.css";
import { TableSearch } from "./components/ui/app/search";
import { useState, useMemo } from "react";
import { ContactsTable } from "./components/ui/app/table";
import { AddContactDialog } from "./components/ui/app/add-contact";
import { OrganizationManager } from "./components/ui/app/organization-manager";
import { Button } from "./components/ui/button";
import { PlusCircle, Download, Filter } from "lucide-react";
import { FilterDialog } from "./components/ui/app/filter";
import { useContacts } from "./lib/data";
import { exportToExcel } from "./lib/export-util";

export function App() {
  // Use raw contacts from SWR (remove filteredContacts from the hook)
  const {
    contacts,
    addContact,
    organizations,
    organizationTypes,
    addOrganization,
    removeOrganization,
    addOrganizationType,
    removeOrganizationType,
    isLoading,
    error,
  } = useContacts();

  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Derive the displayed contacts from raw contacts, active filters, and search query
  const displayedContacts = useMemo(() => {
    let result = contacts;
    // Apply active filters (if any)
    if (Object.keys(activeFilters).length > 0) {
      result = result.filter((contact) => {
        return Object.entries(activeFilters).every(([key, value]) => {
          if (!value) return true;
          const fieldValue = contact[key as keyof typeof contact]?.toLowerCase() || "";
          return fieldValue.includes(value.toLowerCase());
        });
      });
    }
    // Apply search query (if any)
    if (searchQuery) {
      result = result.filter((contact) => {
        const searchableFields = [
          contact.fullName,
          contact.email,
          contact.phone,
          contact.organization,
          contact.organizationType,
          contact.linkedin,
          contact.instagram,
          contact.x,
        ];
        return searchableFields.some((field) =>
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }
    return result;
  }, [contacts, activeFilters, searchQuery]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading database...</h2>
          <p className="text-muted-foreground">
            Please wait while we connect to the database.
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-destructive">
            Error connecting to application
          </h2>
          <p className="text-muted-foreground mb-4">
            There was a problem loading your application. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const applyFilters = (filters: Record<string, string>) => {
    setActiveFilters(filters);
  };

  const handleExport = () => {
    exportToExcel(displayedContacts, "contacts");
  };

  return (
    <div className="container mx-auto">
      <header className="!bg-[#00609C] flex !items-center !px-6 !py-4 !rounded-b-md !border-b-4 !border-[#80bc00]">
        <img src="/logocircleenglish.jpg" alt="IIJS Logo" className="h-24 !mr-4 !rounded-full" />
        <h1 className="text-3xl font-bold !py-6 !text-white">IIJS Directory</h1>
      </header>
      <div className="flex flex-col md:flex-row !gap-4 !pt-4 !px-2">
        <div className="flex-1">
          <TableSearch onSearch={handleSearch} />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 !text-[#636569] hover:!text-white hover:!bg-[#636569] !border-[#636569]"
          >
            <Filter className="h-4 w-4" />
            Filter
            {Object.keys(activeFilters).length > 0 && (
              <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </Button>
          <Button
            onClick={() => setIsAddContactOpen(true)}
            className="flex items-center gap-2 !border-[#80BC00] !text-[#80BC00] hover:!bg-[#80BC00] hover:!text-white"
          >
            <PlusCircle className="h-4 w-4" />
            Add Contact
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2 !border-[#00609C]"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OrganizationManager
          title="Organizations"
          items={organizations}
          onAdd={addOrganization}
          onRemove={removeOrganization}
        />
        <OrganizationManager
          title="Organization Types"
          items={organizationTypes}
          onAdd={addOrganizationType}
          onRemove={removeOrganizationType}
        />
      </div>
      <div className="!px-2">
        <ContactsTable
          contacts={displayedContacts}
          organizations={organizations}
          organizationTypes={organizationTypes}
        />
      </div>
      <AddContactDialog
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        organizations={organizations}
        organizationTypes={organizationTypes}
        onAddContact={addContact}
      />
      <FilterDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        organizations={organizations}
        organizationTypes={organizationTypes}
        onApplyFilters={applyFilters}
        activeFilters={activeFilters}
      />
    </div>
  );
}

export default App;
