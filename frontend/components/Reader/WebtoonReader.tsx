"use client";

import React, { useEffect, useRef, useState } from "react";

interface WebtoonReaderProps {
  jobId: string;
  pages: string[];
  zoom: number;
  onPageChange: (pageIndex: number) => void;
}

export const WebtoonReader: React.FC<WebtoonReaderProps> = ({
  jobId,
  pages,
  zoom,
  onPageChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      if (totalScrollHeight > 0) {
        const pct = Math.min(100, Math.max(0, (currentScroll / totalScrollHeight) * 100));
        setScrollProgress(pct);
      }

      localStorage.setItem(`orka_scroll_${jobId}`, currentScroll.toString());

      const viewportCenter = currentScroll + window.innerHeight / 2;
      for (let i = 0; i < pageRefs.current.length; i++) {
        const pageEl = pageRefs.current[i];
        if (pageEl) {
          const top = pageEl.offsetTop;
          const bottom = top + pageEl.offsetHeight;
          if (viewportCenter >= top && viewportCenter <= bottom) {
            onPageChange(i + 1);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [jobId, pages, onPageChange]);

  useEffect(() => {
    const savedScroll = localStorage.getItem(`orka_scroll_${jobId}`);
    if (savedScroll) {
      const scrollPos = parseFloat(savedScroll);
      setTimeout(() => {
        window.scrollTo({ top: scrollPos, behavior: "smooth" });
      }, 300);
    }
  }, [jobId]);

  return (
    <div className="relative min-h-screen bg-[#0d0d0e] pt-20 pb-24 flex flex-col items-center">
      <div className="fixed right-2 top-24 bottom-12 w-1.5 bg-zinc-800/60 rounded-full overflow-hidden z-30 pointer-events-none">
        <div
          className="w-full bg-purple-500 transition-all duration-150 rounded-full"
          style={{ height: `${scrollProgress}%` }}
        />
      </div>

      <div
        ref={containerRef}
        className="flex flex-col items-center justify-center transition-all duration-200"
        style={{ width: `${Math.round(100 * zoom)}%`, maxWidth: `${800 * zoom}px` }}
      >
        {pages.map((pageFilename, idx) => (
          <div
            key={pageFilename}
            ref={(el) => {
              pageRefs.current[idx] = el;
            }}
            className="relative w-full overflow-hidden bg-zinc-950 flex justify-center"
          >
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-medium text-zinc-400 z-10 select-none">
              {idx + 1}
            </span>

            <img
              src={`${API_BASE}/jobs/${jobId}/page/${pageFilename}`}
              alt={`Page ${idx + 1}`}
              className="w-full h-auto block object-contain select-none"
              loading={idx < 3 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
