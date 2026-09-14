"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageReaderProps {
  jobId: string;
  pages: string[];
  currentPage: number;
  onPageChange: (pageIndex: number) => void;
  zoom: number;
}

export const PageReader: React.FC<PageReaderProps> = ({
  jobId,
  pages,
  currentPage,
  onPageChange,
  zoom,
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const totalPages = pages.length;

  const prevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevPage();
      } else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextPage();
      } else {
        prevPage();
      }
    }
    setTouchStart(null);
  };

  const pageFilename = pages[currentPage - 1];

  return (
    <div
      className="min-h-screen bg-[#0a0a0b] pt-20 pb-20 flex flex-col items-center justify-center relative select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={prevPage}
        disabled={currentPage <= 1}
        className={`fixed left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 hover:bg-purple-600 text-white border border-zinc-800 transition-all z-30 shadow-2xl ${
          currentPage <= 1 ? "opacity-30 cursor-not-allowed" : "hover:scale-110"
        }`}
        title="Page précédente (Flèche Gauche)"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {pageFilename && (
        <div
          className="flex justify-center items-center transition-all duration-200"
          style={{ width: `${Math.round(100 * zoom)}%`, maxWidth: `${800 * zoom}px` }}
        >
          <img
            src={`${API_BASE}/jobs/${jobId}/page/${pageFilename}`}
            alt={`Page ${currentPage}`}
            className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}

      <button
        onClick={nextPage}
        disabled={currentPage >= totalPages}
        className={`fixed right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 hover:bg-purple-600 text-white border border-zinc-800 transition-all z-30 shadow-2xl ${
          currentPage >= totalPages ? "opacity-30 cursor-not-allowed" : "hover:scale-110"
        }`}
        title="Page suivante (Flèche Droite / Espace)"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 px-5 py-2.5 rounded-full bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-md shadow-2xl text-xs font-semibold text-zinc-300">
        <button
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="hover:text-purple-400 disabled:opacity-30 disabled:hover:text-zinc-300"
        >
          Précédent
        </button>
        <span className="text-purple-400 font-bold">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={currentPage >= totalPages}
          className="hover:text-purple-400 disabled:opacity-30 disabled:hover:text-zinc-300"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};
