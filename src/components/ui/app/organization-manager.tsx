import { useState } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { PlusCircle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import type { Organization, OrganizationType } from "@/lib/types";

interface OrganizationManagerProps {
  title: string;
  items: Organization[] | OrganizationType[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

export function OrganizationManager({
  title,
  items,
  onAdd,
  onRemove,
}: OrganizationManagerProps) {
  const [newItem, setNewItem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (newItem.trim()) {
      setIsSubmitting(true);
      try {
        await onAdd(newItem.trim());
        setNewItem("");
      } catch (error) {
        console.error(
          `Error adding ${title.toLowerCase().slice(0, -1)}:`,
          error
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card className="!m-3">
      <CardHeader className="!pl-6 !pt-6">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex !gap-3 mb-4 !px-2">
          <Input
            className="!pl-2"
            placeholder={`Add new ${title.toLowerCase().slice(0, -1)}...`}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} size="icon" disabled={isSubmitting} className="!border-[#00609c]">
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="!flex !flex-wrap !gap-3 !p-4">
          {items.map((item) => (
            <Badge
              key={item.id}
              variant="secondary"
              className="flex items-center gap-1 py-1 px-3 hover:cursor-pointer hover:bg-gray-200"
            >
              {item.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 !text-[#636569] hover:!text-white"
                onClick={() => onRemove(item.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No {title.toLowerCase()} added yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
