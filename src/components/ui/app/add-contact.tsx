import { useState, useEffect } from "react";
import {
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogContent,
  Dialog,
} from "../dialog";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { Contact, Organization, OrganizationType } from "@/lib/types";

interface AddContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizations: Organization[];
  organizationTypes: OrganizationType[];
  onAddContact: (contact: Omit<Contact, "id">) => void;
  initialData?: Contact;
  isEditing?: boolean;
}

export function AddContactDialog({
  isOpen,
  onClose,
  organizations,
  organizationTypes,
  onAddContact,
  initialData,
  isEditing = false,
}: AddContactDialogProps) {
  const [formData, setFormData] = useState<Omit<Contact, "id">>({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    organizationType: "",
    linkedin: "",
    instagram: "",
    x: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName,
        email: initialData.email,
        phone: initialData.phone,
        organization: initialData.organization,
        organizationType: initialData.organizationType,
        linkedin: initialData.linkedin || "",
        instagram: initialData.instagram || "",
        x: initialData.x || "",
      });
    } else {
      // Reset form when opening for a new contact
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        organization: "",
        organizationType: "",
        linkedin: "",
        instagram: "",
        x: "",
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof Omit<Contact, "id">, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onAddContact(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting contact:", error);
      // Add error handling Ui here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader className="!pl-3 !pt-6">
          <DialogTitle>
            {isEditing ? "Edit Contact" : "Add New Contact"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 !pl-2">
              <Label htmlFor="fullName" className="!p-2 !font-semibold">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="John Doe"
                className="!p-1 !border-2"
              />
            </div>
            <div className="space-y-2 !pr-2">
              <Label htmlFor="email" className="!p-2 !font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="john@example.com"
                className="!p-1 !border-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 !pl-2">
              <Label htmlFor="phone" className="!p-2 !font-semibold">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="!p-1 !border-2"
              />
            </div>
            <div className="space-y-2 !pr-2">
              <Label htmlFor="organization" className="!p-2 !font-semibold">Organization</Label>
              <Select
                value={formData.organization}
                onValueChange={(value) => handleChange("organization", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent className="!bg-white !p-1">
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.name} className="hover:!cursor-pointer hover:!bg-gray-200">
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 !px-2">
              <Label htmlFor="organizationType" className="!p-2 !font-semibold">Organization Type</Label>
              <Select
                value={formData.organizationType}
                onValueChange={(value) =>
                  handleChange("organizationType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="!bg-white !p-1">
                  {organizationTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name} className="hover:!cursor-pointer hover:!bg-gray-200">
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 !px-2">
            <Label className="!p-2 !font-semibold">Social Media</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Input
                  value={formData.linkedin}
                  onChange={(e) => handleChange("linkedin", e.target.value)}
                  placeholder="LinkedIn URL"
                  className="!p-1 !border-2"
                />
              </div>
              <div>
                <Input
                  value={formData.instagram}
                  onChange={(e) => handleChange("instagram", e.target.value)}
                  placeholder="Instagram handle"
                  className="!p-1 !border-2"
                />
              </div>
              <div>
                <Input
                  value={formData.x}
                  onChange={(e) => handleChange("x", e.target.value)}
                  placeholder="X handle"
                  className="!p-1 !border-2"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="!p-3 gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isEditing
              ? "Save Changes"
              : "Add Contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
