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
import { Plus } from "lucide-react";

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
  const [emailList, setEmailList] = useState<string[]>([""]);
  const [phoneList, setPhoneList] = useState<string[]>([""]);
  
  useEffect(() => {
    const cleanList = (value: string | undefined | null): string[] => {
      if (!value) return [""];
      return value
        .replace(/^\{|\}$/g, "") // remove leading/trailing braces
        .split(",")
        .map((v) => v.trim());
    };
  
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
  
      setEmailList(
        cleanList(Array.isArray(initialData.email) ? initialData.email.join(",") : initialData.email)
      );
      setPhoneList(
        cleanList(Array.isArray(initialData.phone) ? initialData.phone.join(",") : initialData.phone)
      );
    } else {
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
      setEmailList([""]);
      setPhoneList([""]);
    }
  }, [initialData]);
  
  

  const handleChange = (field: keyof Omit<Contact, "id">, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  async function handleSubmit() {
    setIsSubmitting(true);

    const cleanedEmails = emailList.map((e) => e.trim()).filter((e) => e);
    const cleanedPhones = phoneList.map((p) => p.trim()).filter((p) => p);

    const submitData = {
      ...formData,
      email: cleanedEmails.length <= 1 ? (cleanedEmails[0] || "") : cleanedEmails, // MODIFIED
      phone: cleanedPhones.length <= 1 ? (cleanedPhones[0] || "") : cleanedPhones, // MODIFIED
    };

    try {
      await onAddContact(submitData);
      onClose();
    } catch (error) {
      console.error("Error submitting contact:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

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
              <div className="space-y-2 !pl-2">
                <Label htmlFor="fullName" className="!p-2 !font-semibold">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="John Doe"
                  className="!p-1 !border-2"
                />
              </div>
              <div className="space-y-2 !pr-2">
                <Label className="!p-2 !font-semibold">Email</Label>
                {emailList.map((email, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const updated = [...emailList];
                        updated[idx] = e.target.value;
                        setEmailList(updated);
                      }}
                      placeholder="john@example.com"
                    />
                    {idx === emailList.length - 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEmailList([...emailList, ""])}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 !pl-2">
            <Label className="!p-2 font-semibold">Phone</Label>
        {phoneList.map((phone, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <Input
              value={phone}
              onChange={(e) => {
                const updated = [...phoneList];
                updated[idx] = e.target.value;
                setPhoneList(updated);
              }}
              placeholder="+1 (555) 123-4567"
            />
            {idx === phoneList.length - 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setPhoneList([...phoneList, ""])}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}  
          </div>
        ))}
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
