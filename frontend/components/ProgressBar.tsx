"use client";

import React from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle, BookOpen, Download } from "lucide-react";

interface ProgressBarProps {
  status: "queued" | "processing" | "completed" | "failed" | string;
  progress: number;
  message: string;
  error?: string | null;
  jobId?: string | null;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  status,
  progress,
  message,
  error,
  jobId,
}) => {
  const isCompleted = status === "completed";
  const isFailed = status === "failed";
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <div className="w-full max-w-2xl mx-auto my-6 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          ) : isFailed ? (
            <AlertCircle className="w-6 h-6 text-red-400" />
          ) : (
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          )}
          <div>
            <h4 className="font-semibold text-zinc-100 text-base">
              {isCompleted
                ? "Traduction terminée !"
                : isFailed
                ? "Échec de la traduction"
                : "Traduction en cours..."}
            </h4>
            <p className="text-sm text-zinc-400">{message}</p>
          </div>
        </div>
        <span className="text-lg font-bold text-purple-400">{progress}%</span>
      </div>

      <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isCompleted
              ? "bg-emerald-500"
              : isFailed
              ? "bg-red-500"
              : "bg-gradient-to-r from-purple-600 to-indigo-500"
          }`}
          style={{ width: `${Math.max(5, progress)}%` }}
        />
      </div>

      {isFailed && error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          {error}
        </div>
      )}

      {isCompleted && jobId && (
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href={`/reader/${jobId}`}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/25 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Ouvrir dans le Lecteur Webtoon</span>
          </Link>
          <a
            href={`${API_BASE}/download/${jobId}`}
            download
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm border border-zinc-700 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger le CBZ</span>
          </a>
        </div>
      )}
    </div>
  );
};
