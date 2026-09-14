"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Columns,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Download,
  HelpCircle,
} from "lucide-react";

interface ReaderControlsProps {
  title: string;
  readerMode: "webtoon" | "page";
  setReaderMode: (mode: "webtoon" | "page") => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  jobId: string;
  currentPage: number;
  totalPages: number;
  showHelpModal: boolean;
  setShowHelpModal: (show: boolean) => void;
}

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  title,
  readerMode,
  setReaderMode,
  zoom,
  setZoom,
  isFullscreen,
  toggleFullscreen,
  jobId,
  currentPage,
  totalPages,
  showHelpModal,
  setShowHelpModal,
}) => {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 transition-transform duration-300 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 truncate">
            <Link
              href="/"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
              title="Retour à l'accueil"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="truncate">
              <h1 className="text-sm sm:text-base font-bold text-zinc-100 truncate max-w-xs sm:max-w-md">
                {title}
              </h1>
              <p className="text-xs text-zinc-400">
                Page {currentPage} sur {totalPages}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            <button
              onClick={() => setReaderMode("webtoon")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                readerMode === "webtoon"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Webtoon</span>
            </button>
            <button
              onClick={() => setReaderMode("page")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                readerMode === "page"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Page par Page</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
              <button
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                title="Dézoomer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-zinc-300 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                title="Zoomer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
              title="Raccourcis clavier"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
              title="Plein écran (F)"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-purple-400" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>

            <a
              href={`${API_BASE}/download/${jobId}`}
              download
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
              title="Télécharger l'archive CBZ"
            >
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline">CBZ</span>
            </a>
          </div>
        </div>
      </header>

      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-lg text-zinc-100 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                Raccourcis Clavier
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-zinc-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-zinc-300">
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                <span>Flèche Droite / Espace</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-xs font-mono text-purple-300">
                  Page suivante
                </kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                <span>Flèche Gauche</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-xs font-mono text-purple-300">
                  Page précédente
                </kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                <span>Plein Écran</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-xs font-mono text-purple-300">
                  F
                </kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Changer de mode</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-xs font-mono text-purple-300">
                  M
                </kbd>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
