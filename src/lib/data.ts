import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import type { Contact } from "./types";
import * as api from "./api";

// List of all countries (shortened for brevity, expand as needed)
export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia",
  "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
  "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
  "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe"
];

// API base URL from env
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// SWR fetcher function with error handling
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error with status ${response.status}`);
  }
  return response.json();
};

// Custom hook for managing contacts data with SWR
export function useContacts(
  filters?: Record<string, string | undefined>,
  page: number = 1,
  pageSize: number = 20
) {
  // Build query string from filters and pagination
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters)
      .filter(([_, v]) => v)
      .forEach(([k, v]) => params.append(k, v!));
  }
  params.append("page", String(page));
  params.append("pageSize", String(pageSize));

  const queryString = "?" + params.toString();

  const {
    data: contactsData,
    error: contactsError,
    isLoading: isContactsLoading,
  } = useSWR(
    `${API_BASE_URL}/search${queryString}`,
    fetcher
  );

  const {
    data: orgsData,
    error: orgsError,
    isLoading: isOrgsLoading,
  } = useSWR(`${API_BASE_URL}/get_organizations`, fetcher);

  const {
    data: typesData,
    error: typesError,
    isLoading: isTypesLoading,
  } = useSWR(`${API_BASE_URL}/get_organization_types`, fetcher);

  const {
    data: sectorsData,
    error: sectorsError,
    isLoading: isSectorsLoading,
  } = useSWR(`${API_BASE_URL}/get_sectors`, fetcher);

// Transform backend data format to match frontend expected format
// Now contactsData is { results: [...], total: N }
const contacts = contactsData ? transformContacts(contactsData.results) : [];
const total = contactsData ? contactsData.total : 0;
const organizations = orgsData || [];
const organizationTypes = typesData || [];
const sectors = sectorsData || [];

  // Local state for filtered contacts
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);

  // Initialize filtered contacts when contacts data loads
  useEffect(() => {
    if (contacts.length > 0 && filteredContacts.length === 0) {
      setFilteredContacts(contacts);
    }
  }, [contacts, filteredContacts.length]);

  // Transform the backend contact format to match the frontend format
  function transformContacts(backendContacts: any[]): Contact[] {
    return backendContacts.map(contact => ({
      id: contact.id.toString(),
      fullName: contact.full_name,
      email: Array.isArray(contact.email) ? contact.email : parseField(contact.email),
      phone: Array.isArray(contact.phone_number) ? contact.phone_number : parseField(contact.phone_number),
      organization: contact.organization || '',
      organizationType: contact.org_type || '',
      linkedin: contact.linkedin || '',
      instagram: contact.instagram || '',
      x: contact.twitter || '', //backend uses 'twitter' field
      country: contact.country || '',
      sector: contact.sector || '',
    }));
  }

  function parseField(val: string | string[]): string[] {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    
    // Handle PostgreSQL array format: {item1,item2,item3}
    if (val.startsWith('{') && val.endsWith('}')) {
      return val.slice(1, -1).split(', ').map((v) => v.trim()).filter(Boolean);
    }
    
    // Handle comma-separated string
    return val.split(",").map((v) => v.trim()).filter(Boolean);
  }

  // Add a new contact
  const addContact = async (contact: Omit<Contact, "id">) => {
    try {
      await api.createContact(contact);
      // Revalidate all /search keys
      mutate((key) => typeof key === "string" && key.startsWith(`${API_BASE_URL}/search`));
      return true;
    } catch (error) {
      console.error("Failed to add contact:", error);
      throw error;
    }
  };

  // Update an existing contact
  const updateContact = async (
    id: string,
    updatedContact: Omit<Contact, "id">
  ) => {
    try {
      await api.updateContact(id, updatedContact);
      // Revalidate all /search keys
      mutate((key) => typeof key === "string" && key.startsWith(`${API_BASE_URL}/search`));
      return true;
    } catch (error) {
      console.error("Failed to update contact:", error);
      throw error;
    }
  };

  // Delete a contact
  const deleteContact = async (id: string) => {
    try {
      await api.deleteContact(id);
      // Revalidate all /search keys
      mutate((key) => typeof key === "string" && key.startsWith(`${API_BASE_URL}/search`));
      return true;
    } catch (error) {
      console.error("Failed to delete contact:", error);
      throw error;
    }
  };

  // Add a new organization
  const addOrganization = async (name: string) => {
    try {
      await api.createOrganization(name);
      // Revalidate the organizations cache
      mutate(`${API_BASE_URL}/get_organizations`);
      return true;
    } catch (error) {
      console.error("Failed to add organization:", error);
      throw error;
    }
  };

  // Remove an organization
  const removeOrganization = async (id: string) => {
    try {
      await api.deleteOrganization(id);
      // Revalidate the organizations cache
      mutate(`${API_BASE_URL}/get_organizations`);
      return true;
    } catch (error) {
      console.error("Failed to remove organization:", error);
      throw error;
    }
  };

  // Add a new organization type
  const addOrganizationType = async (name: string) => {
    try {
      await api.createOrganizationType(name);
      // Revalidate the organization types cache
      mutate(`${API_BASE_URL}/get_organization_types`);
      return true;
    } catch (error) {
      console.error("Failed to add organization type:", error);
      throw error;
    }
  };

  // Remove an organization type
  const removeOrganizationType = async (id: string) => {
    try {
      await api.deleteOrganizationType(id);
      // Revalidate the organization types cache
      mutate(`${API_BASE_URL}/get_organization_types`);
      return true;
    } catch (error) {
      console.error("Failed to remove organization type:", error);
      throw error;
    }
  };

  const addSector = async (name: string) => {
    await api.createSector(name);
    mutate(`${API_BASE_URL}/get_sectors`);
  };
  const removeSector = async (id: string) => {
    await api.deleteSector(id);
    mutate(`${API_BASE_URL}/get_sectors`);
  };

  return {
    contacts,
    total,
    filteredContacts,
    setFilteredContacts,
    organizations,
    organizationTypes,
    sectors,
    isLoading: isContactsLoading || isOrgsLoading || isTypesLoading || isSectorsLoading,
    error: contactsError || orgsError || typesError || sectorsError,
    addContact,
    updateContact,
    deleteContact,
    addOrganization,
    removeOrganization,
    addOrganizationType,
    removeOrganizationType,
    addSector,
    removeSector,
  };
}
