import { useState } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { PlusCircle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import type { Organization, OrganizationType } from "@/lib/types"; // needs to be made still

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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder={`Add new ${title.toLowerCase().slice(0, -1)}...`}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} size="icon" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge
              key={item.id}
              variant="secondary"
              className="flex items-center gap-1 py-1 px-3"
            >
              {item.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
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
