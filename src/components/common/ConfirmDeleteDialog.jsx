"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const ConfirmDeleteDialog = ({ open, onClose, onConfirm, title = "Delete Item", description }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-red-600">{title}</DialogTitle>
          <DialogDescription className="text-gray-600">
            {description || "Are you sure you want to delete this item? This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <DialogClose asChild>
            <button className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition">
              Cancel
            </button>
          </DialogClose>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
