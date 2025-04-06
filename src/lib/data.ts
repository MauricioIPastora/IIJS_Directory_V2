import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import type { Contact } from "./types";
import * as api from "./api";

// API base URL from env
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// SWR fetcher function with error handling
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error with status ${response.status}`);
  }
  return response.json();
};

// Custom hook for managing contacts data with SWR
export function useContacts() {
  // Fetch data using SWR
  const {
    data: contactsData,
    error: contactsError,
    isLoading: isContactsLoading,
  } = useSWR(`${API_BASE_URL}/view`, fetcher);

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

// Transform backend data format to match frontend expected format
const contacts = contactsData ? transformContacts(contactsData) : [];
const organizations = orgsData || [];
const organizationTypes = typesData || [];

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
      email: contact.email || '',
      phone: contact.phone_number || '',
      organization: contact.organization || '',
      organizationType: contact.org_type || '',
      linkedin: contact.linkedin || '',
      instagram: contact.instagram || '',
      x: contact.twitter || '', //backend uses 'twitter' field
    }));
  }

  // Add a new contact
  const addContact = async (contact: Omit<Contact, "id">) => {
    try {
      await api.createContact(contact);
      // Revalidate the contacts cache
      mutate('${API_BASE_URL}/view');
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
      // Revalidate the contacts cache
      mutate('${API_BASE_URL}/view');
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
      // Revalidate the contacts cache
      mutate('${API_BASE_URL}/view');
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

  return {
    contacts,
    filteredContacts,
    setFilteredContacts,
    organizations,
    organizationTypes,
    isLoading: isContactsLoading || isOrgsLoading || isTypesLoading,
    error: contactsError || orgsError || typesError,
    addContact,
    updateContact,
    deleteContact,
    addOrganization,
    removeOrganization,
    addOrganizationType,
    removeOrganizationType,
  };
}
