"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { X, UploadCloud } from "lucide-react";

interface AddProjectPopupProps {
  open: boolean;
  onClose: () => void;
}

export default function AddProjectPopup({ open, onClose }: AddProjectPopupProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visionFile, setVisionFile] = useState<File | null>(null);
  const [requirementsFile, setRequirementsFile] = useState<File | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-lg w-full max-w-lg p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-primary transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={22} />
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Add Project</h2>
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Title</label>
            <input
              type="text"
              className="w-full rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Project title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Description</label>
            <textarea
              className="w-full rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none min-h-[80px]"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Project description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Vision Document (PDF)</label>
            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-dashed border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark hover:bg-primary/10 transition-colors">
              <UploadCloud size={18} />
              <span className="text-sm">
                {visionFile ? visionFile.name : "Upload PDF"}
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={e => setVisionFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Requirements Document (PDF)</label>
            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-dashed border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark hover:bg-primary/10 transition-colors">
              <UploadCloud size={18} />
              <span className="text-sm">
                {requirementsFile ? requirementsFile.name : "Upload PDF"}
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={e => setRequirementsFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="rounded-lg px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-lg px-4 py-2 bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
              // No submit action for now
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
