"use client";

import React, { use, useEffect, useState } from "react";
import { WebtoonReader } from "@/components/Reader/WebtoonReader";
import { PageReader } from "@/components/Reader/PageReader";
import { ReaderControls } from "@/components/Reader/ReaderControls";
import { Loader2, AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default function ReaderPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.jobId;

  const [title, setTitle] = useState<string>("Manga Traduit");
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [readerMode, setReaderMode] = useState<"webtoon" | "page">("webtoon");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    async function fetchPages() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/jobs/${jobId}/pages`);
        if (!res.ok) {
          throw new Error("Impossible de charger les pages du manga.");
        }
        const data = await res.json();
        setPages(data.pages || []);
        if (data.filename) {
          setTitle(data.filename.replace(/\.[^/.]+$/, ""));
        }
      } catch (err: any) {
        setError(err.message || "Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    }

    if (jobId) {
      fetchPages();
    }
  }, [jobId, API_BASE]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === "m") {
        setReaderMode((m) => (m === "webtoon" ? "page" : "webtoon"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-zinc-100 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <p className="text-zinc-400 font-medium">Chargement des pages traduites...</p>
      </div>
    );
  }

  if (error || pages.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-zinc-100 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Oups, lecture impossible</h2>
          <p className="text-zinc-400 max-w-md text-sm">{error || "Aucune page disponible pour ce manga."}</p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/25 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Retourner à l&apos;accueil</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0e] text-zinc-100">
      <ReaderControls
        title={title}
        readerMode={readerMode}
        setReaderMode={setReaderMode}
        zoom={zoom}
        setZoom={setZoom}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        jobId={jobId}
        currentPage={currentPage}
        totalPages={pages.length}
        showHelpModal={showHelpModal}
        setShowHelpModal={setShowHelpModal}
      />

      {readerMode === "webtoon" ? (
        <WebtoonReader
          jobId={jobId}
          pages={pages}
          zoom={zoom}
          onPageChange={setCurrentPage}
        />
      ) : (
        <PageReader
          jobId={jobId}
          pages={pages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          zoom={zoom}
        />
      )}
    </div>
  );
}
