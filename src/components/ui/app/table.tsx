import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../dropdown-menu";
import { Button } from "../button";
import { Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import type { Contact, Organization, OrganizationType } from "@/lib/types"; 
import { useContacts } from "@/lib/data";
import { AddContactDialog } from "./add-contact";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../dialog";
import { Linkedin, Instagram } from "lucide-react";
import { X } from "lucide-react";

// View Contact Dialog component (to replace the import)
function ViewContactDialog({
  contact,
  isOpen,
  onClose,
}: {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader className="!pl-4 !pt-6">
          <DialogTitle>Contact Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold !pl-4 !pb-1">{contact.fullName}</h3>
            <p className="text-muted-foreground !pl-4 !pb-2">
              {contact.organization} • {contact.organizationType}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 !pl-4">
            <div className="!pb-2">
              <p className="text-m font-semibold text-muted-foreground">Email:</p>
              <p>{contact.email}</p>
            </div>
            <div className="!pb-2">
              <p className="text-m font-semibold text-muted-foreground">Phone:</p>
              <p>{contact.phone}</p>
            </div>
          </div>

          <div>
            <p className="text-m font-semibold text-muted-foreground mb-2 !pl-4 !pb-1">
              Social Media
            </p>
            <div className="flex gap-4 !pl-4">
              {contact.linkedin && (
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
              {contact.instagram && (
                <a
                  href={`https://instagram.com/${contact.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
              )}
              {contact.x && (
                <a
                  href={`https://x.com/${contact.x}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm"
                >
                  <X className="h-4 w-4" />X
                </a>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="!pr-4 !pb-4">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ContactsTableProps {
  contacts: Contact[];
  organizations: Organization[];
  organizationTypes: OrganizationType[];
}

export function ContactsTable({ 
  contacts, 
  organizations, 
  organizationTypes 
}: ContactsTableProps) {
  const { updateContact, deleteContact } = useContacts();
  const [isLoading, setIsLoading] = useState(false);
  const [viewContact, setViewContact] = useState<Contact | null>(null);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [deleteConfirmContact, setDeleteConfirmContact] = useState<Contact | null>(null);

  const handleEdit = (contact: Contact) => {
    setEditContact(contact);
  };

  const handleView = (contact: Contact) => {
    setViewContact(contact);
  };

  const handleDelete = async (contact: Contact) => {
    setDeleteConfirmContact(contact);
  };

  const confirmDelete = async () => {
    if (deleteConfirmContact) {
      setIsLoading(true);
      try {
        await deleteContact(deleteConfirmContact.id);
      } catch (error) {
        console.error("Error deleting contact:", error);
      } finally {
        setIsLoading(false);
        setDeleteConfirmContact(null);
      }
    }
  };

  return (
    <div className="border rounded-md !px-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead className="hidden lg:table-cell">Organization</TableHead>
            <TableHead className="hidden lg:table-cell">Org. Type</TableHead>
            <TableHead className="hidden xl:table-cell">Social</TableHead>
            <TableHead className="text-right !pr-10">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No contacts found. Add a new contact to get started.
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.fullName}</TableCell>
                <TableCell className="hidden md:table-cell">{contact.email}</TableCell>
                <TableCell className="hidden md:table-cell">{contact.phone}</TableCell>
                <TableCell className="hidden lg:table-cell">{contact.organization}</TableCell>
                <TableCell className="hidden lg:table-cell">{contact.organizationType}</TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="flex space-x-2 !gap-1">
                    {contact.linkedin && (<a href={contact.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4" /></a>)}
                    {contact.instagram && (<a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener noreferrer"><Instagram className="h-4 w-4" /></a>)}
                    {contact.x && (<a href={`https://x.com/${contact.x}`} target="_blank" rel="noopener noreferrer"><X className="h-4 w-4" /></a>)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <div className="hidden sm:flex gap-2 !py-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(contact)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(contact)} className="!border-red-500 hover:!bg-red-500 group">
                        <Trash2 className="h-4 w-4 text-red-500 group-hover:!text-white" />
                      </Button>
                    </div>
                    <div className="sm:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(contact)}>View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(contact)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(contact)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {viewContact && (
        <ViewContactDialog 
          contact={viewContact} 
          isOpen={!!viewContact} 
          onClose={() => setViewContact(null)} 
        />
      )}

      {editContact && (
        <AddContactDialog
          isOpen={!!editContact}
          onClose={() => setEditContact(null)}
          organizations={organizations}
          organizationTypes={organizationTypes}
          onAddContact={(updatedContact) => updateContact(editContact.id, updatedContact)}
          initialData={editContact}
          isEditing={true}
        />
      )}

      <AlertDialog open={!!deleteConfirmContact} onOpenChange={(open) => !open && setDeleteConfirmContact(null)}>
        <AlertDialogContent className="sm:max-w-[425px] bg-white">
          <AlertDialogHeader className="!pt-6 !pl-4">
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the contact {deleteConfirmContact?.fullName}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="!pr-4 !pb-4 gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}