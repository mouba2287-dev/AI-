"use client";

import React, { useState, useEffect } from "react";
import { UploadZone } from "@/components/UploadZone";
import { ProgressBar } from "@/components/ProgressBar";
import { Sparkles, Layers, FileCheck, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState<string>("queued");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!jobId || jobStatus === "completed" || jobStatus === "failed") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status/${jobId}`);
        if (!res.ok) throw new Error("Erreur de statut API");

        const data = await res.json();
        setJobStatus(data.status);
        setProgress(data.progress);
        setMessage(data.message);

        if (data.status === "failed") {
          setError(data.error || "Une erreur est survenue pendant la traduction.");
          setIsLoading(false);
        } else if (data.status === "completed") {
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Polling error:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [jobId, jobStatus, API_BASE]);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setProgress(2);
    setMessage("Téléversement du fichier en cours...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/translate`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Erreur serveur" }));
        throw new Error(errData.detail || "Erreur lors du téléversement");
      }

      const data = await res.json();
      setJobId(data.job_id);
      setJobStatus("queued");
      setProgress(5);
      setMessage("Fichier reçu ! Mise en file d'attente...");
    } catch (err: any) {
      setError(err.message || "Erreur de connexion avec le serveur.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-zinc-100 flex flex-col justify-between">
      <header className="border-b border-zinc-800/80 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-purple-600/30">
              O
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-purple-400 bg-clip-text text-transparent">
              ORKA
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manga & Manhwa AI Translator</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-8">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>MangaTranslate HD • Détection de bulles, OCR & Inpainting</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-zinc-100 tracking-tight leading-tight max-w-3xl">
          Traduis tes mangas en français{" "}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            en un clic
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-xl">
          Upload tes fichiers <strong>PDF</strong> ou <strong>CBZ</strong> en anglais. Obtiens des bulles nettes et lis le résultat directement en mode <strong>Webtoon</strong>.
        </p>

        <div className="w-full mt-8">
          {isLoading || jobId ? (
            <ProgressBar
              status={jobStatus}
              progress={progress}
              message={message}
              error={error}
              jobId={jobId}
            />
          ) : (
            <UploadZone onFileSelect={handleFileUpload} isLoading={isLoading} />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 w-full text-left">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-zinc-200 text-base mb-1">Qualité Pro AI</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Inpainting propre des bulles de dialogue et réécriture fluide du texte FR.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-zinc-200 text-base mb-1">Lecteur Webtoon</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Défilement vertical continu fluide optimisé pour mobile, tablette et PC.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-zinc-200 text-base mb-1">Support PDF & CBZ</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Conversion instantanée et re-création d&apos;archives CBZ téléchargeables.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        <p>ORKA Manga Translator © 2026 — Propulsé par BallonsTranslator & Next.js 15</p>
      </footer>
    </div>
  );
}
