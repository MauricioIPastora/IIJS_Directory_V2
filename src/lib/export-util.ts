import * as XLSX from "xlsx";
import type { Contact } from "./types"; // have to modify this with backend or something not sure yet

export function exportToExcel(contacts: Contact[], filename: string) {
  // Create a worksheet
  const worksheet = XLSX.utils.json_to_sheet(
    contacts.map((contact) => ({
      "Full Name": contact.fullName,
      Email: contact.email,
      Phone: contact.phone,
      Organization: contact.organization,
      "Organization Type": contact.organizationType,
      LinkedIn: contact.linkedin || "",
      Instagram: contact.instagram || "",
      X: contact.x || "",
    }))
  );

  // Create a workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
