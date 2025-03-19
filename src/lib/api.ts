// API client for interacting with the backend
import type { Contact } from "./types";

// Use environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || "";
console.log(`API_BASE_URL: ${API_BASE_URL}`); // Debugging line to check the API URL

// To handle API errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Error: ${response.status}`); 
  }
  return response.json();
};

// Contacts API
export async function fetchContacts() {
  const response = await fetch(`${API_BASE_URL}/view`);
  return handleResponse(response);
}

export async function fetchContact(id: string) {
  const response = await fetch(`${API_BASE_URL}/view/${id}`);
  return handleResponse(response);
}

export async function createContact(contact: Omit<Contact, "id">) {
  const transformedContact = {
    full_name: contact.fullName,
    email: contact.email,
    phone_number: contact.phone,
    organization: contact.organization,
    org_type: contact.organizationType,
    linkedin: contact.linkedin || '',
    instagram: contact.instagram || '',
    twitter: contact.x || ''
  };

  const response = await fetch(`${API_BASE_URL}/insert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
    },
    body: JSON.stringify(transformedContact),
  });
  return handleResponse(response);
}

export async function updateContact(id: string, contact: Omit<Contact, "id">) {
  const transformedContact = {
    full_name: contact.fullName,
    email: contact.email,
    phone_number: contact.phone,
    organization: contact.organization,
    org_type: contact.organizationType,
    linkedin: contact.linkedin || '',
    instagram: contact.instagram || '',
    twitter: contact.x || ''
  };

  const response = await fetch(`${API_BASE_URL}/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transformedContact),
  });
  return handleResponse(response);
}

export async function deleteContact(id: string) {
  const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

// Organizations API
export async function fetchOrganizations() {
  const response = await fetch(`${API_BASE_URL}/get_organizations`);
  return handleResponse(response);
}

export async function createOrganization(name: string) {
  const response = await fetch(`${API_BASE_URL}/add_organization`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
}

export async function deleteOrganization(id: string) {
  const response = await fetch(`${API_BASE_URL}/delete_organization/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

// Organization Types API
export async function fetchOrganizationTypes() {
  const response = await fetch(`${API_BASE_URL}/get_organization_types`);
  return handleResponse(response);
}

export async function createOrganizationType(name: string) {
  const response = await fetch(`${API_BASE_URL}/add_organization_type`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
}

export async function deleteOrganizationType(id: string) {
  const response = await fetch(`${API_BASE_URL}/delete_organization_type/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}
