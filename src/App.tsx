import "./App.css";
import { TableSearch } from "./components/ui/app/search";
import { useState, useMemo, useEffect } from "react";
import { ContactsTable } from "./components/ui/app/table";
import { AddContactDialog } from "./components/ui/app/add-contact";
import { OrganizationManager } from "./components/ui/app/organization-manager";
import { Button } from "./components/ui/button";
import { PlusCircle, Download, Filter, LogOut } from "lucide-react";
import { FilterDialog } from "./components/ui/app/filter";
import { useContacts } from "./lib/data";
import { exportToExcel } from "./lib/export-util";

// Auth imports
import { useAuth } from "./components/ui/auth/auth-context";
import LoginForm from "./components/ui/auth/login-form";

export function App() {
  // Authentication hook
  const { isAuthenticated, signIn, signOut, isLoading: authLoading } = useAuth();

  // Move these above useContacts
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters, searchQuery]);

  // Use raw contacts from SWR
  const {
    contacts,
    total,
    addContact,
    organizations,
    organizationTypes,
    addOrganization,
    removeOrganization,
    addOrganizationType,
    removeOrganizationType,
    sectors,
    addSector,
    removeSector,
    isLoading: dataLoading,
    error,
  } = useContacts(activeFilters, currentPage, pageSize);

  const totalPages = Math.ceil(total / pageSize);

  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Login Handler Function
  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout Handler Function
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Derive the displayed contacts from raw contacts, active filters, and search query
  const displayedContacts = useMemo(() => {
    let result = contacts;
    // Apply active filters (if any)
    if (Object.keys(activeFilters).length > 0) {
      result = result.filter((contact) => {
        return Object.entries(activeFilters).every(([key, value]) => {
          if (!value) return true;
          const rawValue = contact[key as keyof typeof contact];
          const fieldValue =
            Array.isArray(rawValue)
              ? rawValue.join(", ").toLowerCase()
              : (rawValue?.toLowerCase() || "");
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
        return searchableFields.some((field) => {
          if (!field) return false;
          return Array.isArray(field)
            ? field.join(", ").toLowerCase().includes(searchQuery.toLowerCase())
            : field.toLowerCase().includes(searchQuery.toLowerCase());
        });
      });
    }
    return result;
  }, [contacts, activeFilters, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const applyFilters = (filters: Record<string, string>) => {
    setActiveFilters(filters);
  };

  const handleExport = () => {
    exportToExcel(displayedContacts, "contacts");
  };

  // Show auth loading state
  if (authLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Verifying authentication...</h2>
          <p className="text-muted-foreground">
            Please wait while we check your login status.
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return <LoginForm onSubmit={handleLogin} />;
  }

  // Handle data loading state
  if (dataLoading) {
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

  // Main application UI - only render when authenticated
  return (
    <div className="container mx-auto">
      <header className="!bg-[#00609C] flex !items-center !justify-between !px-6 !py-4 !rounded-b-md !border-b-4 !border-[#80bc00]">
        <div className="flex items-center">
          <img src="/logocircleenglish.jpg" alt="IIJS Logo" className="h-24 !mr-4 !rounded-full" />
          <h1 className="text-3xl font-bold !py-6 !text-white">IIJS Directory</h1>
        </div>
        <Button 
          onClick={handleSignOut}
          variant="outline" 
          className="!text-[#00609C] !border-white hover:!bg-[#00609C] hover:!text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <OrganizationManager
          title="Sectors"
          items={sectors}
          onAdd={addSector}
          onRemove={removeSector}
        />
      </div>
      <div className="!px-2">
        <ContactsTable
          contacts={displayedContacts}
          organizations={organizations}
          organizationTypes={organizationTypes}
          sectors={sectors}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <AddContactDialog
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        organizations={organizations}
        organizationTypes={organizationTypes}
        sectors={sectors}
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
