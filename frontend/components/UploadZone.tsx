"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf" || ext === "cbz" || ext === "zip") {
        setSelectedFile(file);
      } else {
        alert("Veuillez sélectionner un fichier au format .PDF ou .CBZ");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-6">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-2xl transition-all duration-300 ${
          dragActive
            ? "border-purple-500 bg-purple-500/10 scale-[1.01]"
            : selectedFile
            ? "border-purple-500/50 bg-zinc-900/80"
            : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.cbz,.zip"
          onChange={handleChange}
          className="sr-only"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            {selectedFile ? (
              <FileText className="w-8 h-8 text-purple-400" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          {selectedFile ? (
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-zinc-100 font-semibold text-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{selectedFile.name}</span>
              </div>
              <p className="text-sm text-zinc-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Fichier prêt
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-zinc-100">
                Glisse ton PDF ou CBZ ici
              </h3>
              <p className="text-sm text-zinc-400 max-w-sm">
                Ou clique pour parcourir tes fichiers depuis ton appareil.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 text-xs font-medium text-purple-300 border border-zinc-700/60">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Anglais → Français • Qualité bulles propres</span>
          </div>
        </div>
      </div>

      {selectedFile && !isLoading && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-base shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Lancer la traduction</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
