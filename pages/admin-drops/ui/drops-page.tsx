/**
 * Admin Drops Page Component
 * 
 * Integrates all drop features:
 * - drop-list
 * - drop-create
 * - drop-validate
 * - drop-send
 */

"use client";

import { useState } from "react";
import { DropList } from "@/features/drop-list";
import { SendDropButton } from "@/features/drop-send";
import { DropValidationCard } from "@/features/drop-validate";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Drop } from "@/entities/drop";

export function DropsPage() {
  const router = useRouter();
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Drops</h1>
          <p className="text-muted-foreground">
            Gérer vos campagnes marketing WhatsApp
          </p>
        </div>
        <Button onClick={() => router.push("/admin/drops/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau drop
        </Button>
      </div>

      {/* Drop List */}
      <DropList
        onView={(drop) => setSelectedDrop(drop)}
        onSend={(drop) => setSelectedDrop(drop)}
        onDelete={(drop) => {
          // Handle delete
          console.log("Delete drop:", drop.id);
        }}
      />

      {/* Drop Detail Dialog */}
      <Dialog
        open={!!selectedDrop}
        onOpenChange={(open) => !open && setSelectedDrop(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDrop?.name}</DialogTitle>
          </DialogHeader>
          {selectedDrop && (
            <div className="space-y-6">
              {/* Validation */}
              <DropValidationCard
                dropId={selectedDrop.id}
                dropName={selectedDrop.name}
              />

              {/* Send Button */}
              <SendDropButton
                dropId={selectedDrop.id}
                dropName={selectedDrop.name}
                onSuccess={() => setSelectedDrop(null)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
