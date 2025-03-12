export interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  organizationType: string;
  linkedin?: string;
  instagram?: string;
  x?: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface OrganizationType {
  id: string;
  name: string;
}
