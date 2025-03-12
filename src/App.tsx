import { DialogOverlay } from "node_modules/@radix-ui/react-dialog/dist";
import "./App.css";
import { TableSearch } from "./components/ui/app/search";
import { useState } from "react";
import { ContactsTable } from "./components/ui/app/table";
import { AddContactDialog } from "./components/ui/app/add-contact";
import { OrganizationManager } from "./components/ui/app/organization-manager";
import { Button } from "./components/ui/button";
import { PlusCircle, Download, Filter } from "lucide-react";
import { FilterDialog } from "./components/ui/app/filter";
import { useContacts } from "./lib/data";
import type { Contact } from "./lib/types";
import { exportToExcel } from "./lib/export-util";

export function App() {
  const {
    contacts,
    filteredContacts,
    setFilteredContacts,
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
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {}
  );

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
            Error connecting to database
          </h2>
          <p className="text-muted-foreground mb-4">
            There was a problem connecting to your database. Please try again
            later.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query) {
      // If no search query, just apply filters
      applyFilters(activeFilters);
      return;
    }

    // Filter the already filtered contacts 
    const baseContacts =
      Object.keys(activeFilters).length > 0 ? filteredContacts : contacts;

    const results = baseContacts.filter((contact) => {
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
        field?.toLowerCase().includes(query.toLowerCase())
      );
    });

    setFilteredContacts(results);
  };

  const applyFilters = (filters: Record<string, string>) => {
    setActiveFilters(filters);

    if (Object.keys(filters).length === 0) {
      // If no filters, just apply search
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setFilteredContacts(contacts);
      }
      return;
    }

    const results = contacts.filter((contact) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return (
          contact[key as keyof Contact]?.toLowerCase() === value.toLowerCase()
        );
      });
    });

    // If there's a search query, further filter the results
    if (searchQuery) {
      const searchResults = results.filter((contact) => {
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

      setFilteredContacts(searchResults);
    } else {
      setFilteredContacts(results);
    }
  };

  const handleExport = () => {
    exportToExcel(filteredContacts, "contacts");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Company Contacts Database</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <TableSearch onSearch={handleSearch} />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2"
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
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Contact
          </Button>

          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
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

      <ContactsTable
        contacts={filteredContacts}
        organizations={organizations}
        organizationTypes={organizationTypes}
      />

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
