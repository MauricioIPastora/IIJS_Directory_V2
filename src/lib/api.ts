// API client for interacting with the backend
import type { Contact } from "./types";

// Use environment variable with fallback
const API_BASE_URL =  import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL environment variable is not set");
}

console.log(`API_BASE_URL: ${API_BASE_URL}`); // Debugging line to check the API URL

// To handle API errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Error: ${response.status}`); 
  }
  return response.json();
};

const standardizePhoneForDB = (phoneNumber: string): string => {
  if (!phoneNumber) return "";
  // strip all non-digit characters except leading +
  let standardized = phoneNumber.trim();

  if (standardized.startsWith("+")) {
    standardized = '+' + standardized.substring(1).replace(/\D/g, "");
  } else {
    standardized = '+1' + standardized.replace(/\D/g, "");
}

  return standardized;
};

const formatPhoneForDisplay = (standardizedPhone: string): string => {
  if (!standardizedPhone) return "";
  
  // Extract country code and number
  if (standardizedPhone.startsWith("+1") && standardizedPhone.length === 12) {
    // US number: +17039397628 -> (703) 939-7628
    const number = standardizedPhone.substring(2);
    return `(${number.substring(0, 3)}) ${number.substring(3, 6)}-${number.substring(6)}`;
  } else if (standardizedPhone.startsWith("+")) {
    // International number: +3444448888 -> +34 4444 8888
    const countryCode = standardizedPhone.substring(0, 3);
    const number = standardizedPhone.substring(3);
    const midPoint = Math.ceil(number.length / 2);
    return `${countryCode} ${number.substring(0, midPoint)} ${number.substring(midPoint)}`;
  }
  
  return standardizedPhone;
};

// Contacts API
export async function fetchContacts() {
  const response = await fetch(`${API_BASE_URL}/view`);
  const contacts = await handleResponse(response);
  
  // Transform phone numbers for display
  return contacts.map((contact: any) => ({
    ...contact,
    phone: formatPhoneForDisplay(contact.phone_number),
    fullName: contact.full_name,
    organizationType: contact.org_type
  }));
}

export async function fetchContact(id: string) {
  const response = await fetch(`${API_BASE_URL}/view/${id}`);
  return handleResponse(response);
}

export async function createContact(contact: Omit<Contact, "id">) {
  const transformedContact = {
    full_name: contact.fullName,
    email: contact.email,
    phone_number: Array.isArray(contact.phone)
  ? contact.phone.map((num) => standardizePhoneForDB(num))
  : standardizePhoneForDB(contact.phone),
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
    phone_number: Array.isArray(contact.phone)
  ? contact.phone.map((num) => standardizePhoneForDB(num))
  : standardizePhoneForDB(contact.phone),
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
  console.log(`Contact edited in api: ${response.status}`);
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

export async function createSector(name: string) {
  const response = await fetch(`${API_BASE_URL}/add_sector`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
}

export async function deleteSector(id: string) {
  const response = await fetch(`${API_BASE_URL}/delete_sector/${id}`, {
    method: "DELETE" });
  return handleResponse(response);
}
